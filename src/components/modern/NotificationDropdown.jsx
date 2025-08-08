import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, X, Calendar, Share, Users, Coffee } from 'lucide-react'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getTasksDueSoon, acceptTeamInvite, declineTeamInvite } from '../../lib/supabase'

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [tasksDue, setTasksDue] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
      loadTasksDue()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const loadNotifications = async () => {
    try {
      const { data, error } = await getUserNotifications()
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  const loadTasksDue = async () => {
    try {
      const { data, error } = await getTasksDueSoon()
      if (error) throw error
      setTasksDue(data || [])
    } catch (err) {
      console.error('Failed to load tasks due:', err)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleTeamInviteAction = async (notificationId, memberId, action) => {
    try {
      if (action === 'accept') {
        await acceptTeamInvite(memberId)
      } else {
        await declineTeamInvite(memberId)
      }
      await handleDeleteNotification(notificationId)
    } catch (err) {
      console.error('Failed to handle team invite:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_due':
        return <Calendar className="h-4 w-4 text-orange-500" />
      case 'board_shared':
        return <Share className="h-4 w-4 text-blue-500" />
      case 'team_invite':
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-slate-500" />
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length + tasksDue.length

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {/* Tasks Due Soon */}
        {tasksDue.length > 0 && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Tasks Due Soon
            </h4>
            <div className="space-y-2">
              {tasksDue.map((task) => (
                <div
                  key={task.id}
                  className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()} in {task.boards?.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notifications */}
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                          title="Delete"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Team Invite Actions */}
                    {notification.type === 'team_invite' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleTeamInviteAction(
                            notification.id, 
                            notification.data?.member_id, 
                            'accept'
                          )}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleTeamInviteAction(
                            notification.id, 
                            notification.data?.member_id, 
                            'decline'
                          )}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No notifications yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown
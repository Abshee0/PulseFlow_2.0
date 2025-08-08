import React, { useState } from 'react'
import { X, MoreHorizontal, Calendar, User, CheckCircle2, Circle, Edit, Trash2 } from 'lucide-react'
import { updateTask } from '../lib/supabase'

const TaskModal = ({ 
  task, 
  board,
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  onTaskUpdated 
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [status, setStatus] = useState(task?.status || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [subtasks, setSubtasks] = useState(task?.subtasks || [])

  const columns = board?.columns || []
  const completedSubtasks = subtasks.filter(subtask => subtask.isCompleted).length
  const totalSubtasks = subtasks.length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  }

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return

    setIsUpdatingStatus(true)
    try {
      await updateTask(task.id, { ...task, status: newStatus })
      setStatus(newStatus)
      onTaskUpdated?.()
    } catch (error) {
      console.error('Failed to update task status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSubtaskToggle = async (subtaskIndex) => {
    const updatedSubtasks = subtasks.map((subtask, index) => 
      index === subtaskIndex 
        ? { ...subtask, isCompleted: !subtask.isCompleted }
        : subtask
    )
    
    setSubtasks(updatedSubtasks)
    
    try {
      await updateTask(task.id, { ...task, subtasks: updatedSubtasks })
      onTaskUpdated?.()
    } catch (error) {
      console.error('Failed to update subtask:', error)
      // Revert on error
      setSubtasks(subtasks)
    }
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {task.title}
            </h2>
            {task.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 py-1 z-10">
                  <button
                    onClick={() => {
                      onEdit(task)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Task
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Task
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Task Details */}
          <div className="space-y-4 mb-6">
            {/* Priority and Status */}
            <div className="flex items-center gap-4">
              {task.priority && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  priorityColors[task.priority] || priorityColors.medium
                }`}>
                  {task.priority} priority
                </span>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {status}
                </span>
              </div>
            </div>

            {/* Due Date and Assignee */}
            <div className="flex items-center gap-6">
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {task.assignee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {task.assignee}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {totalSubtasks > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Progress
                </h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {completedSubtasks}/{totalSubtasks} completed
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                Subtasks ({completedSubtasks} of {totalSubtasks})
              </h3>
              <div className="space-y-2">
                {subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    onClick={() => handleSubtaskToggle(index)}
                  >
                    {subtask.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      subtask.isCompleted 
                        ? 'text-slate-500 dark:text-slate-400 line-through' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Change */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Current Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50"
            >
              {columns.map((column, index) => (
                <option key={index} value={column.name}>
                  {column.name}
                </option>
              ))}
            </select>
            {isUpdatingStatus && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Updating status...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
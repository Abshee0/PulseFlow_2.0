import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { createFeedback, getFeedback, subscribeFeedback } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const FeedbackModal = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      loadFeedback()
      
      // Subscribe to real-time updates
      const subscription = subscribeFeedback((payload) => {
        if (payload.eventType === 'INSERT') {
          setFeedback(prev => [payload.new, ...prev])
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [feedback])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadFeedback = async () => {
    try {
      const { data, error } = await getFeedback()
      if (error) {
        setError('Failed to load feedback')
      } else {
        setFeedback(data || [])
      }
    } catch (err) {
      setError('Failed to load feedback')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsLoading(true)
    setError('')

    try {
      await createFeedback(message.trim())
      setMessage('')
    } catch (err) {
      setError('Failed to send feedback')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Global Feedback
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Share your thoughts and suggestions with the community
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {feedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No feedback yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className={`flex gap-3 ${
                  item.user_id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {item.user_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    item.user_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-75">
                      {item.user_name}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatTime(item.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{item.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your feedback..."
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
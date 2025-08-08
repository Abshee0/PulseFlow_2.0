import React, { useState } from 'react'
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  CheckCircle2,
  Circle,
  User
} from 'lucide-react'

const ModernTask = ({ task, onClick, onUpdate, onDelete, isDragging }) => {
  const [showDetails, setShowDetails] = useState(false)

  const completedSubtasks = task.subtasks?.filter(subtask => subtask.isCompleted).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-5 flex-1 pr-2">
          {task.title}
        </h4>
        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      {task.priority && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            priorityColors[task.priority] || priorityColors.medium
          }`}>
            {task.priority}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Progress
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Subtasks Preview */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3 space-y-1">
          {task.subtasks.slice(0, 2).map((subtask, index) => (
            <div key={index} className="flex items-center gap-2">
              {subtask.isCompleted ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-3 w-3 text-slate-400 flex-shrink-0" />
              )}
              <span className={`text-xs ${
                subtask.isCompleted 
                  ? 'text-slate-500 dark:text-slate-400 line-through' 
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {subtask.title}
              </span>
            </div>
          ))}
          {task.subtasks.length > 2 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-5">
              +{task.subtasks.length - 2} more
            </p>
          )}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        {/* Left side - Icons */}
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {task.comments.length}
              </span>
            </div>
          )}
          
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {task.attachments.length}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {task.assignee.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModernTask
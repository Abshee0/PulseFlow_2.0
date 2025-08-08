import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Calendar, User } from 'lucide-react'
import { createTask, updateTask } from '../lib/supabase'
import { getTeamMembers } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { v4 as uuidv4 } from 'uuid'

const AddEditTaskModal = ({ 
  type = 'add',
  task = null,
  board,
  columnIndex = 0,
  isOpen, 
  onClose, 
  onTaskCreated,
  onTaskUpdated 
}) => {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [subtasks, setSubtasks] = useState([
    { id: uuidv4(), title: '', isCompleted: false }
  ])
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const columns = board?.columns || []
  const selectedColumnIndex = status ? columns.findIndex(col => col.name === status) : columnIndex

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers()
    }
  }, [isOpen])

  const loadTeamMembers = async () => {
    try {
      // For now, we'll just show "Me" option
      // In a full implementation, you'd load team members from user's teams
      setTeamMembers([])
    } catch (err) {
      console.error('Failed to load team members:', err)
    }
  }
  useEffect(() => {
    if (type === 'edit' && task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setStatus(task.status || (columns[columnIndex]?.name || ''))
      setPriority(task.priority || 'medium')
      setDueDate(task.dueDate || '')
      setAssignee(task.assignee || '')
      setSubtasks(task.subtasks?.length > 0 ? task.subtasks : [{ id: uuidv4(), title: '', isCompleted: false }])
    } else {
      // Reset for add mode
      setTitle('')
      setDescription('')
      setStatus(columns[columnIndex]?.name || '')
      setPriority('medium')
      setDueDate('')
      setAssignee('')
      setSubtasks([{ id: uuidv4(), title: '', isCompleted: false }])
    }
  }, [type, task, board, columnIndex, isOpen])

  const handleSubtaskChange = (id, newTitle) => {
    setSubtasks(prev => prev.map(subtask => 
      subtask.id === id ? { ...subtask, title: newTitle } : subtask
    ))
  }

  const handleAddSubtask = () => {
    setSubtasks(prev => [...prev, { id: uuidv4(), title: '', isCompleted: false }])
  }

  const handleRemoveSubtask = (id) => {
    if (subtasks.length > 1) {
      setSubtasks(prev => prev.filter(subtask => subtask.id !== id))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    if (!status) {
      setError('Please select a status')
      return
    }

    const validSubtasks = subtasks.filter(subtask => subtask.title.trim())

    setIsLoading(true)
    setError('')

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        board: status,
        priority,
        dueDate: dueDate || null,
        assignee: assignee.trim() || null,
        subtasks: validSubtasks.map(subtask => ({
          ...subtask,
          title: subtask.title.trim()
        })),
        board_id: board.id
      }

      if (type === 'add') {
        await createTask(taskData)
        onTaskCreated?.()
      } else {
        await updateTask(task.id, taskData)
        onTaskUpdated?.()
      }
      
      onClose()
    } catch (err) {
      setError(err.message || `Failed to ${type} task`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {type === 'edit' ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Task Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design homepage mockup"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              required
            />
          </div>

          {/* Task Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              >
                {columns.map((column, index) => (
                  <option key={index} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date and Assignee Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                <option value="Me">Me</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.profiles?.full_name || member.profiles?.email}>
                    {member.profiles?.full_name || member.profiles?.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Subtasks
            </label>
            <div className="space-y-3">
              {subtasks.map((subtask, index) => (
                <div key={subtask.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddSubtask}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Subtask
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                type === 'edit' ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditTaskModal
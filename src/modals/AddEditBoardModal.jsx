import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { createBoard, updateBoard } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const AddEditBoardModal = ({ 
  type = 'add', 
  board = null,
  isOpen, 
  onClose, 
  onBoardCreated,
  onBoardUpdated 
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [columns, setColumns] = useState([
    { id: uuidv4(), name: 'To Do', tasks: [] },
    { id: uuidv4(), name: 'In Progress', tasks: [] },
    { id: uuidv4(), name: 'Done', tasks: [] }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (type === 'edit' && board) {
      setName(board.name || '')
      setDescription(board.description || '')
      setColumns(board.columns || [])
    } else {
      // Reset for add mode
      setName('')
      setDescription('')
      setColumns([
        { id: uuidv4(), name: 'To Do', tasks: [] },
        { id: uuidv4(), name: 'In Progress', tasks: [] },
        { id: uuidv4(), name: 'Done', tasks: [] }
      ])
    }
  }, [type, board, isOpen])

  const handleColumnChange = (id, newName) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, name: newName } : col
    ))
  }

  const handleAddColumn = () => {
    setColumns(prev => [...prev, { id: uuidv4(), name: '', tasks: [] }])
  }

  const handleRemoveColumn = (id) => {
    if (columns.length > 1) {
      setColumns(prev => prev.filter(col => col.id !== id))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Board name is required')
      return
    }

    if (columns.some(col => !col.name.trim())) {
      setError('All column names are required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const boardData = {
        name: name.trim(),
        description: description.trim(),
        columns: columns.map(col => ({ ...col, name: col.name.trim() }))
      }

      if (type === 'add') {
        await createBoard(boardData)
        onBoardCreated?.()
      } else {
        await updateBoard(board.id, boardData)
        onBoardUpdated?.()
      }
      
      onClose()
    } catch (err) {
      setError(err.message || `Failed to ${type} board`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {type === 'edit' ? 'Edit Board' : 'Create New Board'}
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

          {/* Board Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Board Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Web Design Project"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              required
            />
          </div>

          {/* Board Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this board..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
            />
          </div>

          {/* Columns */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Board Columns
            </label>
            <div className="space-y-3">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) => handleColumnChange(column.id, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                    required
                  />
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(column.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddColumn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Column
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
                type === 'edit' ? 'Save Changes' : 'Create Board'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditBoardModal
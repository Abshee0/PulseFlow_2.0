import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, getUserBoards, shareBoard, getBoardTasks } from '../lib/supabase'
import ModernHeader from './modern/ModernHeader'
import ModernSidebar from './modern/ModernSidebar'
import ModernBoard from './modern/ModernBoard'
import ShareBoardModal from './modern/ShareBoardModal'
import AddEditBoardModal from '../modals/AddEditBoardModal'
import AddEditTaskModal from '../modals/AddEditTaskModal'
import TaskModal from '../modals/TaskModal'
import DeleteModal from '../modals/DeleteModal'
import FeedbackModal from './modern/FeedbackModal'
import ProfileModal from './modern/ProfileModal'
import TeamModal from './modern/TeamModal'
import BuyMeCoffeeModal from './modern/BuyMeCoffeeModal'

const Dashboard = () => {
  const { user } = useAuth()
  const [boards, setBoards] = useState([])
  const [activeBoard, setActiveBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Modal states
  const [showShareModal, setShowShareModal] = useState(false)
  const [showBoardModal, setShowBoardModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showCoffeeModal, setShowCoffeeModal] = useState(false)
  const [taskModalColumn, setTaskModalColumn] = useState(0)
  const [selectedTask, setSelectedTask] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [editingBoard, setEditingBoard] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    loadBoards()
  }, [user])

  const loadBoards = async () => {
    try {
      setLoading(true)
      const { data, error } = await getUserBoards()
      
      if (error) {
        console.error('Error loading boards:', error)
        return
      }

      // Transform data to match existing structure and load tasks
      const transformedBoards = await Promise.all(
        (data || []).map(async (board, index) => {
          // Load tasks for this board
          const { data: tasks, error: tasksError } = await getBoardTasks(board.id)
          
          if (tasksError) {
            console.error('Error loading tasks for board:', board.id, tasksError)
          }

          // Group tasks by status/column
          const columns = (board.columns || []).map(column => ({
            ...column,
            tasks: (tasks || []).filter(task => task.status === column.name)
          }))

          return {
            ...board,
            isActive: index === 0 && !activeBoard,
            columns
          }
        })
      )

      setBoards(transformedBoards)
      
      if (transformedBoards.length > 0 && !activeBoard) {
        setActiveBoard(transformedBoards[0])
      }
    } catch (error) {
      console.error('Error loading boards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBoardSelect = (board, index) => {
    const updatedBoards = boards.map((b, i) => ({
      ...b,
      isActive: i === index
    }))
    setBoards(updatedBoards)
    setActiveBoard(board)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const handleCreateBoard = () => {
    setEditingBoard(null)
    setShowBoardModal(true)
  }

  const handleEditBoard = (board) => {
    setEditingBoard(board)
    setShowBoardModal(true)
  }

  const handleDeleteBoard = (board) => {
    setDeleteItem({ type: 'board', item: board, title: board.name })
    setShowDeleteModal(true)
  }

  const handleCreateTask = (columnIndex = 0) => {
    setEditingTask(null)
    setTaskModalColumn(columnIndex)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleDeleteTask = (task) => {
    setDeleteItem({ type: 'task', item: task, title: task.title })
    setShowDeleteModal(true)
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setShowTaskDetailModal(true)
  }

  const handleShareBoard = async (boardId, email) => {
    try {
      await shareBoard(boardId, email)
      // Optionally refresh boards or show success message
    } catch (error) {
      throw error
    }
  }

  const handleTaskUpdate = (task) => {
    loadBoards()
  }

  const handleTaskDelete = (task) => {
    loadBoards()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ModernHeader
        currentBoard={activeBoard}
        onCreateTask={() => handleCreateTask()}
        onCreateBoard={handleCreateBoard}
        onShareBoard={() => setShowShareModal(true)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onShowProfile={() => setShowProfileModal(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ModernSidebar
          boards={boards}
          activeBoard={activeBoard}
          onBoardSelect={handleBoardSelect}
          onCreateBoard={handleCreateBoard}
          onShowFeedback={() => setShowFeedbackModal(true)}
          onShowTeam={() => setShowTeamModal(true)}
          onShowCoffee={() => setShowCoffeeModal(true)}
          onShowProfile={() => setShowProfileModal(true)}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <ModernBoard
          board={activeBoard}
          onTaskCreate={handleCreateTask}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onEditBoard={handleEditBoard}
        />
      </div>

      {/* Modals */}
      {showShareModal && activeBoard && (
        <ShareBoardModal
          board={activeBoard}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleShareBoard}
        />
      )}

      {showBoardModal && (
        <AddEditBoardModal
          type={editingBoard ? 'edit' : 'add'}
          board={editingBoard}
          isOpen={showBoardModal}
          onClose={() => {
            setShowBoardModal(false)
            setEditingBoard(null)
          }}
          onBoardCreated={loadBoards}
          onBoardUpdated={loadBoards}
        />
      )}

      {showTaskModal && (
        <AddEditTaskModal
          type={editingTask ? 'edit' : 'add'}
          task={editingTask}
          board={activeBoard}
          columnIndex={taskModalColumn}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onTaskCreated={loadBoards}
          onTaskUpdated={loadBoards}
        />
      )}

      {showTaskDetailModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          board={activeBoard}
          isOpen={showTaskDetailModal}
          onClose={() => {
            setShowTaskDetailModal(false)
            setSelectedTask(null)
          }}
          onEdit={(task) => {
            setShowTaskDetailModal(false)
            handleEditTask(task)
          }}
          onDelete={(task) => {
            setShowTaskDetailModal(false)
            handleDeleteTask(task)
          }}
          onTaskUpdated={loadBoards}
        />
      )}

      {showDeleteModal && deleteItem && (
        <DeleteModal
          type={deleteItem.type}
          title={deleteItem.title}
          item={deleteItem.item}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeleteItem(null)
          }}
          onDeleted={loadBoards}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showTeamModal && (
        <TeamModal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
        />
      )}

      {showCoffeeModal && (
        <BuyMeCoffeeModal
          isOpen={showCoffeeModal}
          onClose={() => setShowCoffeeModal(false)}
        />
      )}
    </div>
  )
}

export default Dashboard
import { createSlice } from '@reduxjs/toolkit'

const initialState = []

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    addBoard: (state, action) => {
      const { name, newColumns } = action.payload
      const newBoard = {
        id: Date.now().toString(),
        name,
        columns: newColumns,
        isActive: state.length === 0
      }
      state.forEach(board => {
        board.isActive = false
      })
      state.push(newBoard)
    },
    editBoard: (state, action) => {
      const { name, newColumns } = action.payload
      const board = state.find(board => board.isActive)
      if (board) {
        board.name = name
        board.columns = newColumns
      }
    },
    deleteBoard: (state) => {
      const boardIndex = state.findIndex(board => board.isActive)
      if (boardIndex !== -1) {
        state.splice(boardIndex, 1)
        if (state.length > 0) {
          state[0].isActive = true
        }
      }
    },
    setBoardActive: (state, action) => {
      state.forEach((board, index) => {
        board.isActive = index === action.payload
      })
    },
    addTask: (state, action) => {
      const { title, description, subtasks, status, newColIndex } = action.payload
      const board = state.find(board => board.isActive)
      if (board && board.columns[newColIndex]) {
        const newTask = {
          id: Date.now().toString(),
          title,
          description,
          subtasks,
          status
        }
        board.columns[newColIndex].tasks.push(newTask)
      }
    },
    editTask: (state, action) => {
      const { title, description, subtasks, status, taskIndex, prevColIndex, newColIndex } = action.payload
      const board = state.find(board => board.isActive)
      if (board) {
        const task = board.columns[prevColIndex].tasks[taskIndex]
        task.title = title
        task.description = description
        task.subtasks = subtasks
        task.status = status
        
        if (prevColIndex !== newColIndex) {
          board.columns[prevColIndex].tasks.splice(taskIndex, 1)
          board.columns[newColIndex].tasks.push(task)
        }
      }
    },
    deleteTask: (state, action) => {
      const { taskIndex, colIndex } = action.payload
      const board = state.find(board => board.isActive)
      if (board && board.columns[colIndex]) {
        board.columns[colIndex].tasks.splice(taskIndex, 1)
      }
    },
    setSubtaskCompleted: (state, action) => {
      const { taskIndex, colIndex, subtaskIndex } = action.payload
      const board = state.find(board => board.isActive)
      if (board && board.columns[colIndex] && board.columns[colIndex].tasks[taskIndex]) {
        const subtask = board.columns[colIndex].tasks[taskIndex].subtasks[subtaskIndex]
        subtask.isCompleted = !subtask.isCompleted
      }
    },
    setTaskStatus: (state, action) => {
      const { taskIndex, colIndex, newColIndex, status } = action.payload
      const board = state.find(board => board.isActive)
      if (board) {
        const task = board.columns[colIndex].tasks[taskIndex]
        task.status = status
        
        if (colIndex !== newColIndex) {
          board.columns[colIndex].tasks.splice(taskIndex, 1)
          board.columns[newColIndex].tasks.push(task)
        }
      }
    },
    dragTask: (state, action) => {
      const { dragIndex, hoverIndex, sourceColIndex, targetColIndex } = action.payload
      const board = state.find(board => board.isActive)
      if (board) {
        const sourceColumn = board.columns[sourceColIndex]
        const targetColumn = board.columns[targetColIndex]
        
        if (sourceColIndex === targetColIndex) {
          // Reorder within same column
          const [draggedTask] = sourceColumn.tasks.splice(dragIndex, 1)
          sourceColumn.tasks.splice(hoverIndex, 0, draggedTask)
        } else {
          // Move between columns
          const [draggedTask] = sourceColumn.tasks.splice(dragIndex, 1)
          draggedTask.status = targetColumn.name
          targetColumn.tasks.splice(hoverIndex, 0, draggedTask)
        }
      }
    }
  }
})

export default boardsSlice
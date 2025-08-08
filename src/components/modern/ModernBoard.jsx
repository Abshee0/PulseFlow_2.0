import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Plus, MoreHorizontal } from 'lucide-react'
import ModernTask from './ModernTask'
import { updateTask } from '../../lib/supabase'

const ModernBoard = ({ board, onTaskCreate, onTaskClick, onTaskUpdate, onTaskDelete, onEditBoard }) => {
  const [draggedTask, setDraggedTask] = useState(null)

  const handleDragStart = (start) => {
    setDraggedTask(start.draggableId)
  }

  const handleDragEnd = async (result) => {
    setDraggedTask(null)
    
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Extract column indices from droppableId
    const sourceColumnIndex = parseInt(source.droppableId.split('-')[1])
    const destinationColumnIndex = parseInt(destination.droppableId.split('-')[1])
    
    // Get the task being moved
    const sourceColumn = board.columns[sourceColumnIndex]
    const task = sourceColumn.tasks[source.index]
    
    if (!task) return
    
    // Update task status if moving to different column
    if (sourceColumnIndex !== destinationColumnIndex) {
      const destinationColumn = board.columns[destinationColumnIndex]
      try {
        await updateTask(task.id, {
          ...task,
          status: destinationColumn.name,
          board: destinationColumn.name
        })
        onTaskUpdate?.()
      } catch (error) {
        console.error('Failed to update task status:', error)
      }
    }
  }

  if (!board || !board.columns) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No board selected
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Select a board from the sidebar to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="h-full overflow-x-auto">
          <div className="flex gap-6 p-6 h-full min-w-max">
            {board.columns.map((column, columnIndex) => (
              <div key={column.id || columnIndex} className="flex-shrink-0 w-80">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {column.name}
                        </h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                          {column.tasks?.length || 0}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <Droppable droppableId={`column-${columnIndex}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 space-y-3 overflow-y-auto ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {column.tasks?.map((task, taskIndex) => (
                          <Draggable
                            key={task.id || `${columnIndex}-${taskIndex}`}
                            draggableId={`task-${columnIndex}-${taskIndex}`}
                            index={taskIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${
                                  snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                                }`}
                              >
                                <ModernTask
                                  task={task}
                                  onClick={() => onTaskClick(task)}
                                  onUpdate={onTaskUpdate}
                                  onDelete={onTaskDelete}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Add Task Button */}
                        <button
                          onClick={() => onTaskCreate(columnIndex)}
                          className="w-full p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add task</span>
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}

            {/* Add Column Button */}
            <div className="flex-shrink-0 w-80">
              <button
                onClick={() => onEditBoard(board)}
                className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Plus className="h-6 w-6" />
                <span className="font-medium">Add column</span>
              </button>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

export default ModernBoard
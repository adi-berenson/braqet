'use client'

import { useState } from 'react'
import MeasureIcon from '../icons/MeasureIcon'

interface CircuitCanvasProps {
  draggedTool: string | null
  onDragEnd: () => void
}

interface DroppedTool {
  id: string
  type: string
  x: number
  y: number
  symbol: string
}

export default function CircuitCanvas({ draggedTool, onDragEnd }: CircuitCanvasProps) {
  const [droppedTools, setDroppedTools] = useState<DroppedTool[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const toolType = e.dataTransfer.getData('text/plain')
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Get symbol for the tool
    const toolSymbols: { [key: string]: string } = {
      'qubit': '|x⟩',
      'x-gate': 'X',
      'h-gate': 'H',
      'cnot-gate': '⊕',
      'measure': '⌒',
      'oracle': 'Uf'
    }
    
    const newTool: DroppedTool = {
      id: `${toolType}-${Date.now()}`,
      type: toolType,
      x: x - 30, // Center the tool
      y: y - 20,
      symbol: toolSymbols[toolType] || '?'
    }
    
    setDroppedTools(prev => [...prev, newTool])
    onDragEnd()
  }

  const clearCanvas = () => {
    setDroppedTools([])
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-200">Circuit Canvas</h2>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
        >
          Clear Canvas
        </button>
      </div>

      {/* Canvas Area */}
      <div
        className={`flex-1 border-2 border-dashed rounded-lg relative overflow-hidden transition-all duration-200 ${
          isDragOver 
            ? 'border-purple-400 bg-purple-900/20' 
            : 'border-purple-700/50 bg-gray-800/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

        {/* Dropped Tools */}
        {droppedTools.map((tool) => (
          <div
            key={tool.id}
            className="absolute bg-gray-700 border border-purple-500 rounded-lg p-3 shadow-lg cursor-move hover:bg-gray-600 transition-colors duration-200"
            style={{ left: tool.x, top: tool.y }}
          >
            {tool.type === 'measure' ? (
              <MeasureIcon 
                width={40} 
                height={40} 
                className="text-purple-200"
              />
            ) : (
              <span className="text-purple-200 font-mono text-lg">{tool.symbol}</span>
            )}
          </div>
        ))}

        {/* Drop Zone Message */}
        {droppedTools.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-purple-400/60">
              <div className="text-6xl mb-4">⚛️</div>
              <p className="text-lg font-medium">Drop quantum tools here to build your circuit</p>
              <p className="text-sm mt-2">Drag from the floating tool panel at the bottom</p>
            </div>
          </div>
        )}

        {/* Drag Over Indicator */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/30 backdrop-blur-sm">
            <div className="text-purple-200 text-xl font-medium">
              Drop {draggedTool} here
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-3 bg-gray-800/50 border border-purple-700/30 rounded-lg">
        <div className="flex justify-between items-center text-sm text-purple-300">
          <span>Tools placed: {droppedTools.length}</span>
          <span>Quantum wires: 5</span>
          <span className="font-mono">State: |ψ⟩ = α|00000⟩ + β|00001⟩ + ...</span>
        </div>
      </div>
    </div>
  )
}

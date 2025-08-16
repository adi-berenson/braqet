'use client'

import { useState } from 'react'
import ToolPanel from './components/ToolPanel'
import CircuitCanvas from './components/CircuitCanvas'

export default function Home() {
  const [draggedTool, setDraggedTool] = useState<string | null>(null)

  return (
    <div className="h-screen bg-gray-900 text-purple-100 relative flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-700/30 flex-shrink-0">
        <h1 className="text-2xl font-bold text-purple-200">
          Quantum Circuit Editor
        </h1>
      </div>

      {/* Main Circuit Area */}
      <div className="flex-1 p-6 pb-32 overflow-hidden">
        <CircuitCanvas draggedTool={draggedTool} onDragEnd={() => setDraggedTool(null)} />
      </div>

      {/* Floating Tool Panel */}
      <ToolPanel onDragStart={setDraggedTool} />
    </div>
  )
}

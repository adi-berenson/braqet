'use client'

import { useState } from 'react'
import ToolPanel from './components/ToolPanel'
import CircuitCanvas from './components/CircuitCanvas'
import EquationCanvas from './components/EquationCanvas'

export default function Home() {
  const [draggedTool, setDraggedTool] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'circuit' | 'equation'>('circuit')

  return (
    <div className="h-screen bg-gray-900 text-purple-100 relative flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-700/30 flex-shrink-0">
        <h1 className="text-2xl font-bold text-purple-200 mb-4">
          Quantum Circuit Editor
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('circuit')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'circuit'
                ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                : 'bg-gray-800 text-purple-300 hover:bg-gray-700 hover:text-purple-200'
            }`}
          >
            Circuit
          </button>
          <button
            onClick={() => setActiveTab('equation')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'equation'
                ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                : 'bg-gray-800 text-purple-300 hover:bg-gray-700 hover:text-purple-200'
            }`}
          >
            Equation
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'circuit' && (
        <>
          {/* Main Circuit Area */}
          <div className="flex-1 p-6 pb-32 overflow-hidden">
            <CircuitCanvas draggedTool={draggedTool} onDragEnd={() => setDraggedTool(null)} />
          </div>

          {/* Floating Tool Panel */}
          <ToolPanel onDragStart={setDraggedTool} />
        </>
      )}

      {activeTab === 'equation' && (
        <EquationCanvas />
      )}
    </div>
  )
}

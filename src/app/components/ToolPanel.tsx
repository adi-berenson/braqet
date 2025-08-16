'use client'

import { useState } from 'react'
import MeasureIcon from '../icons/MeasureIcon'
import QubitXIcon from '../icons/QubitXIcon'

interface ToolPanelProps {
  onDragStart: (tool: string) => void
}

interface QuantumTool {
  id: string
  name: string
  symbol: string
  description: string
  svg?: React.ReactNode
}

const quantumTools: QuantumTool[] = [
  {
    id: 'qubit',
    name: 'Qubit',
    symbol: '|x⟩',
    description: 'Quantum bit in state |x⟩',
    svg: <QubitXIcon width={22} height={22} className="text-purple-200" />
  },
  {
    id: 'x-gate',
    name: 'X Gate',
    symbol: 'X',
    description: 'Pauli-X (NOT) gate'
  },
  {
    id: 'h-gate',
    name: 'H Gate',
    symbol: 'H',
    description: 'Hadamard gate'
  },
  {
    id: 'cnot-gate',
    name: 'CNOT Gate',
    symbol: '⊕',
    description: 'Controlled-NOT gate'
  },
  {
    id: 'measure',
    name: 'Measure',
    symbol: '⌒',
    description: 'Measurement operation',
    svg: <MeasureIcon width={34} height={34} className="text-purple-200 mb-2" />
  },
  {
    id: 'oracle',
    name: 'Oracle',
    symbol: 'Uf',
    description: 'Oracle function: |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩'
  }
]

export default function ToolPanel({ onDragStart }: ToolPanelProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    e.dataTransfer.setData('text/plain', toolId)
    onDragStart(toolId)
  }

  return (
    <>
      {/* Floating Tool Panel */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-800/95 backdrop-blur-sm border border-purple-600/40 rounded-2xl p-3 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center gap-2">
            {quantumTools.map((tool) => (
              <div
                key={tool.id}
                className="relative"
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                {/* Tool Icon */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, tool.id)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 border border-purple-600/40 hover:border-purple-500/60 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  {tool.svg ? (
                    tool.svg
                  ) : (
                    <span className="text-purple-200 font-mono text-lg select-none">
                      {tool.symbol}
                    </span>
                  )}
                </div>

                {/* Tooltip */}
                {hoveredTool === tool.id && (
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-60">
                    <div className="bg-gray-900 border border-purple-600/60 rounded-lg p-3 shadow-xl min-w-max">
                      <div className="text-purple-200 font-medium text-sm mb-1">
                        {tool.name}
                      </div>
                      <div className="text-gray-300 text-xs leading-relaxed max-w-48">
                        {tool.description}
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-600/60"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dirac Notation Reference - Floating Panel */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-gray-800/95 backdrop-blur-sm border border-purple-600/40 rounded-xl p-4 shadow-xl shadow-purple-500/10 max-w-xs">
          <h3 className="text-sm font-semibold text-purple-300 mb-3">Dirac Notation</h3>
          <div className="text-xs text-gray-400 space-y-1 font-mono">
            <div>|0⟩ = [1, 0]ᵀ</div>
            <div>|1⟩ = [0, 1]ᵀ</div>
            <div>|+⟩ = (|0⟩ + |1⟩)/√2</div>
            <div>|−⟩ = (|0⟩ − |1⟩)/√2</div>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'

interface FractionElement {
  type: 'fraction'
  numerator: string
  denominator: string
  id: string
}
interface TextElement {
  type: 'text'
  content: string
  id: string
}
type EquationElement = FractionElement | TextElement

export default function EquationCanvas() {
  const [currentInput, setCurrentInput] = useState('')
  const currentInputRef = useRef('')              // <-- mirror
  useEffect(() => { currentInputRef.current = currentInput }, [currentInput])

  const [elements, setElements] = useState<EquationElement[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in real inputs/textareas
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const value = currentInputRef.current        // <-- always fresh
      // console.log("Current input: ", value)

      if (e.key === 'Enter') {
        e.preventDefault()
        handleEnterPress(value)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        setCurrentInput(prev => prev.slice(0, -1))
      } else if (e.key.length === 1 && /[a-zA-Z0-9\/+\-*\()=\s]/.test(e.key)) {
        e.preventDefault()
        setCurrentInput(prev => prev + e.key)
      }
    }

    // focus canvas on mount
    canvasRef.current?.focus()

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // safe: we read latest via ref

  const handleEnterPress = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    // alphanumeric/alphanumeric
    const m = trimmed.match(/^([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)

    if (m) {
      const newFraction: FractionElement = {
        type: 'fraction',
        numerator: m[1],
        denominator: m[2],
        id: Date.now().toString()
      }
      setElements(prev => [...prev, newFraction])
    } else {
      // IMPORTANT: use the parameter, not state
      const newText: TextElement = {
        type: 'text',
        content: trimmed,
        id: Date.now().toString()
      }
      setElements(prev => [...prev, newText])
    }

    setCurrentInput('') // clears state + ref via effect
  }

  const handleCanvasClick = () => canvasRef.current?.focus()

  return (
    <div className="flex-1 p-6 overflow-hidden">
      {/* Main Canvas Area */}
      <div
        ref={canvasRef}
        className="w-full h-3/4 bg-gray-800 rounded-lg border border-purple-700/30 p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-text"
        tabIndex={0}
        onClick={handleCanvasClick}
      >
        <div className="text-purple-300 text-sm mb-4">
          Click here and start typing equations. Use format like "a/b" and press Enter to create fractions.
        </div>

        {/* Rendered Equations */}
        <div className="flex flex-wrap gap-4 items-center">
          {elements.map((el) => (
            <div key={el.id} className="inline-block">
              {el.type === 'fraction' ? (
                <div className="text-center text-white">
                  <div className="text-lg leading-tight">{el.numerator}</div>
                  <div className="border-t border-white w-full my-1"></div>
                  <div className="text-lg leading-tight">{el.denominator}</div>
                </div>
              ) : (
                <span className="text-white text-lg">{el.content}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input Display */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-purple-700/30">
        <div className="text-purple-300 text-sm mb-2">Current input:</div>
        <div className="bg-gray-800 p-3 rounded border border-gray-600 min-h-[2.5rem] flex items-center">
          <span className="text-white font-mono text-lg">
            {currentInput || <span className="text-gray-500">Type here...</span>}
          </span>
          <span className="text-purple-400 ml-1 animate-pulse">|</span>
        </div>
        <div className="text-purple-400 text-xs mt-2">
          Press Enter to convert fractions (e.g., "a/b" becomes a visual fraction)
        </div>
      </div>
    </div>
  )
}
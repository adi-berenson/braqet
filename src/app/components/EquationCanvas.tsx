'use client'

import { useState, useEffect, useRef } from 'react'
import { EquationElement, ExpressionState, FractionElement, NumericElement } from '../utils/types'
import { ExpressionPatterns } from '../utils/expressionPatterns'
import { ExpressionValidator } from '../utils/expressionValidator'

export default function EquationCanvas() {
  const [currentInput, setCurrentInput] = useState('')
  const currentInputRef = useRef('')              // <-- mirror
  useEffect(() => { currentInputRef.current = currentInput }, [currentInput])

  const [elements, setElements] = useState<EquationElement[]>([])
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [expressionState, setExpressionState] = useState<ExpressionState>('valid')
  const expressionStateRef = useRef<ExpressionState>('valid')
  const canvasRef = useRef<HTMLDivElement>(null)

  // Update the ref whenever expressionState changes
  useEffect(() => {
    expressionStateRef.current = expressionState
  }, [expressionState])

  // Function to determine what type the last element on canvas is
  const getLastElementType = () => ExpressionValidator.getLastElementType(elements)

  // Update expression state whenever input changes
  useEffect(() => {
    const state = ExpressionValidator.evaluateExpressionState(elements, currentInput)
    setExpressionState(state)
  }, [currentInput, elements])

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
      } else if (e.key.length === 1 && /[a-zA-Z0-9\/+\-*:\()=\s]/.test(e.key)) {
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

    console.log("Expression state: ", expressionStateRef.current)
    console.log("Trimmed input: ", trimmed)
    
    // Use the ref to get the current expressionState value
    if (expressionStateRef.current === 'invalid') {
      setValidationMessage('Invalid expression: Please correct your input before pressing Enter')
      setTimeout(() => setValidationMessage(''), 3000)
      // Don't clear input - let user edit it
      return
    }

    // Clear any previous validation message
    setValidationMessage('')

    // Use the pattern matcher to create elements
    const newElements = ExpressionPatterns.createElements(trimmed)
    
    if (newElements.length > 0) {
      setElements(prev => [...prev, ...newElements])
      setCurrentInput('') // Only clear input when successfully added to canvas
    } else {
      // Unrecognized pattern - don't add to canvas
      setValidationMessage('Invalid pattern: Input not recognized as a valid mathematical expression')
      setTimeout(() => setValidationMessage(''), 3000)
      // Don't clear input - let user edit it
      return
    }
  }

  const handleCanvasClick = () => canvasRef.current?.focus()

  const resetEquation = () => {
    setElements([])
    setCurrentInput('')
    setValidationMessage('')
    setExpressionState('valid')
  }

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
          Click here and start typing equations. Enter fractions and operations step by step.
        </div>

        {/* Rendered Equations */}
        <div className="flex flex-wrap gap-4 items-center">
          {elements.map((el) => (
            <div key={el.id} className="inline-block">
              {el.type === 'fraction' ? (
                <div className="text-center text-white">
                  <div className="text-lg leading-tight">{el.numerator.content}</div>
                  <div className="border-t border-white w-full my-1"></div>
                  <div className="text-lg leading-tight">{el.denominator.content}</div>
                </div>
              ) : (
                <span className={`text-white flex items-center h-full px-2 ${
                  /^[a-zA-Z]$/.test(el.content) 
                    ? 'text-xl font-normal' // Single variables: normal weight, aligned to center
                    : 'text-xl font-semibold' // Operations: bold
                }`}>
                  {el.content}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Reset Button */}
        {elements.length > 0 && (
          <div className="mt-4">
            <button
              onClick={resetEquation}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Reset Equation
            </button>
          </div>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded-lg">
            <p className="text-red-200 text-sm">{validationMessage}</p>
          </div>
        )}

        {/* Debug State Display - Temporary for testing */}
        <div className="mt-4 p-3 bg-blue-800 border border-blue-600 rounded-lg">
          <div className="text-blue-200 text-xs mb-2">Debug State (for testing):</div>
          <div className="text-blue-100 text-sm space-y-1">
            <div>Canvas elements: {elements.length}</div>
            <div>Last element type: <span className="font-mono bg-blue-700 px-2 py-1 rounded">{getLastElementType()}</span></div>
            <div>Current input: <span className="font-mono bg-blue-700 px-2 py-1 rounded">"{currentInput}"</span></div>
            <div>Expression state: <span className={`font-mono px-2 py-1 rounded ${
              expressionState === 'valid' ? 'bg-green-700 text-green-100' : 
              expressionState === 'inter' ? 'bg-yellow-700 text-yellow-100' : 
              'bg-red-700 text-red-100'
            }`}>
              {expressionState.toUpperCase()}
            </span></div>
            <div>Can enter: <span className={`font-mono px-2 py-1 rounded ${
              expressionState !== 'invalid' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
            }`}>
              {expressionState !== 'invalid' ? 'YES' : 'NO'}
            </span></div>
          </div>
        </div>
      </div>

      {/* Input Display */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-purple-700/30">
        <div className="text-purple-300 text-sm mb-2">Current input:</div>
        <div className={`p-3 rounded border min-h-[2.5rem] flex items-center ${
          expressionState === 'invalid' 
            ? 'bg-red-900 border-red-600' 
            : 'bg-gray-800 border-gray-600'
        }`}>
          <span className={`font-mono text-lg ${
            expressionState === 'invalid' ? 'text-red-200' : 'text-white'
          }`}>
            {currentInput || <span className="text-gray-500">Type here...</span>}
          </span>
          <span className={`ml-1 animate-pulse ${
            expressionState === 'invalid' ? 'text-red-400' : 'text-purple-400'
          }`}>|</span>
        </div>
        <div className={`text-xs mt-2 ${
          expressionState === 'invalid' ? 'text-red-400' : 'text-purple-400'
        }`}>
          {expressionState === 'invalid' 
            ? 'Invalid expression - please correct your input before pressing Enter'
            : elements.length === 0 
            ? 'Enter a fraction (e.g., "a/b"), variable (e.g., "x"), operation (+ - * : for division), or expression (e.g., "a/b+x")'
            : getLastElementType() === 'fraction'
            ? 'Enter an operation (+, -, *, : for division) or variable (e.g., "x")'
            : 'Enter a fraction (e.g., "c/d") or variable (e.g., "x")'
          }
        </div>
      </div>
    </div>
  )
}
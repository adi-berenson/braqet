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

type ExpressionState = 'valid' | 'invalid' | 'inter'

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
  const getLastElementType = (): 'empty' | 'fraction' | 'operation' => {
    if (elements.length === 0) return 'empty'
    const lastElement = elements[elements.length - 1]
    return lastElement.type === 'fraction' ? 'fraction' : 'operation'
  }

  // Function to evaluate the complete expression state (canvas + current input)
  const evaluateExpressionState = (input: string): ExpressionState => {
    const trimmed = input.trim()
    
    // Create a hypothetical sequence: canvas elements + potential new input
    const potentialElements = [...elements]
    
    // Parse the input and add appropriate elements
    if (trimmed) {
      // Check if input is a complete expression like "a/b + c/d"
      const fullExpressionMatch = trimmed.match(/^([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\s*([\+\-\*\/])\s*([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)
      if (fullExpressionMatch) {
        // Add all elements from the full expression
        potentialElements.push(
          { type: 'fraction', numerator: fullExpressionMatch[1], denominator: fullExpressionMatch[2], id: 'temp-1' },
          { type: 'text', content: fullExpressionMatch[3], id: 'temp-2' },
          { type: 'fraction', numerator: fullExpressionMatch[4], denominator: fullExpressionMatch[5], id: 'temp-3' }
        )
      } else {
        // Check for compound patterns like "+a/b" or "+x"
        const operationFractionMatch = trimmed.match(/^([\+\-\*\/])\s*([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)
        const operationVariableMatch = trimmed.match(/^([\+\-\*\/])\s*([a-zA-Z0-9])$/)
        
        if (operationFractionMatch) {
          potentialElements.push(
            { type: 'text', content: operationFractionMatch[1], id: 'temp-op' },
            { type: 'fraction', numerator: operationFractionMatch[2], denominator: operationFractionMatch[3], id: 'temp-frac' }
          )
        } else if (operationVariableMatch) {
          potentialElements.push(
            { type: 'text', content: operationVariableMatch[1], id: 'temp-op' },
            { type: 'text', content: operationVariableMatch[2], id: 'temp-var' }
          )
        } else {
          // Check for single patterns
          const fractionMatch = trimmed.match(/^([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)
          const operationMatch = trimmed.match(/^[\+\-\*\/]$/)
          const variableMatch = trimmed.match(/^[a-zA-Z0-9]$/)
          
          if (fractionMatch) {
            potentialElements.push({ type: 'fraction', numerator: fractionMatch[1], denominator: fractionMatch[2], id: 'temp' })
          } else if (operationMatch) {
            potentialElements.push({ type: 'text', content: trimmed, id: 'temp' })
          } else if (variableMatch) {
            potentialElements.push({ type: 'text', content: trimmed, id: 'temp' })
          } else {
            // Unrecognized pattern
            return 'invalid'
          }
        }
      }
    }
    
    // Now validate the sequence: element → operation → element → operation → ... → element
    if (potentialElements.length === 0) {
      return 'valid' // Empty is valid
    }
    
    // Helper function to check if an element is an "element" (fraction or variable)
    const isElement = (el: EquationElement) => 
      el.type === 'fraction' || (el.type === 'text' && /^[a-zA-Z0-9]$/.test(el.content))
    
    // Helper function to check if an element is an operation
    const isOperation = (el: EquationElement) => 
      el.type === 'text' && /^[\+\-\*\/]$/.test(el.content)
    
    // Validate the pattern: should alternate element → operation → element...
    for (let i = 0; i < potentialElements.length; i++) {
      const el = potentialElements[i]
      
      if (i % 2 === 0) {
        // Even indices should be elements (fractions or variables)
        if (!isElement(el)) {
          return 'invalid'
        }
      } else {
        // Odd indices should be operations
        if (!isOperation(el)) {
          return 'invalid'
        }
      }
    }
    
    // Check completion state
    const lastElement = potentialElements[potentialElements.length - 1]
    
    if (isElement(lastElement)) {
      // Ends with element - this is valid (complete expression)
      return 'valid'
    } else if (isOperation(lastElement)) {
      // Ends with operation - this is intermediate (waiting for next element)
      return 'inter'
    } else {
      return 'invalid'
    }
  }

  // Function to validate if the current input is legal given the canvas state
  const isValidInput = (input: string): boolean => {
    const state = evaluateExpressionState(input)
    return state === 'valid' || state === 'inter'
  }

  // Update expression state whenever input changes
  useEffect(() => {
    const state = evaluateExpressionState(currentInput)
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

    // Check for recognized patterns only - reject unrecognized patterns
    const additionMatch = trimmed.match(/^([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\s*([\+\-\*\/])\s*([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)
    const operationFractionMatch = trimmed.match(/^([\+\-\*\/])\s*([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)
    const operationVariableMatch = trimmed.match(/^([\+\-\*\/])\s*([a-zA-Z0-9])$/)
    const singleFractionMatch = trimmed.match(/^([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/)
    const operationMatch = trimmed.match(/^[\+\-\*\/]$/)
    const singleVariableMatch = trimmed.match(/^[a-zA-Z0-9]$/)
    
    // Only process recognized patterns
    if (additionMatch && elements.length === 0) {
      const newElements: EquationElement[] = [
        {
          type: 'fraction',
          numerator: additionMatch[1],
          denominator: additionMatch[2],
          id: `${Date.now()}-1`
        },
        {
          type: 'text',
          content: additionMatch[3], // This captures the operation
          id: `${Date.now()}-2`
        },
        {
          type: 'fraction',
          numerator: additionMatch[4],
          denominator: additionMatch[5],
          id: `${Date.now()}-3`
        }
      ]
      setElements(prev => [...prev, ...newElements])
      setCurrentInput('') // Only clear input when successfully added to canvas
    } else if (operationFractionMatch) {
      // Add operation and fraction separately
      const newElements: EquationElement[] = [
        {
          type: 'text',
          content: operationFractionMatch[1],
          id: `${Date.now()}-1`
        },
        {
          type: 'fraction',
          numerator: operationFractionMatch[2],
          denominator: operationFractionMatch[3],
          id: `${Date.now()}-2`
        }
      ]
      setElements(prev => [...prev, ...newElements])
      setCurrentInput('') // Only clear input when successfully added to canvas
    } else if (operationVariableMatch) {
      // Add operation and variable separately
      const newElements: EquationElement[] = [
        {
          type: 'text',
          content: operationVariableMatch[1],
          id: `${Date.now()}-1`
        },
        {
          type: 'text',
          content: operationVariableMatch[2],
          id: `${Date.now()}-2`
        }
      ]
      setElements(prev => [...prev, ...newElements])
      setCurrentInput('') // Only clear input when successfully added to canvas
    } else if (singleFractionMatch) {
      const newFraction: FractionElement = {
        type: 'fraction',
        numerator: singleFractionMatch[1],
        denominator: singleFractionMatch[2],
        id: Date.now().toString()
      }
      setElements(prev => [...prev, newFraction])
      setCurrentInput('') // Only clear input when successfully added to canvas
    } else if (singleVariableMatch) {
      const newVariable: TextElement = {
        type: 'text',
        content: trimmed,
        id: Date.now().toString()
      }
      setElements(prev => [...prev, newVariable])
      setCurrentInput('') // Only clear input when successfully added to canvas
    } else if (operationMatch) {
      const newOperation: TextElement = {
        type: 'text',
        content: trimmed,
        id: Date.now().toString()
      }
      setElements(prev => [...prev, newOperation])
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
                  <div className="text-lg leading-tight">{el.numerator}</div>
                  <div className="border-t border-white w-full my-1"></div>
                  <div className="text-lg leading-tight">{el.denominator}</div>
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
            ? 'Enter a fraction (e.g., "a/b"), variable (e.g., "x"), operation (e.g., "+"), or complete expression (e.g., "a/b+c/d")'
            : getLastElementType() === 'fraction'
            ? 'Enter an operation (+, -, *, /) or variable (e.g., "x")'
            : 'Enter a fraction (e.g., "c/d") or variable (e.g., "x")'
          }
        </div>
      </div>
    </div>
  )
}
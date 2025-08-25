import { EquationElement, ExpressionState } from './types'
import { ExpressionPatterns } from './expressionPatterns'

/**
 * Validates mathematical expressions based on the pattern:
 * element → operation → element → operation → ... → element
 * where element = fraction or variable, operation = +, -, *, /
 */
export class ExpressionValidator {
  /**
   * Check if an element is a mathematical element (fraction or variable)
   */
  static isElement(el: EquationElement): boolean {
    return el.type === 'fraction' || (el.type === 'numeric' && /^[a-zA-Z0-9]$/.test(el.content))
  }

  /**
   * Check if an element is an operation
   */
  static isOperation(el: EquationElement): boolean {
    return el.type === 'numeric' && /^[\+\-\*:]$/.test(el.content)
  }

  /**
   * Validate a sequence of elements follows the correct pattern
   */
  static validateSequence(elements: EquationElement[]): boolean {
    if (elements.length === 0) return true

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i]
      
      if (i % 2 === 0) {
        // Even indices should be elements (fractions or variables)
        if (!this.isElement(el)) {
          return false
        }
      } else {
        // Odd indices should be operations
        if (!this.isOperation(el)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Evaluate the expression state for a given canvas + input combination
   */
  static evaluateExpressionState(canvasElements: EquationElement[], input: string): ExpressionState {
    // Parse the input to get potential new elements
    const parsedInput = ExpressionPatterns.parseInput(input)
    
    if (!parsedInput.isValid) {
      return 'invalid'
    }

    // Create hypothetical sequence: canvas + new input
    const potentialElements = [...canvasElements, ...parsedInput.elements]

    // Validate the sequence
    if (!this.validateSequence(potentialElements)) {
      return 'invalid'
    }

    // Check completion state
    if (potentialElements.length === 0) {
      return 'valid' // Empty is valid
    }

    const lastElement = potentialElements[potentialElements.length - 1]
    
    if (this.isElement(lastElement)) {
      // Ends with element - this is valid (complete expression)
      return 'valid'
    } else if (this.isOperation(lastElement)) {
      // Ends with operation - this is intermediate (waiting for next element)
      return 'inter'
    } else {
      return 'invalid'
    }
  }

  /**
   * Check if input is valid for the current canvas state
   */
  static isValidInput(canvasElements: EquationElement[], input: string): boolean {
    const state = this.evaluateExpressionState(canvasElements, input)
    return state === 'valid' || state === 'inter'
  }

  /**
   * Get the type of the last element on canvas
   */
  static getLastElementType(elements: EquationElement[]): 'empty' | 'fraction' | 'operation' {
    if (elements.length === 0) return 'empty'
    const lastElement = elements[elements.length - 1]
    return lastElement.type === 'fraction' ? 'fraction' : 'operation'
  }
}

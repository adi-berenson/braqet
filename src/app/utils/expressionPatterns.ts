import { EquationElement, ParsedInput, NumericElement, FractionElement } from './types'

/**
 * Systematic expression parser that first tokenizes, then parses each token
 */
export class ExpressionPatterns {
  // Operation pattern (using : for division to distinguish from fractions)
  static readonly OPERATION = /^[\+\-\*:]$/
  
  // Fraction pattern (/ is reserved for fractions only)
  static readonly FRACTION = /^([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/
  
  // Variable/number pattern
  static readonly VARIABLE = /^[a-zA-Z0-9]$/

  /**
   * Tokenize input string into basic tokens (split by operations while preserving them)
   */
  static tokenize(input: string): string[] {
    const trimmed = input.trim()
    if (!trimmed) return []

    // Split by operations but keep the operations
    const tokens: string[] = []
    let currentToken = ''
    
    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i]
      
      if (/[\+\-\*:]/.test(char)) {
        // Found an operation (+ - * : for division)
        if (currentToken.trim()) {
          tokens.push(currentToken.trim())
          currentToken = ''
        }
        tokens.push(char)
      } else if (char === ' ') {
        // Space - just continue building current token
        if (currentToken && !currentToken.endsWith(' ')) {
          currentToken += char
        }
      } else {
        // Regular character
        currentToken += char
      }
    }
    
    // Add the last token if it exists
    if (currentToken.trim()) {
      tokens.push(currentToken.trim())
    }
    
    return tokens
  }

  /**
   * Parse a single token into an EquationElement
   */
  static parseToken(token: string, idPrefix: string): EquationElement | null {
    const trimmed = token.trim()
    
    // Check if it's a fraction
    const fractionMatch = this.FRACTION.exec(trimmed)
    if (fractionMatch) {
      return {
        type: 'fraction',
        numerator: { type: 'numeric', content: fractionMatch[1], id: `${idPrefix}-num` },
        denominator: { type: 'numeric', content: fractionMatch[2], id: `${idPrefix}-den` },
        id: idPrefix
      }
    }
    
    // Check if it's an operation
    if (this.OPERATION.test(trimmed)) {
      return {
        type: 'numeric',
        content: trimmed,
        id: idPrefix
      }
    }
    
    // Check if it's a variable/number
    if (this.VARIABLE.test(trimmed)) {
      return {
        type: 'numeric',
        content: trimmed,
        id: idPrefix
      }
    }
    
    // Unrecognized token
    return null
  }

  /**
   * Parse input string into equation elements using systematic tokenization
   */
  static parseInput(input: string): ParsedInput {
    const tokens = this.tokenize(input)
    if (tokens.length === 0) {
      return { elements: [], isValid: true }
    }
    
    const elements: EquationElement[] = []
    
    // Parse each token
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const element = this.parseToken(token, `temp-${i}`)
      
      if (!element) {
        // Failed to parse a token
        return { elements: [], isValid: false }
      }
      
      elements.push(element)
    }
    
    return { elements, isValid: true }
  }

  /**
   * Create actual elements for adding to canvas (with real IDs)
   */
  static createElements(input: string): EquationElement[] {
    const parsed = this.parseInput(input)
    if (!parsed.isValid) return []

    const timestamp = Date.now()
    return parsed.elements.map((el, index) => {
      if (el.type === 'fraction') {
        return {
          ...el,
          id: `${timestamp}-${index}`,
          numerator: { ...el.numerator, id: `${timestamp}-${index}-num` },
          denominator: { ...el.denominator, id: `${timestamp}-${index}-den` }
        }
      } else {
        return {
          ...el,
          id: `${timestamp}-${index}`
        }
      }
    })
  }
}

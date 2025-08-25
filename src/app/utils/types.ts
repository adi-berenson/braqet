// Types for mathematical expressions
export interface NumericElement {
  type: 'numeric'
  content: string
  id: string
}

export interface FractionElement {
  type: 'fraction'
  numerator: NumericElement
  denominator: NumericElement
  id: string
}

export type EquationElement = FractionElement | NumericElement

export type ExpressionState = 'valid' | 'invalid' | 'inter'

// Parsed input result
export interface ParsedInput {
  elements: EquationElement[]
  isValid: boolean
}

import EPSILON from './EPSILON'

export const isZero = (a: number): boolean => Math.abs(a) < EPSILON

export const isEqual = (a: number, b: number): boolean => isZero(a - b)

export const isGreaterThan = (a: number, b: number): boolean => a - EPSILON > b && !isEqual(a, b)

export const isGreaterOrEqual = (a: number, b: number): boolean => a - EPSILON > b || isEqual(a, b)

export const isLessThan = (a: number, b: number): boolean => a + EPSILON < b && !isEqual(a, b)

export const isLessOrEqual = (a: number, b: number): boolean => a + EPSILON < b || isEqual(a, b)

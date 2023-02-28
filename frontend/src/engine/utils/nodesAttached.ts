import {RectangleData} from '../types'
import {isEqual, isGreaterThan, isLessThan} from './arithmetics'
import type PixiNode from '../PixiNode'

export const nodesAttachedInX = <T extends RectangleData>(first: T, second: T): boolean =>
  isEqual(first.y, second.y) &&
  isEqual(first.height, second.height) &&
  (isEqual(first.x + first.width, second.x) || isEqual(second.x + second.width, first.x))

export const nodesAttachedInY = <T extends RectangleData>(first: T, second: T): boolean =>
  isEqual(first.x, second.x) &&
  isEqual(first.width, second.width) &&
  (isEqual(first.y + first.height, second.y) || isEqual(second.y + second.height, first.y))

export const getAttachedNeighborsX = (to: PixiNode): PixiNode[] =>
  to.siblingNodes.filter(sibling => nodesAttachedInX(sibling, to))

export const getAttachedNeighborsY = (to: PixiNode): PixiNode[] =>
  to.siblingNodes.filter(sibling => nodesAttachedInY(sibling, to))

export const getAllAttachedLeft = <T extends RectangleData>(to: T, list: T[]): T[] =>
  list
    .filter(n => n !== to)
    .filter(({y, height}) => isEqual(y, to.y) && isEqual(height, to.height))
    .filter(({x}) => isLessThan(x, to.x))
    .sort((a, b) => (a.x - b.x) * -1)
    .reduce<T[]>((acc, next) => {
      const last = acc[acc.length - 1] || to

      if (isEqual(next.x + next.width, last.x)) {
        acc.push(next)
      }

      return acc
    }, [])

export const getAllAttachedRight = <T extends RectangleData>(to: T, list: T[]): T[] =>
  list
    .filter(n => n !== to)
    .filter(({y, height}) => isEqual(y, to.y) && isEqual(height, to.height))
    .filter(({x}) => isGreaterThan(x, to.x))
    .sort((a, b) => a.x - b.x)
    .reduce<T[]>((acc, next) => {
      const last = acc[acc.length - 1] || to

      if (isEqual(last.x + last.width, next.x)) {
        acc.push(next)
      }

      return acc
    }, [])

export const getAllAttachedX = <T extends RectangleData>(to: T, list: T[]): T[] => {
  const remaining = list.filter(({y, height}) => isEqual(y, to.y) && isEqual(height, to.height))

  return [...getAllAttachedLeft(to, remaining), ...getAllAttachedRight(to, remaining)]
}

export const getAllAttachedAbove = <T extends RectangleData>(to: T, list: T[]): T[] =>
  list
    .filter(n => n !== to)
    .filter(({x, width}) => isEqual(x, to.x) && isEqual(width, to.width))
    .filter(({y}) => isLessThan(y, to.y))
    .sort((a, b) => (a.y - b.y) * -1)
    .reduce<T[]>((acc, next) => {
      const last = acc[acc.length - 1] || to

      if (isEqual(next.y + next.height, last.y)) {
        acc.push(next)
      }

      return acc
    }, [])

export const getAllAttachedBelow = <T extends RectangleData>(to: T, list: T[]): T[] =>
  list
    .filter(n => n !== to)
    .filter(({x, width}) => isEqual(x, to.x) && isEqual(width, to.width))
    .filter(({y}) => isGreaterThan(y, to.y))
    .sort((a, b) => a.y - b.y)
    .reduce<T[]>((acc, next) => {
      const last = acc[acc.length - 1] || to

      if (isEqual(last.y + last.height, next.y)) {
        acc.push(next)
      }

      return acc
    }, [])

export const getAllAttachedY = <T extends RectangleData>(to: T, list: T[]): T[] => {
  const remaining = list.filter(({x, width}) => isEqual(x, to.x) && isEqual(width, to.width))

  return [...getAllAttachedAbove(to, remaining), ...getAllAttachedBelow(to, remaining)]
}

export const checkIsAttachedX = <T extends RectangleData>(candidate: T, list: T[]): boolean =>
  getAllAttachedX(candidate, list).length > 0

export const checkIsAttachedY = <T extends RectangleData>(candidate: T, list: T[]): boolean =>
  getAllAttachedY(candidate, list).length > 0

export const checkIsAttached = <T extends RectangleData>(candidate: T, list: T[]): boolean =>
  checkIsAttachedX(candidate, list) || checkIsAttachedY(candidate, list)

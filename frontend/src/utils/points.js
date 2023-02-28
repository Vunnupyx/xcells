export const ORIGIN = {x: 0, y: 0}

export const ZERO_AREA = {width: 0, height: 0}

export const ZERO_RECTANGLE = {x: 0, y: 0, width: 0, height: 0}

export const length = (point1, point2) => Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2)

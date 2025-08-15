export type Dictionary<T> = { [key: string]: T}

export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const areStrings = (values: unknown[]): values is string[] => values.every(value => typeof value === 'string')
// export const isNumber = (value: unknown): value is number => typeof value === 'number'
// export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
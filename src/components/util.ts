export const normalizeObjectsKeys = (filter: { [key: string]: any }[]): { [key: string]: any }[] => {
  return filter.map(obj => normalizeObjectKeys(obj))
}

export const normalizeObjectKeys = (filter: { [key: string]: any }): { [key: string]: any } => {
  if (!filter)
    return filter

  return Object
    .entries(filter)
    .reduce(
      (normalized, [ key, value ]: [string, any]): { [key: string]: any } =>
        ({
          ...normalized,
          [key.toLowerCase()]: value
        }),
      {} as { [key: string]: any }
    )
}
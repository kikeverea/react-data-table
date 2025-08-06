import {ColumnTogglePayload, FilterAction, FilterRange, RangeValuePayload, TableFilter} from '../types/types.ts'


const filterReducer = (filter: TableFilter, action: FilterAction) : TableFilter  => {
  switch (action.type) {
    case 'TOGGLE_COLUMN' :
      const updatedFilter = toggleColumn(filter, action.payload)
      return { ...updatedFilter }

    case 'SET_COLUMN_RANGE' :
      const updatedRange = setRangeLimit(filter, action.payload)
      return { ...updatedRange }

    case 'RESET_FILTER' :
      return {}

    default :
      throw new Error(`Unknown action type: '${(action as any).type}'`)
  }
}

const toggleColumn = (filter: TableFilter, payload: ColumnTogglePayload): TableFilter => {

  const { column, value, selected } = payload

  const valuesArray = filter[column] as string[] || []
  assertAsArray(valuesArray)

  const updatedValues = selected
    ? [ ...valuesArray, value ]
    : valuesArray.filter(name => name.toLowerCase() !== value.toLowerCase())

  return { ...filter, [column]: updatedValues }
}

const setRangeLimit = (filter: TableFilter, payload: RangeValuePayload): TableFilter => {
  const { column, target, type, value } = payload

  const newValue = type === 'date' || typeof value !== 'string'
    ? value
    : parseFloat(value)

  const range = filter[column] || {}
  assertAsRange(range)

  return { ...filter, [column]: { ...range, [target]: newValue }}
}

function assertAsArray (value: string[] | FilterRange): asserts value is string[] {
  if (!Array.isArray(value))
    throw new Error(`Expected value to be a string array, but is a ${typeof value}`)
}

function assertAsRange(value: string[] | FilterRange): asserts value is FilterRange {
  if (Array.isArray(value))
    throw new Error(`Expected value to be a 'filter range', but is a ${typeof value}`)
}

export default filterReducer
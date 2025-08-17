import {FilterStructure, RangeStructure} from '../TableFilter/types'
import {FilterColumns, RangeFilter} from './types.ts'
import {Dictionary} from '../types.ts'
import {normalize} from '../util.ts'

type BuildArgs = {
  columns?: FilterColumns;
  collection?: Dictionary<string | number>[];
};


const buildFilterStructure = ({ columns, collection }: BuildArgs): FilterStructure | {} => {

  if (!collection?.length || !columns?.length)
    return {}

  return columns.reduce((filter: FilterStructure, column): FilterStructure => {

    if (isRangeColumn(column)) {
      const [name] = column
      filter[normalize(name)] = extractRangeFilter(column)
    }
    else {
      filter[normalize(column)] = extractCheckboxesFilter(column, collection)
    }

    return filter
  }, {})
}

const extractRangeFilter = (column: RangeFilter): RangeStructure => {
  const [ _columnName, _range, parser ] = column

  return { range: true, parser }
}

const extractCheckboxesFilter = (column: string, collection: Dictionary<string|number>[]): string[] => {
  const columnName = normalize(column)

  const values = collection.map((entity) => {

    const value = String(entity[columnName] || '').trim()

    if (value)
      return value
    else {
      console.warn(`Could not find column ${columnName}. Available columns: ${Object.keys(entity).join(', ')}`)
      return ''
    }
  },
  [] as string[])

  return Array.from(new Set(values))  // remove duplicates
}

const isRangeColumn = (column: string | any[]): column is RangeFilter =>
  Array.isArray(column) && column[1] === 'range'

export default buildFilterStructure
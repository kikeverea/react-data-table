import {FilterColumns, RangeFilterColumn} from './types.ts'
import {Dictionary} from '../types.ts'
import {normalized} from '../util.ts'
import {CheckboxesFilter, FilterParser, isRange, RangeFilter, TableFilter} from '../TableFilter/types.ts'

type BuildArgs = {
  columns: FilterColumns;
  collection: Dictionary<string | number>[];
};


export const buildFilter = ({ columns, collection }: BuildArgs): TableFilter => {

  return columns.reduce((filter: TableFilter, column): TableFilter => {

    if (isRangeColumn(column)) {
      const [name, _range, parser] = column
      filter[normalized(name)] = buildRangeFilter(parser)
    }
    else {
      filter[normalized(column)] = buildCheckboxesFilterWithCollection(column, collection)
    }

    return filter
  }, {})
}

const buildRangeFilter = (parser?: FilterParser): RangeFilter => {
  return {
    type: 'range',
    ...(parser ? { parser } : {})
  }
}

const buildCheckboxesFilterWithCollection = (column: string, collection: Dictionary<string|number>[]): CheckboxesFilter => {

  const values = collection.reduce((checkboxes, entity): Set<string> => {
    const value = entity[normalized(column)]

    if (value) {
      checkboxes.add(normalized(String(value)))
    }
    else
      console.warn(`Could not find column ${column}. Available columns: ${Object.keys(entity).join(', ')}`)

    return checkboxes
  },
  new Set<string>)

  return checkboxesFilter(Array.from(values))
}

const checkboxesFilter = (values: string[]): CheckboxesFilter => {
  return {
    type: 'checkboxes',
    values: values,
    checked: []
  }
}

const isRangeColumn = (column: string | any[]): column is RangeFilterColumn =>
  Array.isArray(column) && column[1] === 'range'

export const resetFilter = (filter: TableFilter): TableFilter => {

  return Object.entries(filter).reduce((filter: TableFilter, [column, columnFilter]): TableFilter => {

    if (isRange(columnFilter)) {
      filter[normalized(column)] = buildRangeFilter(columnFilter.parser)
    }
    else {
      filter[normalized(column)] = checkboxesFilter(columnFilter.values)
    }

    return filter
  }, {})
}
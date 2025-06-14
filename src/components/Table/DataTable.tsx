import {
  Dictionary,
  FilterEventValue,
  FilterRange,
  TableFilter as TableFilterType
} from './types/types.ts'

import {useState} from 'react'

const DataTable = () => {
  const [filter, setFilter] = useState<TableFilterType>({})

  const updateFilter = (columnName: string, value: FilterEventValue) => {

    const tableFilter: TableFilterType = buildTableFilter(filter, value)

    setFilter(tableFilter)
  }
}

export default DataTable

const buildTableFilter = (filter: TableFilterType, value: FilterEventValue): TableFilterType => {

  return Object
    .entries(filter)
    .reduce((tableFilter: TableFilterType, filterParameter): TableFilterType => {

        const [columnName, filterValue] = filterParameter

        if (valueIsRange(value))
          tableFilter[columnName] = { ...(filterValue || {}), ...value }

        else {
          const listValue = tableFilter[columnName]
          assertValueAsList(listValue)

          if (value.checked)
            listValue.push(value.name)
          else
            listValue.filter(name => name !== value.name)
        }

        return tableFilter
      },
      {} as TableFilterType)
}

const valueIsRange = (value: any): value is { min: number, max: number } => value.range

const isRange = (value: any): value is { [target: string]: string | number } =>
  value.min != undefined || value.max != undefined

const isFilterRange = (value: any): value is FilterRange => value.range

const isCheckbox = (value: any): value is { name: string, checked: boolean } =>
  value.name && value.checked !== undefined

const isFilterDictionary = (value: any): value is Dictionary<boolean> => !value.range

function assertValueAsList (value: string[] | FilterRange): asserts value is string[] {
  if (!Array.isArray(value))
    throw new Error('Expected value to be a string array')
}
import { useMemo, useRef, useState } from 'react'
import {Dictionary, FilterColumns, FilterRange, TableFilterProp} from '../types/types.ts'

type UseFilterReturn = [
  TableFilterProp | null | undefined,
  React.Dispatch<React.SetStateAction<TableFilterProp | null | undefined>>
]

const useFilter = (columns?: FilterColumns, collection?: Dictionary<string|number>[]): UseFilterReturn => {
  const filterVersion = useRef<number>(0)

  const [filterStructure, version] = useMemo<[TableFilterProp | {}, number]>((): [TableFilterProp | {}, number] =>
      [
        extractFilter(columns, collection),
        filterVersion.current + 1
      ],
    [columns, collection])

  const [filter, setFilter] = useState<TableFilterProp | null>()

  if (filterVersion.current != version) {
    setFilter(filterStructure)
    filterVersion.current = version
  }

  return [filter, setFilter]
}

const isRange = (type: any, _param: any): _param is FilterRange => type == 'range'

export const extractFilter = (
  columns?: FilterColumns,
  collection?: Dictionary<string|number>[],
  previousState?: TableFilterProp
): TableFilterProp | {} =>
{

  if (!collection?.length || !columns?.length)
    return {}

  return columns.reduce((filter: TableFilterProp, column): TableFilterProp => {

    const [columnName, range, type] = Array.isArray(column) ? column : [column, 'default']
    const filterValue = filter[columnName] || {}
    const previousStateParameter = previousState && previousState[columnName]

    if (isRange(range, filterValue) || isRange(range, previousStateParameter))
      filter[columnName] = previousState ? previousState[columnName] : { min: undefined, max: undefined, type: type }

    else {
      collection.forEach(entity => {
        if (!Object.keys(filterValue).length)
          filter[columnName] = filterValue

        const valueName = entity[columnName] && String(entity[columnName])

        if (valueName)
          filterValue[valueName] = previousStateParameter ? previousStateParameter[valueName] : false
        else
          console.warn(`Could not find column ${columnName}. Available columns: ${Object.keys(entity).join(', ')}`)
      })
    }

    return filter
  }, {})
}

export default useFilter
import {Dictionary, FilterRange, TableFilter as TableFilterType, TableFilterProp, TableToolbarProps} from './types/types.ts'
import {useMemo, useRef, useState} from 'react'
import TableFilter from "./TableFilter.tsx";
import tableFilter from './TableFilter.tsx'

const TableToolbar = (
{
  collection,
  filter: filterColumns,
  showSearch=true,
  showFilter=true,
  onSearchChange=() => {},
  onFilterChange=() => {}
}: TableToolbarProps) => {

  const filterVersion = useRef<number>(0)

  const [filterStructure, version] = useMemo<[TableFilterProp | {}, number]>((): [TableFilterProp | {}, number] =>
    [
      extractFilter(filterColumns, collection),
      version + 1
    ],
    [filterColumns, collection])

  const [filterParameters, setFilterParameters] = useState<TableFilterProp | null>()

  const [filter, setFilter] = useState<TableFilterType>()

  if (filterVersion.current != version) {
    setFilterParameters(filterStructure)
    filterVersion.current = version
  }

  const updateFilter = (columnName: string, value: { name: string, checked: boolean, min: string | number, max: string | number}) => {
    if (!filterParameters)
      return

    const filterParameter = filterParameters[columnName]

    const paramIsRange = (value: any, _param: any): _param is FilterRange => value.min !== undefined || value.max !== undefined
    const valueIsRange = (value: any): value is FilterRange => value.min !== undefined || value.max !== undefined

    if (paramIsRange(value, filterParameter)) {
      const min = value.min || filterParameter.min
      const max = value.max || filterParameter.max

      filterParameters[columnName] = { ...filterParameters[columnName], min, max }
    }
    else
      filterParameter[value.name] = value.checked

      const tableFilter = Object.entries(filterParameters).reduce((tableFilter: TableFilterType, [columnName, value]): TableFilterType => {
        tableFilter[columnName] = valueIsRange(value)
          ? {
              min: value.min,
              max: value.max
            }
          : Object
            .entries(value)
            .filter(([_valueName, selected]) => selected)
            .map(([valueName]) => valueName)

        return tableFilter
      }, {})

      setFilter(tableFilter)
      setFilterParameters({ ...filterParameters })
  }

  return (
    <div>
      { showSearch &&
        <input type='text' onInput={ e => onSearchChange(e.currentTarget.value) }/>
      }
      { showFilter && filterParameters?.length &&
        <TableFilter filter={ filterParameters } onFilterValueChanged={ updateFilter } />
      }
    </div>
  )
}

const extractFilter = (
  columns?: [string, 'default' | 'range' | undefined][],
  collection?: Dictionary<string|number>[],
  previousState?: TableFilterProp
): TableFilterProp | {} =>
{

  if (!collection?.length || !columns?.length)
    return {}

  return columns.reduce((filter: TableFilterProp, column): TableFilterProp => {

    const isRange = (type: any, _param: any): _param is FilterRange => type == 'range'

    const [columnName, type='default'] = column
    const filterParameter = filter[columnName]
    const previousStateParameter = previousState && previousState[columnName]

    if (isRange(type, filterParameter) || isRange(type, previousStateParameter))
      filter[columnName] = previousState ? previousState[columnName] : { min: undefined, max: undefined }

    else {
      collection.forEach(entity => {
        const valueName = String(entity[columnName])
        filterParameter[valueName] = previousStateParameter ? previousStateParameter[valueName] : false
      })
    }

    return filter
  }, {})
}
export default TableToolbar
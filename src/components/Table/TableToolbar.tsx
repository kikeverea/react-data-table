import { FilterRange, TableFilter as TableFilterType, TableToolbarProps} from './types/types.ts'
import TableFilter from './TableFilter.tsx'
import useFilter from './hooks/useFilter.ts'

const TableToolbar = (
{
  collection,
  filter: filterColumns,
  showSearch=true,
  showFilter=true,
  onSearchChange=() => {},
  onFilterChange=() => {}
}: TableToolbarProps) => {

  const [filter, setFilter] = useFilter(filterColumns, collection)

  const updateFilter = (columnName: string, value: { name?: string, checked?: boolean, min?: number, max?: number}) => {
    if (!filter)
      return

    const filterParameter = filter[columnName]

    const paramIsRange = (value: any, _param: any): _param is FilterRange => value.min !== undefined || value.max !== undefined
    const valueIsRange = (value: any): value is FilterRange => value.min !== undefined || value.max !== undefined

    if (paramIsRange(value, filterParameter)) {
      const min = value.min || filterParameter.min
      const max = value.max || filterParameter.max

      filter[columnName] = { ...filter[columnName], min, max }
    }
    else if (value.name)
      filterParameter[value.name] = value.checked || false

    const tableFilter = Object.entries(filter).reduce((tableFilter: TableFilterType, [columnName, value]): TableFilterType => {
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

      setFilter({ ...filter })
      onFilterChange(tableFilter)
  }

  return (
    <div>
      { showSearch &&
        <input type='text' onInput={ e => onSearchChange(e.currentTarget.value) }/>
      }
      { showFilter && filter?.length &&
        <TableFilter filter={ filter } onFilterValueChanged={ updateFilter } />
      }
    </div>
  )
}
export default TableToolbar
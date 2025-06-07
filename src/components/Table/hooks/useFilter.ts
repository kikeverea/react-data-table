import {useMemo, useRef, useState} from "react";
import {Dictionary, FilterRange, TableFilterProp} from "../types/types.ts";

type UseFilterReturn = [
  TableFilterProp | null | undefined,
  React.Dispatch<React.SetStateAction<TableFilterProp | null | undefined>>
]

const useFilter = (columns?: [string, 'default' | 'range' | undefined][], collection?: Dictionary<string|number>[]): UseFilterReturn => {
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

export default useFilter
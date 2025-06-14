import { FilterRange, TableFilterProps } from './types/types.ts'
import {ChangeEvent} from 'react'

const isRange = (value: any): value is FilterRange => value.range

const TableFilter = ({ filterStructure, onFilterValueChanged }: TableFilterProps) => {

  const handleRangeValueChanged = (e: ChangeEvent<HTMLInputElement>, column: string, type: string, rangeTarget: string): void => {
    const newValue = e.currentTarget.value

    const value = type === 'date'
      ? newValue
      : parseFloat(newValue)

    onFilterValueChanged(column, { [rangeTarget]: value })
  }

  return (
    <div role='dialog' aria-modal="true" aria-label="table filter">
      { filterStructure
        ? Object.entries(filterStructure).map(([columnName, value]) => {

          return (
            <fieldset key={ columnName }>
              <legend aria-label={ columnName }>{ columnName }</legend>
              { isRange(value)
                  ? <>
                      <label htmlFor={ `${columnName.toLowerCase()}-min` }>Min</label>
                      <input
                        id={`${columnName.toLowerCase()}-min`}
                        name='min'
                        type="text"
                        aria-label={ `${columnName.toLowerCase()} min` }
                        onChange= { e =>
                          handleRangeValueChanged(e, columnName, value.type, 'min')
                        }
                      />
                      <label htmlFor={ `${columnName.toLowerCase()}-max` }>Max</label>
                      <input
                        id={`${columnName.toLowerCase()}-max`}
                        name='max'
                        aria-label={ `${columnName.toLowerCase()} max` }
                        type="text"
                        onChange= { e =>
                          handleRangeValueChanged(e, columnName, value.type, 'max')
                        }
                      />
                    </>
                  : Object.entries(value).map(([valueName]) =>
                      <label key={ valueName }>
                        <input
                          type='checkbox'
                          name={ valueName.toLowerCase() }
                          onChange={ (e) => onFilterValueChanged(columnName, { name: valueName, checked: e.target.checked }) }
                        />
                        { valueName }
                      </label>
                    )
              }
            </fieldset>
          )})
        : 'No data available'
      }
    </div>
  )
}

export default TableFilter
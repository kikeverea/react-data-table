import {FilterRange, StructureRange, TableFilterProps} from './types/types.ts'
import {ChangeEvent} from 'react'
import styles from './css/TableFilter.module.css'

const isRange = (value: any): value is StructureRange => value.range

const TableFilter = ({ filterStructure, filter={}, onFilterChange, onCloseFilter }: TableFilterProps) => {

  const handleFilterValueChanged = (e: ChangeEvent<HTMLInputElement>, column: string, valueName: string): void => {
    const checkbox = e.currentTarget

    const valuesArray = filter[column] || []
    assertAsArray(valuesArray)

    if (checkbox.checked)
      filter[column] = [ ...valuesArray, valueName ]
    else
      filter[column] = valuesArray.filter(name => name.toLowerCase() !== valueName.toLowerCase())

    onFilterChange({ ...filter })
  }

  const handleRangeValueChanged = (
    e: ChangeEvent<HTMLInputElement>,
    column: string,
    range: StructureRange,
    rangeTarget: 'min' | 'max'): void =>
  {
    const newValue = e.currentTarget.value
    const type = range.type

    const value = type === 'date'
      ? newValue
      : parseFloat(newValue)

    const filterValue = filter[column] || {}
    assertAsRange(filterValue)

    const parser = range.parser ? { parser: range.parser } : {}

    filter[column] = {
      ...filterValue,
      [rangeTarget]: value, ...parser
    }

    onFilterChange({ ...filter })
  }

  return (
    <div role='dialog' aria-modal="true" aria-label="table filter" className={ styles.filterModal }>
      { filterStructure
        ? Object.entries(filterStructure).map(([columnName, value]) => {

          const filterValues = filter[columnName]

          return (
            <div key={ columnName } className={ styles.filterColumnContainer } role='group' aria-label={ columnName }>
              <div id={`${columnName.toLowerCase()}-filter-label`} className={ styles.filterColumnLabel } role='label' >
                { columnName }
              </div>
              { isRange(value)
                  ? <>
                      <label htmlFor={ `${columnName.toLowerCase()}-min` }>Min</label>
                      <input
                        id={`${columnName.toLowerCase()}-min`}
                        name='min'
                        type="text"
                        aria-label={ `${columnName.toLowerCase()} min` }
                        onChange= { e => handleRangeValueChanged(e, columnName, value, 'min') }
                      />
                      <label htmlFor={ `${columnName.toLowerCase()}-max` }>Max</label>
                      <input
                        id={`${columnName.toLowerCase()}-max`}
                        name='max'
                        aria-label={ `${columnName.toLowerCase()} max` }
                        type="text"
                        onChange= { e => handleRangeValueChanged(e, columnName, value, 'max') }
                      />
                    </>
                  : <div className={ styles.checkboxesContainer }>
                      { value.map((valueName) =>
                        <label key={ valueName } className={ styles.filterCheckbox }>
                          <input
                            type='checkbox'
                            name={ valueName.toLowerCase() }
                            className={ styles.checkboxInput }
                            checked={ !!filterValues && isInValues(valueName, filterValues as string[]) }
                            onChange={(e) => handleFilterValueChanged(e, columnName, valueName) }
                          />
                          <span className={ styles.checkboxBox } aria-hidden="true"></span>
                          <span className={ styles.checkboxLabel }>
                            { valueName }
                          </span>
                        </label>
                      )}
                    </div>
              }
            </div>
          )})
        : 'No data available'
      }
      <div className={ styles.buttonsContainer }>
        <button className={ `${styles.button} ${styles.resetButton}` } onClick={ () => onFilterChange({}) }>
          Reset
        </button>
        <button className={ `${styles.button} ${styles.closeButton}` } onClick={ onCloseFilter }>
          Close
        </button>
      </div>
    </div>
  )
}

const isInValues = (value: string, values: string[]): boolean =>
  values.includes(value)

function assertAsRange(value: string[] | FilterRange): asserts value is FilterRange {
  if (Array.isArray(value))
    throw new Error(`Expected value to be a 'filter range', but is a ${typeof value}`)
}

function assertAsArray (value: string[] | FilterRange): asserts value is string[] {
  if (!Array.isArray(value))
    throw new Error(`Expected value to be a string array, but is a ${typeof value}`)
}

export default TableFilter
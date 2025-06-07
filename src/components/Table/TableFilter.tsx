import { FilterRange, TableFilterProps } from './types/types.ts'

const isRange = (value: any): value is FilterRange => value.min != undefined || value.max != undefined

const TableFilter = ({ filter, onFilterValueChanged }: TableFilterProps) => {
  return (
    <div role='dialog' aria-modal="true" aria-label="table filter">
      { filter
        ? Object.entries(filter).map(([columnName, value]) => {

          return (
            <fieldset key={ columnName }>
              <legend>{ columnName }</legend>
              { isRange(value)
                  ? <>
                      <label htmlFor={ `${columnName.toLowerCase()}-min` }>Min</label>
                      <input
                        id={`${columnName.toLowerCase()}-min`}
                        name='min'
                        type={ value.type === 'date' ? 'date' : 'text' }
                        value= { value.min }
                        onChange= { (e) => onFilterValueChanged(columnName, { min: parseFloat(e.currentTarget.value) }) }
                      />
                      <label htmlFor={ `${columnName.toLowerCase()}-max` }>Max</label>
                      <input
                        id={`${columnName.toLowerCase()}-max`}
                        name='max'
                        type={ value.type === 'date' ? 'date' : 'text' }
                        value={ value.max }
                        onChange={ (e) => onFilterValueChanged(columnName, { max: parseFloat(e.currentTarget.value) }) }
                      />
                    </>
                  : Object.entries(value).map(([valueName, value]) =>
                      <label key={ valueName }>
                        <input
                          type='checkbox'
                          name={ valueName.toLowerCase() }
                          checked={ value }
                          onChange={ () => onFilterValueChanged(columnName, { name: valueName, checked: !value }) }
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
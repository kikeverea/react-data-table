import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TableFilter from './TableFilter.tsx'
import { FilterStructure } from './types.ts'

describe('Table Filter', () => {

  const parser = (date: string) => new Date(date).getTime()

  const filterStructure: FilterStructure = {
    'Family': ['Feline', 'Canine', 'Seals', 'Fish', 'Primate'],
    'Type': ['Pet', 'Wild',],
    'Age': { range: true },
    'Birth': { range: true, parser: parser }
  }

  const dispatchFilterChangeMock = vi.fn()
  const onCloseFilterMock = vi.fn()

  beforeEach(() => {
    render(
      <TableFilter
        filterStructure={ filterStructure }
        filter={{}}
        dispatchFilterChange={ dispatchFilterChangeMock }
        onCloseFilter={ onCloseFilterMock }
      />)
  })

  afterEach(() => {
    dispatchFilterChangeMock.mockClear()
    onCloseFilterMock.mockClear()
  })

  test('component has a dialog role, aria modal and is labeled', () => {
    const tableFilter = screen.getByRole('dialog')

    expect(tableFilter).toBeDefined()
    expect(tableFilter.ariaModal).toBe('true')
    expect(tableFilter.ariaLabel).toBe('table filter')
  })

  test('renders all filter labels', () => {
    const family = screen.getAllByLabelText('Family')

    const type = screen.getByLabelText('Type')
    const age = screen.getByLabelText('Age')
    const birth = screen.getByLabelText('Birth')

    expect(family).toBeDefined()
    expect(type).toBeDefined()
    expect(age).toBeDefined()
    expect(birth).toBeDefined()
  })

  test('renders checkboxes', () => {
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => expect(checkbox).toBeDefined())
  })

  test('renders number ranges', () => {
    const min = screen.getByLabelText('age min') as HTMLInputElement
    const max = screen.getByLabelText('age max') as HTMLInputElement

    expect(min).toBeDefined()
    expect(max).toBeDefined()
  })

  test('renders date ranges', () => {
    const min = screen.getByLabelText('birth min') as HTMLInputElement
    const max = screen.getByLabelText('birth max') as HTMLInputElement

    expect(min).toBeDefined()
    expect(max).toBeDefined()
  })

  test('checking a checkbox calls its dispatcher', async () => {
    const checkbox = screen.getByRole('checkbox', { name: /Feline/i })
    await userEvent.click(checkbox)

    expect(dispatchFilterChangeMock).toHaveBeenCalledWith({
      type: 'TOGGLE_COLUMN',
      payload: { column: 'Family', value: 'Feline', selected: true },
    })

    expect(dispatchFilterChangeMock).toHaveBeenCalledTimes(1)
  })

  test('input in a number range calls the handler with the column name and range value', async () => {
    const age = screen.getByRole('group', { name: 'Age' })
    const [min, max] = within(age).getAllByRole('textbox') as HTMLInputElement[]

    await userEvent.type(min, '1')
    expect(dispatchFilterChangeMock).toHaveBeenLastCalledWith({
      type: 'SET_COLUMN_RANGE',
      payload: { column: 'Age', value: '1', target: 'min', parser: undefined },
    })

    await userEvent.type(max, '1')
    expect(dispatchFilterChangeMock).toHaveBeenLastCalledWith({
      type: 'SET_COLUMN_RANGE',
      payload: { column: 'Age', value: '1', target: 'max', parser: undefined },
    })

    expect(dispatchFilterChangeMock).toHaveBeenCalledTimes(2)
  })

  test('clicking close button calls its handler', async () => {
    const button = screen.getByRole('button', { name: /close/i })
    await userEvent.click(button)

    expect(onCloseFilterMock).toHaveBeenCalledTimes(1)
  })

  test('clicking reset button calls its handler', async () => {
    const button = screen.getByRole('button', { name: /reset/i })
    await userEvent.click(button)

    expect(dispatchFilterChangeMock).toHaveBeenLastCalledWith({ type: 'RESET_FILTER' })
    expect(dispatchFilterChangeMock).toHaveBeenCalledTimes(1)
  })
})
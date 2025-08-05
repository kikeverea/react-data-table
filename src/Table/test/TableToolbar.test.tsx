import {render, screen, within} from '@testing-library/react'
import TableToolbar from '../TableToolbar.tsx'
import { TestData } from './testUtils.ts'
import userEvent from '@testing-library/user-event'

describe('Table Toolbar', () => {

  describe('Search', () => {
    test('Renders search bar by default', () => {
      render(<TableToolbar />)

      const searchBar = screen.getByLabelText('table search')
      expect(searchBar).toBeDefined()
    })

    test('Shows given placeholder', () => {
      render(<TableToolbar searchPlaceholder='Test placeholder' />)

      const searchBar = screen.getByPlaceholderText('Test placeholder')
      expect(searchBar).toBeDefined()
    })

    test("Doesn't show search bar if indicated", () => {
      render(<TableToolbar showSearch={ false }/>)

      const searchBar = screen.queryByLabelText('table search')
      expect(searchBar).toBeNull()
    })

    test('Calls search change handler', async () => {
      const onSearchChangeMock = vi.fn()

      render(<TableToolbar onSearchChange={ onSearchChangeMock }/>)

      const searchBar = screen.getByRole('textbox')
      await userEvent.type(searchBar, 'Hello')

      expect(onSearchChangeMock).toHaveBeenCalledWith('Hello')
    })
  })

  describe('Filter', () => {
    const collection: TestData[] = [
      { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
      { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' }
    ]

    test("Doesn't show filter if no columns given", () => {
      render(<TableToolbar collection={[]}/>)

      const showFilterButton = screen.queryByLabelText('show filter')
      expect(showFilterButton).toBeNull()
    })

    test("Doesn't show filter if empty columns", () => {
      render(<TableToolbar filterColumns={[]} collection={[]}/>)

      const showFilterButton = screen.queryByLabelText('show filter')
      expect(showFilterButton).toBeNull()
    })

    test("Renders show filter button", () => {
      render(<TableToolbar filterColumns={['family', 'type']} collection={ collection } />)

      const showFilterButton = screen.getByLabelText('show filter')
      expect(showFilterButton).toBeDefined()
    })

    test('Displays filter', async () => {
      render(<TableToolbar filterColumns={['family', 'type']} collection={ collection } />)

      const filterThen = screen.queryByRole('dialog')
      expect(filterThen).toBe(null)

      const showFilterButton = screen.getByLabelText('show filter')
      await userEvent.click(showFilterButton)

      const filter = screen.getByRole('dialog')
      expect(filter).toBeDefined()
    })

    test('Hides filter', async () => {
      render(<TableToolbar filterColumns={['family', 'type']} collection={ collection } />)

      const showFilterButton = screen.getByLabelText('show filter')

      await userEvent.click(showFilterButton)
      const filter = screen.getByRole('dialog')
      expect(filter).toBeDefined()

      await userEvent.click(showFilterButton)
      const hiddenFilter = screen.queryByRole('dialog')
      expect(hiddenFilter).toBe(null)
    })

    test('Hides filter by clicking its close button', async () => {
      render(<TableToolbar filterColumns={['family', 'type']} collection={ collection } />)

      const showFilterButton = screen.getByLabelText('show filter')
      await userEvent.click(showFilterButton)

      const filter = screen.getByRole('dialog')

      const closeButton = within(filter).queryByRole('button', { name: /close/i }) as HTMLButtonElement
      await userEvent.click(closeButton)

      const hiddenFilter = screen.queryByRole('dialog')
      expect(hiddenFilter).toBe(null)
    })

    test('Calls checkbox filter change handler', async () => {
      const onFilterChangeMock = vi.fn()

      render(
        <TableToolbar
          showSearch={ false }
          filterColumns={['family']}
          collection={ collection }
          onFilterChange={ onFilterChangeMock }
        />
      )

      const filterButton = screen.getByLabelText('show filter')
      await userEvent.click(filterButton)

      const felineCheckbox = screen.getByRole('checkbox', { name: 'Feline' })

      await userEvent.click(felineCheckbox)
      expect(onFilterChangeMock).toHaveBeenLastCalledWith('family', { name: 'Feline', checked: true })

      await userEvent.click(felineCheckbox)
      expect(onFilterChangeMock).toHaveBeenLastCalledWith('family', { name: 'Feline', checked: false })
    })

    test('Calls range box filter change handler', async () => {
      const onFilterChangeMock = vi.fn()

      render(
        <TableToolbar
          showSearch={ false }
          filterColumns={[['age', 'range', 'number']]}
          collection={ collection }
          onFilterChange={ onFilterChangeMock }
        />
      )

      const filterButton = screen.getByLabelText('show filter')
      await userEvent.click(filterButton)

      const minAge = screen.getByRole('textbox', { name: 'age min' })
      const maxAge = screen.getByRole('textbox', { name: 'age max' })

      await userEvent.type(minAge, '5')
      expect(onFilterChangeMock).toHaveBeenLastCalledWith('age', { min: 5 })

      await userEvent.type(maxAge, '10')
      expect(onFilterChangeMock).toHaveBeenLastCalledWith('age', { max: 10 })
    })
  })

})


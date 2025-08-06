import {render, screen, within} from '@testing-library/react'
import '@testing-library/jest-dom';
import { TableColumn } from '../types/types.ts'
import {getNameCellsContent, TestData, dataRows, getTestData, formatDate} from './testUtils.ts'
import DataTable from '../DataTable.tsx'
import userEvent from '@testing-library/user-event'

const collection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

const columns: TableColumn<TestData>[] = [
  { name: 'Name', data: item => `${item.name}`},
  { name: 'Family', data: item => `${item.family}`},
  { name: 'Type', data: item => `${item.type}`},
  { name: 'Age', data: item => `${item.age}`, type: 'number' },
  { name: 'Birth', data: item => `${item.birth}`, format: formatDate, type: 'date' },
]

describe('Data Table', () => {

  describe('Without data', () => {
    test('renders empty message', () => {
      render(<DataTable collection={ [] } columns={ columns } />)

      const rows = dataRows()
      expect(getNameCellsContent(rows)).toEqual(['No data available'])
    })

    test('renders custom empty message', () => {
      render(<DataTable collection={ [] } columns={ columns } noEntriesMessage='No entries'/>)

      const rows = dataRows()
      expect(getNameCellsContent(rows)).toEqual(['No entries'])
    })
  })

  describe('With data', () => {

    test('renders collection', () => {
      render(<DataTable collection={ collection } columns={ columns } />)

      const rows = dataRows()

      rows.forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')

        cells.forEach((cell, colIndex) => {
          expect(cell.textContent)
            .toBe(getTestData({ collection, row: rowIndex, col: colIndex }))
        })
      })
    })

    describe('Sorting', () => {
      test('sorts rows', () => {
        render(<DataTable collection={ collection } columns={ columns } sortBy={{ column: 'family' }} />)

        const rows = dataRows()
        expect(getNameCellsContent(rows)).toEqual(['Dog', 'Red Fox', 'Cat', 'Lion', 'Gold Fish', 'Monkey', 'Sea Lion'])
      })
    })

    describe('Pagination', () => {
      test('paginates data', () => {
        render(<DataTable collection={ collection } columns={ columns } paginate={ 2 }/>)

        const rows = dataRows()
        expect(getNameCellsContent(rows)).toEqual(['Cat', 'Dog'])
      })
    })


    describe('Search', () => {
      test('renders search box', () => {
        render(<DataTable collection={collection} columns={columns} showSearch={true}/>)

        const searchBar = screen.getByRole('textbox')
        expect(searchBar).toBeInTheDocument()
      })

      test('renders rows that pass the search', async () => {
        render(<DataTable collection={ collection } columns={ columns } />)

        const searchBox = screen.getByLabelText('table search')

        await userEvent.type(searchBox, 'Lion')

        const rows = dataRows()
        expect(getNameCellsContent(rows)).toEqual(['Lion', 'Sea Lion'])
      })
    })

    describe('Filter', () => {

      test('renders filter options', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['family', 'type']}/>)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const filterElement = screen.getByLabelText('table filter')
        const familyParam = screen.getByText('Family')
        const typeParam = screen.getByText('Type')

        expect(filterElement).toBeInTheDocument()
        expect(familyParam).toBeInTheDocument()
        expect(typeParam).toBeInTheDocument()
      })

      test('renders rows that pass the filter', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['Family', 'Type', ['Age', 'range', 'number']]} />)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const felineCheckbox = screen.getByRole('checkbox', { name: 'Feline' })
        const petCheckbox = screen.getByRole('checkbox', { name: 'Pet' })

        await userEvent.click(felineCheckbox)

        const felineRows = dataRows()
        expect(getNameCellsContent(felineRows)).toEqual(['Cat', 'Lion'])

        await userEvent.click(petCheckbox)

        const felinePetRows = dataRows()
        expect(getNameCellsContent(felinePetRows)).toEqual(['Cat'])

        await userEvent.click(petCheckbox)

        const felineRowsThen = dataRows()
        expect(getNameCellsContent(felineRowsThen)).toEqual(['Cat', 'Lion'])
      })

      test('renders rows that pass the range filter', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['Family', 'Type', ['Age', 'range', 'number']]} />)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const minRange = screen.getByLabelText('Min')
        const maxRange = screen.getByLabelText('Max')

        await userEvent.type(minRange, '10')

        const minRows = dataRows()
        expect(getNameCellsContent(minRows)).toEqual(['Cat', 'Lion', 'Sea Lion'])

        await userEvent.type(maxRange, '11')

        const maxRows = dataRows()
        expect(getNameCellsContent(maxRows)).toEqual(['Cat'])
      })

      test('renders all rows when filter is reset', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['Family', 'Type']} />)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const felineCheckbox = screen.getByRole('checkbox', { name: 'Feline' })
        const petCheckbox = screen.getByRole('checkbox', { name: 'Pet' })

        await userEvent.click(felineCheckbox)
        await userEvent.click(petCheckbox)

        const rows = dataRows()
        expect(rows.length).toBe(1)

        const filter = screen.getByRole('dialog')
        const resetButton = within(filter).getByRole('button', { name: /reset/i })

        await userEvent.click(resetButton)
        const allRows = dataRows()

        expect(allRows.length).toBe(collection.length)
      })
    })
  })
})

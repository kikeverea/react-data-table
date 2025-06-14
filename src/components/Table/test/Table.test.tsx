import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table from '../Table.tsx'
import { TableColumn } from '../types/types.ts'

import { parse } from 'date-fns'

export type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

describe('Table', () => {

  const columns: TableColumn<TestData>[] = [
    { name: 'Name', data: item => `${item.name}`},
    { name: 'Family', data: item => `${item.family}`},
    { name: 'Type', data: item => `${item.type}`},
    { name: 'Age', data: item => `${item.age}`, type: 'number' },
    { name: 'Birth', data: item => `${item.birth}`, type: 'date' },
  ]

  const collection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' }
  ]

  const longCollection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
    { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
    { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
    { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
  ]

  describe('Without data', () => {
    test('renders header', () => {
      render(<Table collection={ [] } columns={ columns } />)

      const headerCells = screen.getAllByRole('columnheader')

      expect(headerCells[0].textContent).toBe('Name')
      expect(headerCells[1].textContent).toBe('Family')
      expect(headerCells[2].textContent).toBe('Type')
      expect(headerCells[3].textContent).toBe('Age')
      expect(headerCells[4].textContent).toBe('Birth')
    })

    test('renders empty message', () => {
      render(<Table collection={ [] } columns={ columns } />)

      const rows = screen.getAllByRole('row').slice(1)
      const [emptyMessage] = getNameCellsContent(rows)

      expect(rows.length).toBe(1)
      expect(emptyMessage).toBe('No data available')
    })

    test('renders custom empty message', () => {
      render(<Table collection={ [] } columns={ columns } noEntriesMessage='No entries'/>)

      const rows = screen.getAllByRole('row').slice(1)
      const [emptyMessage] = getNameCellsContent(rows)

      expect(rows.length).toBe(1)
      expect(emptyMessage).toBe('No entries')
    })
  })

  describe('With data', () => {

    test('renders collection', () => {
      render(<Table collection={ collection } columns={ columns }/>)

      const rows = screen.getAllByRole('row')

      rows.slice(1).forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')
        cells.forEach((cell, colIndex) => {
          expect(cell.textContent)
            .toBe(getTestData({ row: rowIndex, col: colIndex}))
        })
      })
    })

    describe('Search', () => {
      test('renders rows that pass the search', () => {
        render(<Table collection={ collection } columns={ columns } search='dog' />)

        const rows = screen.getAllByRole('row').slice(1)
        const [lion] = getNameCellsContent(rows)

        expect(rows.length).toBe(1)
        expect(lion).toBe('Dog')
      })

      test('renders empty message if no row passes the search', () => {
        render(<Table collection={ collection } columns={ columns } search='no-rows' />)

        const rows = screen.getAllByRole('row').slice(1)
        const [emptyMessage] = getNameCellsContent(rows)

        expect(rows.length).toBe(1)
        expect(emptyMessage).toBe('No data available')
      })
    })

    describe('Filter', () => {

      test('renders rows that pass the filter', () => {
        render(<Table collection={ longCollection } columns={ columns } filter={{
            'Family': ['feline', 'canine'],
            'Type': ['wild'],
          }}
        />)

        const rows = screen.getAllByRole('row').slice(1)
        const [lion, redFox] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(lion).toBe('Lion')
        expect(redFox).toBe('Red Fox')
      })

      test('renders rows that pass the filter and search', () => {
        render(<Table collection={ collection } columns={ columns } search='cat' filter={{ 'Family': ['feline'] }} />)

        const rows = screen.getAllByRole('row').slice(1)
        const [cat] = getNameCellsContent(rows)

        expect(rows.length).toBe(1)
        expect(cat).toBe('Cat')
      })

      test('renders rows that pass the range filter', () => {
        render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 8, max: 15, type: 'number'} }} />)

        const rows = screen.getAllByRole('row').slice(1)

        // Names in expected order
        const [cat, lion] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
      })


      test('renders rows that pass the range filter, edge cases', () => {
        render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 10, max: 13, type: 'number'} }} />)

        const rows = screen.getAllByRole('row').slice(1)

        // Names in expected order
        const [cat, lion] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
      })

      test('renders rows that pass a min range filter', () => {
        render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 12, type: 'number'} }} />)

        const rows = screen.getAllByRole('row').slice(1)

        // Names in expected order
        const [lion, seaLion] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test.each([
        { 'Age': { min: 18 } },
        { 'Age': { max: 2 } },
        { 'Age': { min: 18, max: 20 } },
        { 'Family': ['feline'], 'Name': ['dog'] }
      ])
      ('renders empty message if no row passes the filter', noPassFilter => {
        render(<Table collection={ collection } columns={ columns } filter={ noPassFilter as { [column: string]: any } } />)

        const rows = screen.getAllByRole('row').slice(1)
        const [emptyMessage] = getNameCellsContent(rows)

        expect(rows.length).toBe(1)
        expect(emptyMessage).toBe('No data available')
      })

      test('renders empty message if no row passes the filter and search', () => {
        render(<Table collection={ collection } columns={ columns } search='dog' filter={{ 'Family': ['feline'] }} />)

        const rows = screen.getAllByRole('row').slice(1)
        const [emptyMessage] = getNameCellsContent(rows)

        expect(rows.length).toBe(1)
        expect(emptyMessage).toBe('No data available')
      })

      test('renders rows that pass the max range filter', () => {
        render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { max: 12, type: 'number' } }} />)

        const rows = screen.getAllByRole('row').slice(1)

        // Names in expected order
        const [cat, dog] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
      })

      test('renders rows that pass the date range filter', () => {
        const dateFormat = 'yyyy-MM-dd'

        render(
          <Table
            collection={ collection }
            columns={ columns }
            filter={{
              'Birth': {
                min: '2012-07-14',
                max: '2015-07-14',
                type: 'date',
                parser: date => parse(date, dateFormat, new Date()).getTime()
              }}}
          />)

        const rows = screen.getAllByRole('row').slice(1)

        // Names in expected order
        const [cat, lion] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
      })

      test('renders rows that pass a range filter, filter and search', () => {
        render(<Table
          collection={ collection }
          columns={ columns }
          filter={{ 'Age': { min: 8, max: 16, type: 'number' }, 'Family': ['feline'] }}
          search='Lion'
        />)

        const rows = screen.getAllByRole('row').slice(1)
        const [lion] = getNameCellsContent(rows)

        expect(rows.length).toBe(1)
        expect(lion).toBe('Lion')
      })
    })

    describe('Pagination', () => {

      test('without pagination, page numbers are not rendered', () => {
        render(<Table collection={ collection } columns={ columns } />)

        const paginationNavigation = screen.queryByLabelText('Pagination Navigation')
        expect(paginationNavigation).toBeNull()
      })

      test('with pagination, render page numbers', () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        expect(paginationNavigation).toBeDefined()

        const pageLinks = within(paginationNavigation).getAllByRole('listitem')
        expect(pageLinks.length).toBe(2)

        pageLinks.forEach((link, ind) => {
          expect(link.textContent).toBe(`${ind + 1}`)
        })
      })

      test('page numbers include aria-current for accessibility', () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageLinks = within(paginationNavigation).getAllByRole('listitem')

        expect(pageLinks[0].ariaCurrent).toBe('true')
        expect(pageLinks[1].ariaCurrent).toBe('false')
      })

      test('with pagination, render pagination info', () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 2 }/>)

        const paginationInfo = screen.getByRole('status')

        expect(paginationInfo.textContent).toBe(`Showing 1 to 2 of ${longCollection.length} records`)
      })

      test('paginates data', () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(2)

        // Names in expected order
        const [cat, dog] = getNameCellsContent()

        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
      })

      test('render the selected page data', async () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageNumbers = within(paginationNavigation).getAllByRole('listitem')

        await userEvent.click(pageNumbers[1])

        // Names in expected order
        const [lion, seaLion] = getNameCellsContent()

        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('if more than 6 pages, render navigation arrows', () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 1 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const pageNumbers = within(paginationNavigation).getAllByRole('listitem')
        const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')
        const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')

        expect(pageNumbers.length - 2).toBe(6)
        expect(leftArrow).toBeDefined()
        expect(rightArrow).toBeDefined()
      })

      test('left arrow navigates to previous page', async () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 1 } page={ 4 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')
        await userEvent.click(leftArrow)

        const [cellName] = getNameCellsContent()
        const expectedPage = 3

        expect(cellName).toBe(longCollection[expectedPage].name)
      })

      test('left arrow navigates to next page', async () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 1 } page={ 4 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')
        await userEvent.click(rightArrow)

        const [cellName] = getNameCellsContent()
        const expectedPage = 5

        expect(cellName).toBe(longCollection[expectedPage].name)
      })

      test('has select for choosing items per page', () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 2 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageCountSelect = within(paginationNavigation).getByRole('combobox')

        expect(pageCountSelect).toBeDefined()
      })

      test('has select for choosing items per page', async () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 2 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageCountSelect = within(paginationNavigation).getByRole('combobox')

        await userEvent.selectOptions(pageCountSelect, '10')

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows).toHaveLength(Math.min(longCollection.length, 10))
      })
    })

    describe('Sorting', () => {
      test('sorts rows ascending', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'family' }} />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(collection.length)

        // Names in expected order
        const [dog, cat, lion, seaLion] = getNameCellsContent(rows)

        expect(dog).toBe('Dog')
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('sorts rows descending', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'family', direction: 'desc' }} />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(collection.length)

        // Names in expected order
        const [seaLion, cat, lion, dog] = getNameCellsContent(rows)

        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
        expect(dog).toBe('Dog')
        expect(seaLion).toBe('Sea Lion')
      })

      test('sorts by number asc', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'age' }} />)

        // Names in expected order
        const [dog, cat, lion, seaLion] = getNameCellsContent()

        expect(dog).toBe('Dog')
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('sorts by number desc', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'age', direction: 'desc' }} />)

        // Names in expected order
        const [seaLion, lion, cat, dog] = getNameCellsContent()

        expect(seaLion).toBe('Sea Lion')
        expect(lion).toBe('Lion')
        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
      })

      test('sorts by date asc', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'birth' }} />)

        // Names in expected order
        const [seaLion, lion, cat, dog] = getNameCellsContent()

        expect(seaLion).toBe('Sea Lion')
        expect(lion).toBe('Lion')
        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
      })

      test('sorts by date desc', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'birth', direction: 'desc' }} />)

        // Names in expected order
        const [dog, cat, lion, seaLion] = getNameCellsContent()

        expect(dog).toBe('Dog')
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test.each(['asc', 'desc'])
      ('sorts invalid dates in last positions', sortDirection=> {
        render(<Table
          collection={ [...collection, { id: 5, name: 'Invalid', family: 'x', type: 'x', age: 0, birth: 'invalid' }] }
          columns={ columns }
          sort={{ by: 'birth', direction: sortDirection as ('asc' | 'desc') }}
        />)

        // Names in expected order
        const [_animal1, _animal2, _animal3, _animal4, invalid] = getNameCellsContent()
        expect(invalid).toBe('Invalid')
      })

      test('sorts rows that pass a range filter, filter and search', () => {
        render(<Table
          collection={ collection }
          columns={ columns }
          filter={{ 'Age': { min: 8, max: 16, type: 'number' } }}
          search='Lion'
          sort={{ by: 'name', direction: 'desc' }}
        />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(2)

        // Names in expected order
        const [seaLion, lion] = getNameCellsContent(rows)

        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('sorts a filtered, paginated collection', () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'family' }} pagination={ 2 } />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(2)

        // Names in expected order
        const [dog, cat] = getNameCellsContent(rows)

        expect(dog).toBe('Dog')
        expect(cat).toBe('Cat')
      })

      test('sorts the table by the clicked header', async () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'family' }} />)

        const nameHeader = screen.getAllByRole('columnheader')[0]
        await userEvent.click(nameHeader)

        // Names in expected order
        const [cat, dog, lion, seaLion] = getNameCellsContent()

        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('toggles sort direction when clicking the sorting header', async () => {
        render(<Table collection={ collection } columns={ columns } sort={{ by: 'family', direction: 'asc'}} />)

        const familyHeader = screen.getAllByRole('columnheader')[1]
        await userEvent.click(familyHeader)

        // Names in expected order
        const [seaLion, cat, lion, dog] = getNameCellsContent()

        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('sorts a paginated collection', () => {
        render( <Table collection={ longCollection } columns={ columns } sort={{ by: 'family' }} pagination={ 2 } />)

        // Names in expected order
        const [dog, cat] = getNameCellsContent()

        expect(dog).toBe('Dog')
        expect(cat).toBe('Cat')
      })
    })
  })
})
import { formatDate, parseDate, TestData } from '../testUtils.ts'
import { processData } from './dataProcessor.ts'
import { TableColumn, TableSort } from './types.ts'
import {TableFilter} from '../TableFilter/types.ts'

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
  { name: 'Name', data: item => item.name },
  { name: 'Family', data: item => item.family },
  { name: 'Type', data: item => item.type },
  { name: 'Age', data: item => item.age },
  { name: 'Birth', data: item => parseDate(item.birth), presenter: formatDate },
]

const names = (data: TestData[]): string[] => data.map(item => item.name)

const get = (...names: string[]): string[] => {
  return names.reduce((items, name) => {
    const item = collection.find(item => item.name.toLowerCase() === name.toLowerCase())

    if (!item)
      throw new Error(`Test error!: No item found with name'${name}'`)

    return item ? [ ...items, item.name ] : items
  },
  [] as string[])
}

describe('Data processor', () => {

  describe('Search', () => {

    test('return an item that passes the search', () => {
      const data = processData(collection, columns, { search: 'dog' })
      expect(names(data)).toEqual(get('Dog'))
    })

    test('return multiple items if they pass the search', () => {
      const data = processData(collection, columns, { search: 'lion' })
      expect(names(data)).toEqual(get('Lion', 'Sea Lion'))
    })

    test('return empty array if no items pass the test', () => {
      const data = processData(collection, columns, { search: 'no-go' })
      expect(names(data)).toHaveLength(0)
    })
  })

  describe('Filter', () => {

    test('return items that pass the filter', () => {
      const filter = {'Family': ['feline', 'canine'], 'Type': ['wild'] }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toEqual(get('Lion', 'Red Fox'))
    })

    test('return empty array if no item passes the filter', () => {
      const filter = {'Family': ['fish'], 'Type': ['wild'] }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toHaveLength(0)
    })

    test('return items that pass the range filter', () => {
      const filter: TableFilter = { 'Age': { min: 8, max: 15 } }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toEqual(get('Cat', 'Lion'))
    })

    test('return items that pass the range filter, edge cases', () => {
      const filter = { 'Age': { min: 10, max: 13 } }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toEqual(get('Cat', 'Lion'))
    })

    test('return items that pass a min range filter', () => {
      const filter = { 'Age': { min: 12 } }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toEqual(get('Lion', 'Sea Lion'))
    })

    test('return empty array if no item passes the range filter', () => {
      const filter = { 'Age': { min: 13, max: 10 } }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toHaveLength(0)
    })

    test('return items that pass the max range filter', () => {
      const filter = { 'Age': { max: 12 } }

      const data = processData(collection, columns, { filter })
      expect(names(data)).toEqual(get('Cat', 'Dog', 'Red Fox', 'Gold Fish', 'Monkey'))
    })

    test('return items that pass a parsed range filter', () => {
      const filter = {
        'Birth': {
            min: '2012-07-14',
            max: '2015-07-14',
            parser: (date: string) => new Date(date).getTime()
        }}

      const data = processData(collection, columns, { filter })
      expect(names(data)).toEqual(get('Cat', 'Lion'))
    })
  })

  describe('Pagination', () => {

    test('paginates data', () => {
      const data = processData(collection, columns, { paginate: 2 })
      expect(names(data)).toEqual(get('Cat', 'Dog'))
    })

    test('return selected page data', async () => {
      const data = processData(collection, columns, { paginate: 2, page: 1 })
      expect(names(data)).toEqual(get('Lion', 'Sea Lion'))
    })
  })

  describe('Sorting', () => {
    test('sorts collection ascending', () => {
      const sort = { column: 'family' }

      const data = processData(collection, columns, { sort })
      expect(names(data)).toEqual(get('Dog', 'Red Fox', 'Cat', 'Lion', 'Gold Fish', 'Monkey', 'Sea Lion' ))
    })

    test('sorts collection descending', () => {
      const sort: TableSort = { column: 'family', direction: 'desc' }

      const data = processData(collection, columns, { sort })
      expect(names(data)).toEqual(get('Sea Lion', 'Monkey', 'Gold Fish', 'Cat', 'Lion', 'Dog', 'Red Fox'))
    })

    test('sorts by number asc', () => {
      const sort: TableSort = { column: 'age' }

      const data = processData(collection, columns, { sort })
      expect(names(data)).toEqual(get('Gold Fish', 'Dog', 'Monkey', 'Red Fox', 'Cat', 'Lion', 'Sea Lion'))
    })

    test('sorts by number desc', () => {
      const sort: TableSort = { column: 'age', direction: 'desc' }

      const data = processData(collection, columns, { sort })
      expect(names(data)).toEqual(get('Sea Lion', 'Lion', 'Cat', 'Red Fox', 'Dog', 'Monkey', 'Gold Fish'))
    })

    test('sorts by date asc', () => {
      const sort: TableSort = { column: 'birth' }

      const data = processData(collection, columns, { sort })
      expect(names(data)).toEqual(get('Sea Lion', 'Lion', 'Cat', 'Red Fox', 'Monkey', 'Dog', 'Gold Fish'))
    })

    test('sorts by date desc', () => {
      const sort: TableSort = { column: 'birth', direction: 'desc' }

      const data = processData(collection, columns, { sort })
      expect(names(data)).toEqual(get('Gold Fish', 'Dog', 'Monkey', 'Red Fox', 'Cat', 'Lion', 'Sea Lion'))
    })
  })


  describe('Integration', () => {
    test('return items that pass the filter and search', () => {
      const filter = { 'Family': ['feline'] }

      const data = processData(collection, columns, { filter, search: 'ca' })
      expect(names(data)).toEqual(get('Cat'))
    })

    test('return empty array if no items pass the filter and search', () => {
      const filter = { 'Family': ['feline'] }

      const data = processData(collection, columns, { filter, search: 'no cats' })
      expect(names(data)).toHaveLength(0)
    })

    test('return items that pass a range filter, filter and search', () => {

      const filter = { 'Age': { min: 8, max: 16 }, 'Family': ['feline'] }

      const data = processData(collection, columns, { filter, search: 'lio' })
      expect(names(data)).toEqual(get('Lion'))
    })

    test('sorts rows that pass a range filter, filter and search', () => {
      const args = {
        filter: { 'Age': { min: 8, max: 16 }},
        search: 'Lion',
        sort: { column: 'name', direction: 'desc' } as TableSort
      }

      const data = processData(collection, columns, args)

      expect(names(data)).toEqual(get('Sea Lion', 'Lion'))
    })

    test('sorts a filtered, paginated collection', () => {
      const args = {
        filter: { 'Age': { min: 6, max: 16 }},
        sort: { column: 'family', direction: 'desc' } as TableSort,
        paginate: 2,
        page: 0,
      }

      const firstPageSorted = processData(collection, columns, args)
      expect(names(firstPageSorted)).toEqual(get('Cat', 'Lion'))

      const lastPageSorted = processData(collection, columns, { ...args, page: 1 })
      expect(names(lastPageSorted)).toEqual(get('Sea Lion', 'Red Fox'))
    })
  })

})
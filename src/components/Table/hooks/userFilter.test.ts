import {FilterColumns, FilterStructure} from '../types/types.ts'
import { buildFilterStructure } from './useFilter'
import {TestData} from '../test/Table.test.tsx'


const columns: FilterColumns = [ 'family', 'type', ['age', 'range', 'number'], ['birth', 'range', 'date'] ]

const longCollection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

test('creates a correct filter structure', () => {

  const expected: FilterStructure = {
    'family': ['Feline', 'Canine', 'Seals', 'Fish', 'Primate'],
    'type': ['Pet', 'Wild'],
    'age': { type: 'number', range: true },
    'birth': { type: 'date', range: true },
  }

  const filter = buildFilterStructure(columns, longCollection)

  expect(Object.keys(filter)).toHaveLength(Object.keys(expected).length)
  expect(filter).toEqual(expected)
})

import {FilterColumns, TableFilterProp} from '../types/types.ts'
import { extractFilter } from './useFilter'
import {TestData} from '../Table.test.tsx'


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
  const expected: TableFilterProp = {
    'family': {
      'Feline': false,
      'Canine': false,
      'Seals': false,
      'Fish': false,
      'Primate': false,
    },
    'type': {
      'Pet': false,
      'Wild': false,
    },
    'age': { min: undefined, max: undefined, type: 'number' },
    'birth': { min: undefined, max: undefined, type: 'date' },
  }

  const filter = extractFilter(columns, longCollection)

  expect(Object.keys(filter)).toHaveLength(4)
  expect(filter).toEqual(expected)
})

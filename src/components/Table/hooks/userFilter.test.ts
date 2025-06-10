import {TableColumn, TableFilterProp} from '../types/types.ts'
import { TestData } from '../Table.test.tsx'
import { extractFilter } from './useFilter'


const columns: TableColumn<TestData>[] = [
  { name: 'Name', data: item => `${item.name}`},
  { name: 'Family', data: item => `${item.family}`},
  { name: 'Type', data: item => `${item.type}`},
  { name: 'Age', data: item => `${item.age}`, type: 'number' },
  { name: 'Birth', data: item => `${item.birth}`, type: 'date' },
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

test('creates a correct filter structure', () => {

  const expected: TableFilterProp = {
    'Family': {
      'Feline': false,
      'Canine': true,
      'Seals': true,
      'Fish': true,
      'Primate': false,
    },
    'Type': {
      'Pet': true,
      'Wild': false,
    },
    'Age': { min: 5, max: 8 },
    'Birth': { min: '2019-03-22', max: '2021-03-22' },
  }

  const filter = extractFilter([['family']], longCollection)

  // const [family, type, age, birth] = Object.keys(filter)

  expect(filter).toEqual(expected)
})

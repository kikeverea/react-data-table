import {formatDate, parseDate, TestData} from '../../../testUtils.ts'
import {TableColumn} from '../../types.ts'
import {mapToData} from '../dataProcessor.ts'

const collection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
]

const columns: TableColumn<TestData>[] = [
  { name: 'Name', data: item => item.name },
  { name: 'Family', data: item => item.family },
  { name: 'Type', data: item => item.type },
  { name: 'Age', data: item => item.age },
  { name: 'Birth', data: item => parseDate(item.birth), presenter: formatDate },
]

describe('Data mapper', () => {

  test('map collection to table data', () => {
    const mapped = mapToData(collection, columns)

    expect(mapped).toEqual([
      { id: 1,
        data: {
          ['name']: { value: 'Cat', presenter: undefined },
          ['family']: { value: 'Feline', presenter: undefined },
          ['type']: { value: 'Pet', presenter: undefined },
          ['age']: { value: 10, presenter: undefined },
          ['birth']: { value: parseDate('2015-07-14'), presenter: formatDate },
        },
      },
      { id: 2,
        data: {
          ['name']: { value: 'Dog', presenter: undefined },
          ['family']: { value: 'Canine', presenter: undefined },
          ['type']: { value: 'Pet', presenter: undefined },
          ['age']: { value: 5, presenter: undefined },
          ['birth']: { value: parseDate('2020-07-14'), presenter: formatDate },
        },
      },
      { id: 3,
        data: {
          ['name']: { value: 'Lion', presenter: undefined },
          ['family']: { value: 'Feline', presenter: undefined },
          ['type']: { value: 'Wild', presenter: undefined },
          ['age']: { value: 13, presenter: undefined },
          ['birth']: { value: parseDate('2012-07-14'), presenter: formatDate },
        },
      },
    ])
  })
})
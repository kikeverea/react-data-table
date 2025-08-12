import './App.css'
import {TableColumn} from "./components/Table/types.ts";
import DataTable from './components/DataTable/DataTable.tsx'
import {formatDate, parseDate, parseUserInputDate} from './components/testUtils.ts'

type Animal = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

function App() {

  const formatDate = (date: string): string => {
    const [year, month, day] = date.split('-')
    return `${day}-${month}-${year}`
  }

  const parseDate = (date: string): number => {
    const [day, month, year] = date.split('-')
    return Date.parse(`${day}-${month}-${year}`)
  }

  const columns: TableColumn<Animal>[] = [
    { name: 'Name', data: item => item.name},
    { name: 'Family', data: item => item.family},
    { name: 'Type', data: item => item.type},
    { name: 'Age', data: item => item.age, type: 'number'},
    { name: 'Birth', data: item => item.birth, format: formatDate, type: 'date'},
  ]

  const collection: Animal[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
    { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 16, birth: '2019-03-22' },
    { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 16, birth: '2022-11-16' },
    { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 16, birth: '2020-08-01' }
  ]

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DataTable
          collection={ collection }
          columns={ columns }
          sortBy={{ column: 'family' }}
          filter={['Family', 'Type', ['Age', 'range', 'number'], ['Birth', 'range', 'date', parseDate ]]}
        />
      </div>
    </>
  )
}

export default App

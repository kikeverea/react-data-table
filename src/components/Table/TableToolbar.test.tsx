import {render, screen} from '@testing-library/react'
import TableToolbar from './TableToolbar.tsx'

describe('Table Toolbar', () => {
  test('Renders search bar by default', () => {
    render(<TableToolbar />)

    const searchBar = screen.getByLabelText('table search')
    expect(searchBar).toBeDefined()
  })

  test('Renders filter bar by default', () => {
    render(<TableToolbar filter={['fake', 'filter']}/>)

    const filterParam = screen.getByLabelText('fake')
    expect(filterParam).toBeDefined()
  })
})


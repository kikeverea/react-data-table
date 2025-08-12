import filterReducer from './filterReducer.ts'

describe('filterReducer', () => {

  describe('toggle column', () => {
    test('selecting a column value adds the column and value to the filter', () => {
      const state = filterReducer(
        {},
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'Feline', selected: true }}
      )
      expect(state).toEqual({ Family: ['Feline'] })
    })

    test('selecting a column value of a column already present in the filter, adds the value to the filter', () => {
      const state = filterReducer(
        { Family: ['Feline'] },
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'Canine', selected: true }}
      )
      expect(state).toEqual({ Family: ['Feline', 'Canine'] })
    })

    test('unselecting a column value removes the value from the filter', () => {
      const state = filterReducer(
        { Family: ['Feline', 'Canine'] },
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'Canine', selected: false }}
      )
      expect(state).toEqual({ Family: ['Feline'] })
    })

    test('unselecting the last value of a column produces an empty array', () => {
      const state = filterReducer(
        { Family: ['Feline'] },
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'Feline', selected: false }}
      )
      expect(state).toEqual({ Family: [] })
    })
  })

  describe('filter range', () => {
    test.each([10, '10'])('sets a range min', min => {
      const state = filterReducer(
        {},
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', type: 'number', target: 'min', value: min }}
      )
      expect(state).toEqual({ Age: { min: 10 }})
    })

    test.each([12, '12'])('sets a range max', max => {
      const state = filterReducer(
        {},
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', type: 'number', target: 'max', value: max }}
      )
      expect(state).toEqual({ Age: { max: 12 }})
    })

    test('sets a range min and max', () => {
      const minState = filterReducer(
        {},
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', type: 'number', target: 'min', value: 10 }}
      )

      const minMaxState = filterReducer(
        minState,
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', type: 'number', target: 'max', value: 16 }}
      )

      expect(minMaxState).toEqual({ Age: { min: 10, max: 16 }})
    })
  })

  test('reset filter', () => {
    const state = filterReducer(
      { Family: ['Feline', 'Canine'], Age: { min: '10', max: '12', type: 'number' } },
      { type: 'RESET_FILTER' }
    )
    expect(state).toEqual({})
  })
})




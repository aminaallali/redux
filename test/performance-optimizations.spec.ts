import { createStore, combineReducers } from 'redux'
import isPlainObject from '../src/utils/isPlainObject'
import { vi } from 'vitest'

describe('Performance Optimizations', () => {
  it('should handle listener management efficiently', () => {
    const store = createStore((state: number = 0, action: any) => {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        default:
          return state
      }
    })

    const listeners: Array<ReturnType<typeof vi.fn>> = []
    const unsubscribers: Array<() => void> = []

    // Add multiple listeners
    for (let i = 0; i < 100; i++) {
      const listener = vi.fn()
      listeners.push(listener)
      unsubscribers.push(store.subscribe(listener))
    }

    // Dispatch an action to trigger all listeners
    store.dispatch({ type: 'INCREMENT' })

    // Verify all listeners were called
    listeners.forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(1)
    })

    // Remove half of the listeners
    for (let i = 0; i < 50; i++) {
      unsubscribers[i]()
    }

    // Dispatch another action
    store.dispatch({ type: 'INCREMENT' })

    // Verify only remaining listeners were called
    listeners.slice(0, 50).forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(1) // Still only called once
    })

    listeners.slice(50).forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(2) // Called twice
    })

    // Remove all remaining listeners
    unsubscribers.slice(50).forEach(unsubscribe => unsubscribe())

    // Dispatch final action
    store.dispatch({ type: 'INCREMENT' })

    // Verify the total calls haven't increased for removed listeners
    listeners.slice(0, 50).forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(1) // Still only called once
    })

    listeners.slice(50).forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(2) // Still called twice
    })
  })

  it('should handle combineReducers efficiently with many keys', () => {
    const reducers: Record<string, (state: number, action: any) => number> = {}
    
    // Create many reducers
    for (let i = 0; i < 50; i++) {
      reducers[`reducer${i}`] = (state = i, action) => {
        return action.type === `UPDATE_${i}` ? state + 1 : state
      }
    }

    const rootReducer = combineReducers(reducers)

    const initialState = rootReducer(undefined, { type: '@@INIT' })
    
    // Verify initial state
    expect(Object.keys(initialState)).toHaveLength(50)
    for (let i = 0; i < 50; i++) {
      expect(initialState[`reducer${i}`]).toBe(i)
    }

    // Test state updates
    const newState = rootReducer(initialState, { type: 'UPDATE_25' })
    expect(newState.reducer25).toBe(26)
    expect(newState.reducer0).toBe(0) // Others unchanged
  })

  it('should handle isPlainObject efficiently', () => {
    // Test various object types
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject('string')).toBe(false)
    expect(isPlainObject(42)).toBe(false)
    expect(isPlainObject(function() {})).toBe(false)
  })
})
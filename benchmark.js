#!/usr/bin/env node

// Simple performance test to verify optimizations
const { createStore, combineReducers } = require('./dist/cjs/redux.cjs')
const isPlainObject = require('./dist/cjs/redux.cjs').isPlainObject

console.log('Running performance benchmarks...')

// Test 1: Listener management performance
function testListenerPerformance() {
  console.log('\n1. Testing listener management performance...')
  
  const store = createStore((state = 0, action) => {
    return action.type === 'INCREMENT' ? state + 1 : state
  })

  const listeners = []
  const unsubscribers = []

  // Add many listeners
  const startAdd = process.hrtime.bigint()
  for (let i = 0; i < 1000; i++) {
    unsubscribers.push(store.subscribe(() => {}))
  }
  const endAdd = process.hrtime.bigint()
  
  console.log(`  - Added 1000 listeners in ${Number(endAdd - startAdd) / 1000000}ms`)

  // Dispatch action
  const startDispatch = process.hrtime.bigint()
  store.dispatch({ type: 'INCREMENT' })
  const endDispatch = process.hrtime.bigint()
  
  console.log(`  - Dispatched action to 1000 listeners in ${Number(endDispatch - startDispatch) / 1000000}ms`)

  // Remove listeners
  const startRemove = process.hrtime.bigint()
  unsubscribers.forEach(unsub => unsub())
  const endRemove = process.hrtime.bigint()
  
  console.log(`  - Removed 1000 listeners in ${Number(endRemove - startRemove) / 1000000}ms`)
}

// Test 2: combineReducers performance
function testCombineReducersPerformance() {
  console.log('\n2. Testing combineReducers performance...')
  
  const reducers = {}
  for (let i = 0; i < 100; i++) {
    reducers[`reducer${i}`] = (state = i, action) => {
      return action.type === `UPDATE_${i}` ? state + 1 : state
    }
  }

  const startCombine = process.hrtime.bigint()
  const rootReducer = combineReducers(reducers)
  const endCombine = process.hrtime.bigint()
  
  console.log(`  - Combined 100 reducers in ${Number(endCombine - startCombine) / 1000000}ms`)

  const initialState = rootReducer(undefined, { type: '@@INIT' })
  
  const startDispatch = process.hrtime.bigint()
  for (let i = 0; i < 100; i++) {
    rootReducer(initialState, { type: `UPDATE_${i}` })
  }
  const endDispatch = process.hrtime.bigint()
  
  console.log(`  - Executed 100 state updates in ${Number(endDispatch - startDispatch) / 1000000}ms`)
}

// Test 3: isPlainObject performance
function testIsPlainObjectPerformance() {
  console.log('\n3. Testing isPlainObject performance...')
  
  const testObjects = [
    {},
    { a: 1 },
    Object.create(null),
    new Date(),
    [],
    null,
    undefined,
    'string',
    42,
    function() {}
  ]

  const startTest = process.hrtime.bigint()
  for (let i = 0; i < 10000; i++) {
    testObjects.forEach(obj => isPlainObject(obj))
  }
  const endTest = process.hrtime.bigint()
  
  console.log(`  - Tested isPlainObject 100,000 times in ${Number(endTest - startTest) / 1000000}ms`)
}

// Run all tests
testListenerPerformance()
testCombineReducersPerformance()
testIsPlainObjectPerformance()

console.log('\n✅ Performance benchmarks completed!')
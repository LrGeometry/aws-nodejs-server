const importEnv = require('../import-env')

beforeEach(() => {
  process.env = {}
})

const MY_VAR = 'FOO'

/* STRING */

test('String arg: looks up defined env vars', () => {
  process.env = { MY_VAR }
  const env = importEnv('MY_VAR')
  expect(env).toEqual({ MY_VAR })
})

test('String arg: looks up undefined env vars', () => {
  process.env = {}
  const env = importEnv('MY_VAR')
  expect(Object.keys(env)).toEqual(['MY_VAR'])
  expect(env).toEqual({})
})

/* OBJECT */

test('Object arg: looks up defined env vars', () => {
  process.env = { MY_VAR }
  const key = {
    name: 'MY_VAR'
  }
  const env = importEnv(key)
  expect(env).toEqual({ MY_VAR })
})

test('Object arg: looks up undefined env vars', () => {
  process.env = { MY_VAR }
  const key = {
    name: 'OTHER_VAR'
  }
  const env = importEnv(key)
  expect(Object.keys(env)).toEqual(['OTHER_VAR'])
  expect(env).toEqual({})
})

test('Object arg: aliases vars', () => {
  process.env = { MY_VAR }
  const key = {
    name: 'MY_VAR',
    alias: 'MY_ALIAS'
  }
  const env = importEnv(key)
  expect(env).toEqual({ MY_ALIAS: MY_VAR })
})

test('Object arg: falls back to defaults', () => {
  process.env = {}
  const defaultValue = 'my default'
  const key = {
    name: 'MY_VAR',
    default: defaultValue
  }
  const env = importEnv(key)
  expect(env).toEqual({ MY_VAR: defaultValue })
})

test('Object arg: requires vars', () => {
  process.env = {}
  const key = {
    name: 'MY_VAR',
    required: true
  }
  expect(() => importEnv(key)).toThrow()
})

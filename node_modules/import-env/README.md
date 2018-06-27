# import-env
*An easy way to require and configure env variables in Node.js*

[![NPM version](https://img.shields.io/npm/v/import-env.svg?style=flat-square)](https://www.npmjs.com/package/import-env)

This is a small helper module built on top of [dotenv](https://www.npmjs.com/package/dotenv) that allows you to load variables from a `.env` file and perform additional configuration, such as:
- Setting default values for variables
- Marking variables as required
- Renaming (aliasing) variables

## Basic example

```javascript
// In config.js

const importEnv = require('import-env')

const config = importEnv(
    {
        name: 'PORT',
        default: 4444
    },
    {
        name: 'GITHUB_USERNAME',
        alias: 'USER',
        required: true
    },
    {
        name: 'GITHUB_PASSWORD',
        alias: 'PASS',
        required: true
    }
)

module.exports = config

// Elsewhere in your app

const { PORT, USER, PASS } = require('./config')

```

Assuming your `.env` file looks like this:
```
GITHUB_USERNAME=my_username
GITHUB_PASSWORD=my_password
```
the above example would return an object that looks like this:
```javascript
{
    PORT: 4444,                   
    USER: 'my_username',
    PASS: 'my_password'
}
```

For more information on using `.env` files, see the docs for [dotenv](https://www.npmjs.com/package/dotenv).

## Usage

`importEnv` takes one-to-many arguments, the type of which can be the following:
- A **string** name of the variable to load from the `.env` file (with no associated configuration)
- A configuration **object** containing the name of the variable and any additional options

Example with both string and object arguments:
```javascript
const config = importEnv('API_PRIVATE', 'API_PUBLIC', { name: 'PASSWORD', required: true })
```

## Configuration object API

A configuration object can have the following properties:
- `name` (string, required) - The name of the variable to load from the `.env` file
- `alias` (string, optional) - The new name for the variable in the returned config object
- `default` (any, optional) - A fallback value for the variable if it isn't set in the `.env` file
- `required` (boolean, optional) - A flag indicating whether to throw an exception if the variable isn't found

## Edge cases

*What happens when a variable is set as `required` but a default value is provided?*

The variable will fall back to the default value before checking for presence, so the `required` check will never throw.

*What happens when a variable is not required and also not found?*

The key will still be in the returned object, but its value will be `undefined`.

*I want to have one of my env variables default to the value of another.*

This behavior can get complex as the order of operations may vary, so this function doesn't cover it. You can easily do it outside of the context of the function, though:

```javascript
const config = importEnv('VALUE', 'DEFAULT_VALUE')
if (!config.VALUE) config.VALUE = config.DEFAULT_VALUE
module.exports = config
```






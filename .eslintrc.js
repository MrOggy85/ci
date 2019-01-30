module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      browser: true,
      node: true,
      jest: true,
      es6: true,
    },
    extends: [
      'eslint:recommended',
      'airbnb-base',
    ],
    rules: {
      'max-len': 0,
      'prefer-destructuring': 0,
      'import/newline-after-import': 0,
      'arrow-body-style': ['error', 'always'],
      'object-curly-newline': 0,
    },
  }
  
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    "standard"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    /* See https://eslint.org/docs/rules/ */
    /* 0: off, 1: warn, 2: error          */

    /* Style rules reflecting Tag's preferences */
    "brace-style": [1, "allman", { allowSingleLine: true }],
    quotes: [2, "double"],
    camelcase: 0,
    semi: 0,
    "space-before-function-paren": 0,
    "one-var": 0,

    /* ESLint checks we should consider fixing in the future */
    eqeqeq: 0,
    "no-unused-vars": 0,
    "no-redeclare": 0,
    "no-undef": 0,
    "no-array-constructor": 0,
    "prefer-const": 0,
    "no-var": 0,
    "no-extend-native": 0,
    "prefer-regex-literals": 0,
    "no-prototype-builtins": 0
  }
};

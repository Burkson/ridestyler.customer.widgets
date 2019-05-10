module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    globals: {
        ridestyler: false
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? ["error", { allow: ["info"] }] : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}

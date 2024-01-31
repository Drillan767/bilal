import antfu from '@antfu/eslint-config'

export default antfu(
    {
        stylistic: {
            indent: 4,
            quotes: 'single',
        },
        ignores: [
            '.vscode/*',
        ],
    },
    {
        rules: {
            'vue/valid-v-slot': 'off',
        },
    },
)

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
      // ビルド生成物などは無視
      ignores: ['dist', 'node_modules'],
    },
    {
      // TypeScriptとReactの推奨設定を統合
      extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
      ],
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        ecmaVersion: 2020,
        globals: {
          ...globals.browser,
          ...globals.es2020,
        },
        // TypeScriptのパース設定を明示（これがあると型エラーが安定する）
        parserOptions: {
          project: ['./tsconfig.node.json', './tsconfig.app.json'],
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      rules: {
        // React Hooksのルール
        ...reactHooks.configs.recommended.rules,
        // Fast Refreshのルール
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
        // 個人開発を加速させるために少し緩める
        '@typescript-eslint/no-unused-vars': 'warn', // 未使用変数は警告まで
        '@typescript-eslint/no-explicit-any': 'off', // anyを許容（スプシ連携で楽するため）
      },
    }
)

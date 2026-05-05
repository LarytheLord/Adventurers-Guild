module.exports = {
  overrides: [
    {
      files: ['app/home/page.tsx'],
      rules: {
        'react/no-unescaped-entities': 'off',
      },
    },
    {
      files: ['components/landing/**/*.tsx'],
      rules: {
        'react/no-unescaped-entities': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};

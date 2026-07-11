/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        md: {
          primary: 'var(--md-primary)',
          'on-primary': 'var(--md-on-primary)',
          'primary-container': 'var(--md-primary-container)',
          'on-primary-container': 'var(--md-on-primary-container)',
          secondary: 'var(--md-secondary)',
          'on-secondary': 'var(--md-on-secondary)',
          'secondary-container': 'var(--md-secondary-container)',
          'on-secondary-container': 'var(--md-on-secondary-container)',
          tertiary: 'var(--md-tertiary)',
          'on-tertiary': 'var(--md-on-tertiary)',
          'tertiary-container': 'var(--md-tertiary-container)',
          'on-tertiary-container': 'var(--md-on-tertiary-container)',
          error: 'var(--md-error)',
          'on-error': 'var(--md-on-error)',
          'error-container': 'var(--md-error-container)',
          'on-error-container': 'var(--md-on-error-container)',
          background: 'var(--md-background)',
          'on-background': 'var(--md-on-background)',
          surface: 'var(--md-surface)',
          'on-surface': 'var(--md-on-surface)',
          'surface-variant': 'var(--md-surface-variant)',
          'on-surface-variant': 'var(--md-on-surface-variant)',
          outline: 'var(--md-outline)',
        }
      }
    },
  },
  plugins: [],
}

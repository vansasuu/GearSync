/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Updated plugin name
    'autoprefixer': {},
  },
};

export default config;
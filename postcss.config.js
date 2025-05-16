module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.js', // Explicitly point to config file
    },
    autoprefixer: {},
  },
};

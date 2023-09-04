/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.ts"],
  theme: {
    extend: {},
  },
  plugins: [],
};
module.exports = {
  //...
  plugins: [require("daisyui")],
  daisyui: {themes: ["retro"],},
  
}
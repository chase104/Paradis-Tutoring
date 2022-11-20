import serve from "rollup-plugin-serve";

import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
const production = process.env.NODE_ENV === "production";

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    css({ output: "bundle.css" }),

    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),

    !production &&
      serve({
        contentBase: "public", // The folder to serve files from
        historyApiFallback: true, // Respond to all server requests with `index.html`, useful for Single Page Applications
        port: 5000, // The port to run the server on
        open: true, // Optional: Open the browser automatically
      }),
    !production && livereload("public"),

    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

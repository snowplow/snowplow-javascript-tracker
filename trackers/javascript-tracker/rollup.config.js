import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import banner from 'rollup-plugin-banner';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import alias from '@rollup/plugin-alias';
import pkg from './package.json';

const bannerContent =
  '<%= pkg.description %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
  'Copyright Snowplow Analytics Ltd, Anthon Pang\n' +
  'Licensed under <%= pkg.license %>';

const plugins = [
  json(),
  nodeResolve({ browser: true }),
  commonjs(),
  ts({ tsconfig: './tsconfig.prod.json' }),
  compiler(),
  terser(),
  cleanup({ comments: 'none' }),
  banner(bannerContent),
  sizes(),
  filesize({ showMinifiedSize: false, showBeforeSizes: 'build' }),
];

export default [
  {
    input: './src/index.ts',
    plugins: plugins,
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.browser, format: 'iife' }],
  },
  {
    input: './src/index.ts',
    plugins: [
      alias({
        entries: [{ find: '../tracker.config', replacement: '../tracker.lite.config' }],
      }),
      ...plugins,
    ],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.browser.replace('.js', '.lite.js'), format: 'iife' }],
  },
];

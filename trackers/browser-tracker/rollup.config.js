import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import banner from 'rollup-plugin-banner';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';

import { builtinModules } from 'module';

const bannerContent =
  '@description <%= pkg.description %>\n' +
  '@version     <%= pkg.version %>\n' +
  '@copyright   Anthon Pang, Snowplow Analytics Ltd\n' +
  '@license     <%= pkg.license %>\n\n' +
  'Documentation: http://bit.ly/sp-js';

const plugins = [nodeResolve({ browser: true }), commonjs(), json(), ts()];

export default [
  {
    input: './src/index.ts',
    external: [/^lodash/, ...builtinModules, ...Object.keys(pkg.dependencies)],
    plugins: [...plugins, banner(bannerContent)],
    output: [{ file: pkg.module, format: 'es' }],
  },
  {
    input: './src/index.ts',
    plugins: [...plugins, banner(bannerContent)],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.main, format: 'umd', name: 'snowplow' }],
  },
  {
    input: './src/index.ts',
    plugins: [...plugins, compiler(), cleanup({ comments: 'none' }), banner(bannerContent)],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.main.replace('.js', '.min.js'), format: 'umd', name: 'snowplow' }],
  },
];

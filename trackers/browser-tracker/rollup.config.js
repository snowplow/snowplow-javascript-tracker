import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
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

const plugins = [
  json(),
  nodeResolve({ browser: true }),
  commonjs(),
  babel({
    babelrc: false,
    babelHelpers: 'bundled',
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            chrome: 32,
            ie: 9,
            edge: 13,
            firefox: 27,
            safari: 8,
          },
        },
      ],
    ],
  }),
];

export default [
  {
    input: 'src/js/snowplow.js',
    external: [/^lodash/, ...builtinModules, ...Object.keys(pkg.dependencies)],
    plugins: [...plugins, banner(bannerContent)],
    output: [{ file: pkg.module, format: 'es' }],
  },
  {
    input: 'src/js/snowplow.js',
    plugins: [...plugins, banner(bannerContent)],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.main, format: 'umd', name: 'snowplow' }],
  },
  {
    input: 'src/js/snowplow.js',
    plugins: [...plugins, compiler(), cleanup({ comments: 'none' }), banner(bannerContent)],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.main.replace('.js', '.min.js'), format: 'umd', name: 'snowplow' }],
  },
];

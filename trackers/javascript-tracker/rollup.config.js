import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import banner from 'rollup-plugin-banner';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import cleanup from 'rollup-plugin-cleanup';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';

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
  compiler(),
  cleanup({ comments: 'none' }),
  banner(bannerContent),
  sizes(),
  filesize({ showMinifiedSize: false, showBeforeSizes: 'build' }),
];

export default [
  {
    input: 'src/js/index.js',
    plugins: plugins,
    output: [{ file: pkg.main }],
  },
];

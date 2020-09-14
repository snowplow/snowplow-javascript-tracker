import gulp from 'gulp';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import cleanup from 'rollup-plugin-cleanup';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';

const basePlugins = [
  nodeResolve({
    browser: true,
  }),
  commonjs(),
  babel({
    babelHelpers: 'bundled',
  })
];

const minify = [
  compiler(), 
  cleanup({comments: 'none'})
]

const report = [
  sizes(), 
  filesize({showMinifiedSize: false, showBeforeSizes: 'build'})
]

const getSnowplowBundle = function () {
  return rollup({
    input: 'src/js/init.js',
    plugins: [...basePlugins, ...minify, ...report],
  });
};

export const build = async function () {
  const snowplow = await getSnowplowBundle();
  return await snowplow.write({
    file: 'dist/sp.js',
    format: 'iife',
  });
};

const testDetectors = async function () {
  const detectors = await rollup({
    input: 'tests/scripts/detectors.js',
    plugins: basePlugins,
  });
  return await detectors.write({
    name: 'detectors',
    file: 'tests/pages/detectors.js',
    format: 'iife',
  });
};

const testHelpers = async function () {
  const helpers = await rollup({
    input: 'tests/scripts/helpers.js',
    plugins: basePlugins,
  });
  return await helpers.write({
    name: 'helpers',
    file: 'tests/pages/helpers.js',
    format: 'iife',
  });
};

const testSnowplow = async function () {
  const snowplow = await getSnowplowBundle();
  return await snowplow.write({
    file: 'tests/pages/snowplow.js',
    format: 'iife',
  });
};

export const test = gulp.parallel(testDetectors, testHelpers, testSnowplow);

export default build;

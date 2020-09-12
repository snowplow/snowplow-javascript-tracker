const gulp = require('gulp');
const rollup = require('rollup');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').babel;

const plugins = [
  resolve({
    browser: true,
  }),
  commonjs(),
  babel({
    babelHelpers: 'bundled',
  }),
];

const build = async function () {
    const snowplowBundle = await rollup.rollup({
        input: 'src/js/init.js',
        plugins: plugins,
      });

  await snowplowBundle.write({
    file: 'dist/snowplow.js',
    format: 'iife',
  });
};

const testDetectors = async function () {
  const detectors = await rollup.rollup({
    input: 'tests/scripts/detectors.js',
    plugins: plugins,
  });

  await detectors.write({
    name: 'detectors',
    file: 'tests/pages/detectors.js',
    format: 'iife',
  });
};

const testHelpers = async function () {
  const helpers = await rollup.rollup({
    input: 'tests/scripts/helpers.js',
    plugins: plugins,
  });

  await helpers.write({
    name: 'helpers',
    file: 'tests/pages/helpers.js',
    format: 'iife',
  });
};

const testSnowplow = async function () {
    const snowplowBundle = await rollup.rollup({
        input: 'src/js/init.js',
        plugins: plugins,
      });

  await snowplowBundle.write({
    file: 'tests/pages/snowplow.js',
    format: 'iife',
  });
};

exports.build = build;
exports.test = gulp.parallel(testDetectors, testHelpers, testSnowplow);

exports.default = build;

import { rollup } from 'rollup';
import { core, licenseBanner, minify, sizeReport } from './rollup';

export const iife = async function () {
  const iife = await rollup({
    input: 'src/js/iife.js',
    plugins: [...core, ...minify, licenseBanner, ...sizeReport],
  });

  return await iife.write({
    file: 'dist/sp.js',
    format: 'iife',
  });
};

const snowplow = rollup({
  input: 'src/js/snowplow.js',
  plugins: [...core, licenseBanner],
});

export const cjs = async function () {
  return await (await snowplow).write({
    file: 'dist/sp.cjs.js',
    format: 'cjs',
  });
};

export const esm = async function () {
  return await (await snowplow).write({
    file: 'dist/sp.esm.js',
    format: 'es',
  });
};

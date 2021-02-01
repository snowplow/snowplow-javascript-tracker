import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const plugins = [json(), nodeResolve({ browser: true }), commonjs(), ts({ tsconfig: './tsconfig.prod.json' })];

export default [
  {
    input: './src/index.ts',
    plugins: plugins,
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: './test/pages/snowplow.js', format: 'iife' }],
  },
];

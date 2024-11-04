import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import commonjs from '@rollup/plugin-commonjs';
import { banner } from '../../banner';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';

import { builtinModules } from 'module';

const umdPlugins = [nodeResolve({ browser: true }), commonjs(), ts()];
const umdName = 'snowplowBrowserTracking';

export default [
  {
    input: './src/index.ts',
    external: [...builtinModules, ...Object.keys(pkg.dependencies)],
    plugins: [ts(), banner()],
    output: [{ file: pkg.module, format: 'es', sourcemap: true }],
  },
  {
    input: './src/index.ts',
    plugins: [...umdPlugins, banner()],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.main, format: 'umd', name: umdName, sourcemap: true }],
  },
  {
    input: './src/index.ts',
    plugins: [...umdPlugins, compiler(), cleanup({ comments: 'none' }), banner()],
    treeshake: { moduleSideEffects: ['jstimezonedetect'] },
    output: [{ file: pkg.main.replace('.js', '.min.js'), format: 'umd', name: umdName, sourcemap: true }],
  },
];

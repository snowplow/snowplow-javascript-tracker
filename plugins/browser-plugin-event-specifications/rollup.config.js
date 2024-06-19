import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-ts'; // Preferred over @rollup/plugin-typescript as it bundles .d.ts files
import { banner } from '../../banner';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';
import { builtinModules } from 'module';

const umdPlugins = [nodeResolve({ browser: true }), commonjs(), ts()];
const umdName = 'eventSpecifications';

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: './src/index.ts',
    plugins: [...umdPlugins, banner()],
    treeshake: { moduleSideEffects: ['sha1'] },
    output: [{ file: pkg.main, format: 'umd', sourcemap: true, name: umdName }],
  },
  {
    input: './src/index.ts',
    plugins: [...umdPlugins, compiler(), terser(), cleanup({ comments: 'none' }), banner()],
    treeshake: { moduleSideEffects: ['sha1'] },
    output: [{ file: pkg.main.replace('.js', '.min.js'), format: 'umd', sourcemap: true, name: umdName }],
  },
  {
    input: './src/index.ts',
    external: [...builtinModules, ...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)],
    plugins: [
      ts(), // so Rollup can convert TypeScript to JavaScript
      banner(),
    ],
    output: [{ file: pkg.module, format: 'es', sourcemap: true }],
  },
];

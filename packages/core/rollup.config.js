import ts from "@wessberg/rollup-plugin-ts"; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import pkg from './package.json';

import { builtinModules } from "module";

export default [
	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		input: './src/index.ts',
		external: [/^lodash/, ...builtinModules, ...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)],
		plugins: [
			ts() // so Rollup can convert TypeScript to JavaScript
		],
		output: [
			{ file: pkg.main, format: 'cjs', sourcemap: true },
			{ file: pkg.module, format: 'es', sourcemap: true }
		]
	}
];

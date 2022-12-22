/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import { banner } from '../../banner';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';
import { builtinModules } from 'module';

const umdPlugins = [nodeResolve({ browser: true }), commonjs(), ts()];
const umdName = 'snowplowFocalMeter';

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

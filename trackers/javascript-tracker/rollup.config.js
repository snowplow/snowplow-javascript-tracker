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
import ts from 'rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { banner } from '../../banner';
import { whitelabelBuild } from './build-config/index';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import alias from '@rollup/plugin-alias';
import pkg from './package.json';

export default (cmdlineArgs) => {
  const plugins = [
    json(),
    nodeResolve({ browser: true }),
    commonjs(),
    ts(),
    compiler(),
    terser(),
    cleanup({ comments: 'none' }),
    banner(),
    sizes(),
    filesize({ showMinifiedSize: false, showBeforeSizes: 'build' }),
  ];

  if (cmdlineArgs.whitelabel) {
    whitelabelBuild(cmdlineArgs, plugins);
  }

  return [
    {
      input: './src/index.ts',
      plugins: plugins,
      treeshake: { moduleSideEffects: ['jstimezonedetect'] },
      output: [{ file: pkg.browser, format: 'iife', sourcemap: true }],
    },
    {
      input: './src/index.ts',
      plugins: [
        alias({
          entries: [{ find: '../tracker.config', replacement: '../tracker.lite.config' }],
        }),
        ...plugins,
      ],
      treeshake: { moduleSideEffects: ['jstimezonedetect'] },
      output: [{ file: pkg.browser.replace('.js', '.lite.js'), format: 'iife', sourcemap: true }],
    },
  ];
};

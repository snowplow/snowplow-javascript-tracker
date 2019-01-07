/* globals process */
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import json from 'rollup-plugin-json'
import conditional from 'rollup-plugin-conditional'

const isProduction = process.env.buildTarget === 'PROD'




export default {
    input: 'src/js/init.js',
    output: {
        file: 'dist/test.js',
        format: 'umd',
    },
    treeshake: {
        propertyReadSideEffects: false,
        pureExternalModules: true,
    },

    plugins: [
        // replace({
        //     //include: ['node_modules/uuid/**'],
        //     delimiters: ['', ''],
        //     values: {
        //         'crypto.randomBytes': 'require(\'randombytes\')',
        //     },
        // }),
        json(),
        resolve({
            browser: true,
        }),
        commonjs({
            namedExports: {
                // left-hand side can be an absolute path, a path
                // relative to the current directory, or the name
                // of a module in node_modules
                'browser-cookie-lite': ['cookie'],
                jstimezonedetect: ['jstz'],
                murmurhash: ['v3'],
            },
        }),       
        babel({
            //exclude: ['**/node_modules/**', 'node_modules/**'], // only transpile our source code
        }),
        conditional(isProduction, [
            terser({
                parse: {
                    // parse options
                },
                compress: {
                    toplevel: true,
                    hoist_props: true,
                    hoist_funs: true,
                    arguments: true,
                    booleans: true,
                    booleans_as_integers: false,
                    unsafe: true,
                    unsafe_arrows: true,
                    unsafe_comps: true,
                    unsafe_Function: true,
                    unsafe_math: true,
                    unsafe_proto: true,
                    unsafe_regexp: true,
                    unused: true,
                    passes: 4,
                },
                mangle: {
                    //eval: true,
                    // properties: {
                    //     keep_quoted: true
                    // },
                },
                output: {
                    beautify: false,
                },
                ecma: 5,
                keep_classnames: false,
                keep_fnames: false,
                ie8: false,
                module: false,
                nameCache: null,
                safari10: false,
                toplevel: true,
                warnings: true,
            }),
        ]),
    ],
}

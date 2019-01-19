/* globals process */
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import json from 'rollup-plugin-json'
import analyze from 'rollup-plugin-analyzer'
import banner from './tools/banner'

const inputFile = 'src/init.js'
const inputFileTag = 'src/tag/tag.js'

const basePlugins = [
    json(),
    resolve({
        browser: true,
    }),
    commonjs()
]

const transpileBundle = [
    babel({
        rootMode: 'upward'
    })
]

const minifyBundle = [terser({
    parse: {
        // parse options
    },
    compress: {
        toplevel: true,
        hoist_props: true,
        hoist_funs: true,
        arguments: true,
        booleans: true,
        reduce_funcs: true,
        collapse_vars: true,
        reduce_vars: true,
        booleans_as_integers: false,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unused: true,
        passes: 10,
        keep_fnames: true
    },
    //We cannot mangle because of the way that snowplow calls functions
    mangle: {
        toplevel: true,
        module: true,
        // properties: {
        //     //regex: /^this.state/,
        //     //keep_quoted: true
        // },
        keep_fnames: true
    },
    output: {
        beautify: false,
        preamble: banner
    },
    ecma: 6,
    keep_classnames: false,
    keep_fnames: false,
    ie8: false,
    module: true,
    nameCache: null,
    safari10: false,
    toplevel: true,
    warnings: true,
})]

const analyzeBundle = [
    analyze({hideDeps: false, limit: 40})
]

export default [
    //Unminified, Bundled, Transpiled. 
    {
        input: inputFile,
        output: {
            file: 'dist/snowplow.js',
            format: 'iife',
            name: 'snowplow',
            banner,
            sourcemap: 'inline'
        },
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },

        plugins: [...basePlugins, ...transpileBundle],
    },
    
    //Bundled, Transpiled, Minified
    {
        input: inputFile,
        output: {
            file: 'dist/min/sp.js',
            format: 'iife', 
            name: 'snowplow'
        },
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },

        plugins: [...basePlugins, transpileBundle, ...minifyBundle, ...analyzeBundle],
    },
    
    //TAG: Minified
    {
        input: inputFileTag,
        output: {
            file: 'dist/min/tag.js',
            format: 'iife',
        },
        plugins: [terser({            
            compress: {
                unused: false,
            },
            mangle: false,
            output: {
                beautify: false,
                preamble: banner,
            },
            ecma: 5
        })],
    },
]

/* globals process */
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import json from 'rollup-plugin-json'
import banner from './tools/banner'

const inputFile = 'src/init.js'
const inputFileTag = 'src/tag/tag.js'

const basePlugins = [
    json(),
    resolve({
        browser: true,
    }),
    commonjs({
        namedExports: {
            'browser-cookie-lite': ['cookie'],
            jstimezonedetect: ['jstz'],
            murmurhash: ['v3'],
        },
    })
]

const transpile = [
    babel({
        //exclude: ['**/node_modules/**', 'node_modules/**'], // only transpile our source code
    })
]

const transpileNoBuiltIns = [
    babel({
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false,
                    useBuiltIns: 'false',
                    debug: false,
                    loose: false,
                    spec: false,
                },
            ],                    
        ],
    })
]

const minify = [terser({
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
    output: {
        beautify: false,
        preamble: banner
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
})]

export default [
    //Unminified, Bundled, Transpiled. 
    {
        input: inputFile,
        output: {
            file: 'dist/snowplow.js',
            format: 'umd',
            name: 'snowplow',
            banner
        },
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },

        plugins: [...basePlugins, ...transpile],
    },
    //Unminified, Bundled, Transpiled w/o Builtins. 
    {
        input: inputFile,
        output: {
            file: 'dist/snowplow-nobuiltins.js',
            format: 'umd',
            name: 'snowplow',
            banner
        },
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },

        plugins: [...basePlugins, ...transpileNoBuiltIns],
    },
    //Bundled, Transpiled, Minified
    {
        input: inputFile,
        output: {
            file: 'dist/min/sp.js',
            format: 'umd', 
            name: 'snowplow'
        },
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },

        plugins: [...basePlugins, ...transpile, ...minify],
    },
    //Bundled, Transpiled w/o Builtins, Minified
    {
        input: inputFile,
        output: {
            file: 'dist/min/sp-nobuiltins.js',
            format: 'umd',
            name: 'snowplow'
        },
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },

        plugins: [...basePlugins, ...transpileNoBuiltIns, ...minify],
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
            mangle: {
                reserved: ['p', 'l', 'o', 'w', 'i', 'n', 'g'],
                properties: {                    
                    reserved: ['p', 'l', 'o', 'w', 'i', 'n', 'g']
                },
            },
            output: {
                beautify: false,
                preamble: banner,
            },
            ecma: 5
        })],
    },
]

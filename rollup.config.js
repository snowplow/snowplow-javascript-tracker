import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
//import replace from 'rollup-plugin-replace'

export default {
    input: 'src/js/init.js',
    output: {
        file: 'dist/test.js',
        format: 'umd',
    },

    plugins: [
        // replace({
        //     //include: ['node_modules/uuid/**'],
        //     delimiters: ['', ''],
        //     values: {
        //         'crypto.randomBytes': 'require(\'randombytes\')',
        //     },
        // }),
        resolve({
            browser: true
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
            exclude: 'node_modules/**', // only transpile our source code
        }),
        
    ],
}

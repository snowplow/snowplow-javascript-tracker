import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

module.exports = [
    {
        input: 'src/js/init.js',
        output: [
            {
                file: 'dist/snowplow.js',
                format: 'iife'
            },
            {
                file: 'dist/sp.js',
                format: 'iife',
                // plugins: [terser()]
            }
        ],
        plugins: [
            resolve({
                browser: true
            }),
            commonjs(),
            babel({
                exclude: 'node_modules/**', // only transpile our source code
                babelHelpers: 'bundled'
            })
        ]
    }
];
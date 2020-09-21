import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';

export const rollupPlugins = [
    nodeResolve({
        browser: true,
    }),
    commonjs(),
    babel({
        babelrc: false,
        babelHelpers: 'bundled',
        presets: [
            [
                "@babel/preset-env",
                {
                    "targets": {
                        "chrome": 32,
                        "ie": 9,
                        "edge": 13,
                        "firefox": 27,
                        "safari": 8
                    },
                }
            ]
        ]
    })
];

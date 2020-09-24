import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import banner from 'rollup-plugin-banner'

export const basePlugins = [
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

const licenseBanner = 
"@description <%= pkg.description %>\n" +
"@version     <%= pkg.version %>\n" +
"@copyright   Anthon Pang, Snowplow Analytics Ltd\n" +
"@license     <%= pkg.license %>\n\n" +
"Documentation: http://bit.ly/sp-js";

export const spBannerPlugin = banner(licenseBanner);

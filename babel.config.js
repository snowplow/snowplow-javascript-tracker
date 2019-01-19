module.exports = function(api) {
    api.cache(false)
    return {
        env: {
            test: {
                ignore: [],
                sourceMaps: true,
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: 'auto',
                            loose: true,
                            debug: false,
                            useBuiltIns: 'usage',
                            targets: {
                                node: true,
                            },
                        },
                    ],
                ],
            },
            development: {
                ignore: [/\/node_modules\//],
                exclude: [/\/core-js\//, /\/node-modules\//],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                            useBuiltIns: 'usage',
                            debug: true,
                            loose: true,
                            spec: false,
                            shippedProposals: true,
                            exclude: ['es7.*', 'transform-regenerator', 'web.dom.iterable'],
                        },
                    ],
                ],
            },
        },
        overrides: [
            {
                test: './packages/snowplow-tracker-core',
                env: {
                    cjs: {
                        presets: [
                            [
                                '@babel/env',
                                {
                                    useBuiltIns: 'usage',
                                    debug: false,
                                    modules: 'cjs',
                                },
                            ],
                            '@babel/typescript',
                        ],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            //'lodash',
                            '@babel/proposal-class-properties',
                            '@babel/proposal-object-rest-spread',
                        ],
                        exclude: [/\/core-js\//],
                    },
                    mjs: {
                        presets: ['@babel/typescript', 'minify'],
                        plugins: [
                            //'@babel/plugin-transform-runtime',
                            //'lodash',
                            //'@babel/proposal-class-properties',
                            //'@babel/proposal-object-rest-spread'
                        ],
                        exclude: [/\/core-js\//],
                    },
                    test:{}
                },
            },
        ],
    }
}

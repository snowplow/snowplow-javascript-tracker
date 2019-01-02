module.exports = function(api) {
    api.cache(false)
    return {
        // ignore: [],
        // plugins: ['@babel/plugin-proposal-object-rest-spread'],
        // presets: [
        //     [
        //         '@babel/preset-env',
        //         {
        //             modules: false,
        //             useBuiltIns: 'usage',
        //             debug: true,
        //             loose: false,
        //             spec: false,
        //         },
        //     ],
        // ],
        env: {
            test: {                
                presets: [],
                // presets: [
                //     [
                //         '@babel/preset-env',
                //         {
                //             modules: 'auto',
                //             loose: true,
                //             debug: true,
                //             useBuiltIns: 'usage',
                //             targets: {
                //                 node: true,
                //             },
                //         },
                //     ],
                // ],
                plugins: [
                    [
                        'transform-es2015-modules-commonjs',
                        {
                            allowTopLevelThis: true,
                        },
                    ],
                ],
                //exclude: [/.*test.*/],
                //ignore: ['/test', 'node_modules/sinon', 'node_modules/mocha', 'node_modules/text-encoding'],
            },
            development: {
                ignore: [],
                plugins: ['@babel/plugin-proposal-object-rest-spread'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                            useBuiltIns: 'usage',
                            debug: true,
                            loose: false,
                            spec: false,
                        },
                    ],
                ],
            },
        },
    }
}

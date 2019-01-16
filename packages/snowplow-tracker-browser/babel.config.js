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
                ignore:  [/\/node_modules\//],
                exclude: [/\/core-js\//, /\/lodash\//, /\/lodash-es\//, /\/node-modules\//],
                plugins: ['@babel/plugin-proposal-object-rest-spread'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                            useBuiltIns: 'usage',
                            debug: false,
                            loose: false,
                            spec: false,
                        },
                    ],                    
                ],
            },
        },
    }
}
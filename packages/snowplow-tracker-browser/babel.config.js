module.exports = function(api) {
    api.cache(false)
    return {
        env: {
            test: {
                ignore: [],
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

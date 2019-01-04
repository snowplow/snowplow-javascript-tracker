/* globals process */
process.env.BABEL_ENV = 'test'
module.exports = wallaby => {
    return {
        files: [
            'packages/snowplow-tracker-browser/src/*.js',
            'packages/snowplow-tracker-browser/src/**/*.js',
            'packages/snowplow-tracker-browser/test/mocks/*.js',
        ],
        tests: ['packages/snowplow-tracker-browser/test/unit/*.js'],
        env: {
            type: 'node',
            runner: 'node',
        },
        compilers: {
            '**/*.js': wallaby.compilers.babel({
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
            }),
        },
        debug: false
    }
}
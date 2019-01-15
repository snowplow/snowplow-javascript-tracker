/* globals process */
process.env.BABEL_ENV = 'test'
module.exports = wallaby => {
    return {
        files: [
            'packages/snowplow-tracker-browser/src/*.js',
            'packages/snowplow-tracker-browser/src/**/*.js',
            'packages/snowplow-tracker-browser/test/mocks/*.js',
            // {
            //     pattern: 'packages/snowplow-tracker-core/src/*.js',
            //     instrument: true,
            //     load: true,
            //     ignore: false,
            // },
            {
                pattern: 'packages/snowplow-tracker-core/src/*.ts',
                instrument: true,
                load: true,
                ignore: false,
            },
            // {
            //     pattern: 'packages/snowplow-tracker-browser/test/temp/*.js',
            //     instrument: false,
            //     load: true,
            //     ignore: false,
            // },
            // {
            //     pattern: 'packages/snowplow-tracker-browser/test/temp/*.html',
            //     instrument: false,
            //     load: true,
            //     ignore: false,
            // },
            {
                pattern: 'packages/snowplow-tracker-browser/package.json',
                instrument: false,
                load: true,
                ignore: false,
            },
        ],
        tests: [
            'packages/snowplow-tracker-browser/test/unit/*.js',
            'packages/snowplow-tracker-browser/test/functional/*.js',
            'packages/snowplow-tracker-core/test/unit/*.ts',
            'packages/snowplow-tracker-core/test/unit/*.js',
        ],
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
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                target: 'es5',
                module: 'commonjs',
                moduleResolution: 'node',
                allowSyntheticDefaultImports: true,
                esModuleInterop: true,
            }),
        },
        debug: true,
    }
}

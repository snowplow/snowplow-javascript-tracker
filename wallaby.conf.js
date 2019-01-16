/* globals process */
process.env.BABEL_ENV = 'test'
module.exports = wallaby => {
    return {
        files: [
            {
                pattern: 'packages/snowplow-tracker-core/src/*.ts',
                instrument: true,
                load: true,
                ignore: false,
            },
            {
                pattern: 'packages/snowplow-tracker-core/src/*.ts',
                instrument: true,
                load: true,
                ignore: false,
            },
            {
                pattern: 'packages/snowplow-tracker-browser/package.json',
                instrument: false,
                load: true,
                ignore: false,
            },
            {
                pattern: 'packages/snowplow-tracker-browser/src/**/*.js',
                instrument: true,
                load: true,
                ignore: false,
            },
            {
                pattern: 'packages/snowplow-tracker-browser/test/mocks/*.js',
                instrument: true,
                load: true,
                ignore: false,
            },
        ],
        tests: [
            'packages/snowplow-tracker-browser/test/{,!(mocks|browser)/**/}*.js',
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
        debug: false,
        setup: function (w) {
            var mocha = w.testFramework
            mocha.allowUncaught()
        }
    }
}

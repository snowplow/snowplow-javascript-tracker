/* globals process */
//process.env.BABEL_ENV = 'development'

module.exports = wallaby => {
    return {
        files: [
            'src/*.js',
            'src/**/*.js',
            'test/mocks/*.js',
        ],
        tests: ['test/unit/*.js'],
        env: {
            type: 'node',
            runner: 'node',
        },
        compilers: {
            '**/*.js': wallaby.compilers.babel({
                plugins: [
                    [
                        'transform-es2015-modules-commonjs',
                        {
                            allowTopLevelThis: true,
                        },
                    ],
                ]
            }),
        },
        debug: true
    }
}

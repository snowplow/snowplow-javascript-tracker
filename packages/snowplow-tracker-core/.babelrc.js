module.exports = {
    env: {
        cjs: {
            'presets': [
                ['@babel/env',
                    {
                        'useBuiltIns': 'usage',
                        'debug': true,
                        'modules': 'cjs'
                    }
                ],
                '@babel/typescript'
            ],
            'plugins': [
                '@babel/plugin-transform-runtime',
                'lodash',
                '@babel/proposal-class-properties',
                '@babel/proposal-object-rest-spread'
            ],
            'exclude': [/\/core-js\//]
        },
        mjs: {
            'presets': [
               '@babel/typescript'
            ],
            'plugins': [
                //'@babel/plugin-transform-runtime',
                'lodash',
                //'@babel/proposal-class-properties',
                //'@babel/proposal-object-rest-spread'
            ],
            'exclude': [/\/core-js\//]
        },
    },
}
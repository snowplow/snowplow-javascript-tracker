// eslint-disable-next-line no-undef
process.env.BABEL_ENV = 'test'
require('@babel/register')({
    // This will override `node_modules` ignoring - you can alternatively pass
    // an array of strings to be explicitly matched or a regex / glob
    //ignore: [/.*test.*/],
    //exclude: [/.*test.*/],
    //rootMode: 'upward',
    //babelrcRoots: ['.'],
})

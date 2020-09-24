import { rollup } from 'rollup';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import cleanup from 'rollup-plugin-cleanup';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import { basePlugins, spBannerPlugin } from './rollup';

const minify = [
    compiler(), 
    cleanup({comments: 'none'})
]

const report = [
    sizes(), 
    filesize({showMinifiedSize: false, showBeforeSizes: 'build'})
]

export const buildSp = async function () {
    const snowplow = await rollup({
        input: 'src/js/init.js',
        plugins: [...basePlugins, ...minify, spBannerPlugin, ...report],
    });

    return await snowplow.write({
        file: 'dist/sp.js',
        format: 'iife',
    });
};

const fs = require('fs');
const UglifyJS = require('uglify-js');
const options = {
  compress: true,
  mangle: true,
  output: {
    max_line_len: 500
    //preamble: "/* uglified */"
  }
};

const resultTag = UglifyJS.minify(fs.readFileSync(process.cwd() + "/tags/tag.js", "utf8"), options);
const resultSnowplow = UglifyJS.minify(fs.readFileSync(process.cwd() + "/dist/bundles/snowplow-second.js", "utf8"), options);
fs.writeFileSync("dist/min/tag.js", resultTag.code, "utf8");
fs.writeFileSync("dist/min/sp.js", resultSnowplow.code, "utf8");

if (resultTag.error !== undefined) {
  console.log(resultTag.error);
}

if (resultSnowplow.error !== undefined) {
  console.log(resultSnowplow.error);
}

process.exit(0);
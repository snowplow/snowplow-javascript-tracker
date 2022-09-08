import replace from '@rollup/plugin-replace';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const SNOWPLOW_HEX = '#9f62dd';
const snowplowLogMessage = (message) => console.log(chalk.hex(SNOWPLOW_HEX).bold(message));

export function whitelabelBuild(cmdlineArgs, plugins) {
  const whitelabelNamespace = cmdlineArgs.whitelabel;
  const defaultNamespace = 'GlobalSnowplowNamespace';

  // Prevent unrecognized option warning on whitelabel
  delete cmdlineArgs.whitelabel;
  plugins.unshift(replace({ [defaultNamespace]: whitelabelNamespace, preventAssignment: true, delimiters: ['', ''] }), {
    name: 'rollup-plugin-fix-whitelabel-tag',
    writeBundle(options) {
      const tagPaths = ['./tags/tag.js', './tags/tag.min.js'];
      tagPaths.forEach((tagPath) => replaceWithWhitelabelNamespace(tagPath, defaultNamespace, whitelabelNamespace));
      snowplowLogMessage(
        `Snowplow whitelabel build created at ${options.file}. You can find the whitelabel loader under ./tags/tag{.min}.js`
      );
    },
  });
}

function replaceWithWhitelabelNamespace(filepath, oldNamespace, whitelabelNamespace) {
  const tagPath = path.resolve(filepath);
  const content = fs.readFileSync(tagPath, { encoding: 'utf-8' });
  if (content.match(oldNamespace)) {
    const updatedNamespaceContent = content.replace(new RegExp(oldNamespace, 'g'), whitelabelNamespace);
    fs.writeFileSync(tagPath, updatedNamespaceContent);
  }
}

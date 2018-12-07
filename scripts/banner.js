const packageJSON = require('../package.json');
const handlebars = require('handlebars');

const fs = require('fs');
const buffer = fs.readFileSync(process.cwd() + '/templates/banner.txt');
const banner = buffer.toString();
const template = handlebars.compile(banner);
const context = {
    description: packageJSON.description,
    version: packageJSON.version,
    contributors: packageJSON.contributors.join(', '),
    license: packageJSON.license
};
const completeBanner = template(context);
try {
  const data = fs.writeFileSync(process.cwd() + '/templates/filled/banner.txt', completeBanner);
  console.log('banner.txt generated and written!');
  process.exit(0);
} catch (err) {
  console.log('Error occurred, see line below:');
  console.log(err);
  process.exit(1);
}
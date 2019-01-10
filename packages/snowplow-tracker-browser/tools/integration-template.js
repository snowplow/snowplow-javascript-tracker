const fs = require('fs');
const handlebars = require('handlebars');
const buffer = fs.readFileSync(process.cwd() + '/templates/integration-template.html');
const integrationTemplate = buffer.toString();
const template = handlebars.compile(integrationTemplate);
const subdomain = process.env.SUBDOMAIN;
if (subdomain === undefined) {
  console.log('Error: SUBDOMAIN env variable not defined');
}

const context = {
  endpoint: subdomain ? subdomain + 'ngrok.io' : '127.0.0.1:8000',
};
const file = template(context);
try {
  const data = fs.writeFileSync(process.cwd() + '/templates/filled/integration.html', file);
  console.log('integration.html generated and written!');
  process.exit(0);
} catch (err) {
  console.log('Error occurred, see line below:');
  console.log(err);
  process.exit(1);
}


process.exit(0);
const http = require('http');

const collectorEndpoint = '<%= subdomain %>' + '.ngrok.io';
const microResetUrl = `http://${collectorEndpoint}/micro/reset`;
const microGoodUrl = `http://${collectorEndpoint}/micro/good`;
const microBadUrl = `http://${collectorEndpoint}/micro/bad`;

const createMicroCall = url => () =>
	new Promise((resolve, reject) => {
		const req = http.request(url, res => {
			let body = '';
			res.on('data', chunk => {
				body += chunk;
			});
			res.on('end', () => {
				resolve(body);
			});
		});
		req.on('error', reject);
		req.end();
	});

const fetchResults = () =>
	createMicroCall(microGoodUrl)()
		.then(good => JSON.parse(good));

module.exports = {
	reset: createMicroCall(microResetUrl),
	fetchResults
};

define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../src/js/payload.js'
], function (registerSuite, assert, payload) {

	var 
		sampleJson = {
			page: {
				page_type: 'test',
				last_updated: new Date(2014,1,26)
			},
			user: {
				user_type: 'tester'
			}
		},
		expectedStrings = [
		'?e=pv&page=Asynchronous%20website%2Fwebapp%20examples%20for%20snowplow.js',
		'?co=%7B%22page%22%3A%7B%22page_type%22%3A%22test%22%2C%22last_updated%24tms%22%3A1393372800000%7D%2C%22user%22%3A%7B%22user_type%22%3A%22tester%22%7D%7D',
		'?cx=eyJwYWdlIjp7InBhZ2VfdHlwZSI6InRlc3QiLCJsYXN0X3VwZGF0ZWQkdG1zIjoxMzkzMzcyODAwMDAwfSwidXNlciI6eyJ1c2VyX3R5cGUiOiJ0ZXN0ZXIifX0'
		];

	registerSuite({

		name: 'Payload test',

		'Identify JSON': function() {
			var json = {
				'name': 'john',
				'properties': {
					'age': 30,
					'languages': ['English', 'French']
				}
			};

			assert.strictEqual(payload.isJson(json), true, 'JSON should be identified');
		},

		'Identify non-JSON': function() {
			var nonJson = [1,2,3];

			assert.strictEqual(payload.isJson(nonJson), false, 'non-JSON should be rejected');
		},

		'Identify empty JSON': function() {
			var emptyJson = {};

			assert.strictEqual(payload.isNonEmptyJson(emptyJson), false, 'identify {} as empty')
		},

		'build payload': function () {

			var sb = payload.payloadBuilder(false);
			sb.add('e', 'pv');
			sb.add('page', 'Asynchronous website/webapp examples for snowplow.js');

			assert.equal(sb.build(), expectedStrings[0], 'text should be encoded correctly');
		},

		'add JSON': function() {

			var sb = payload.payloadBuilder(false);

			sb.addJson('cx', 'co', sampleJson);

			assert.equal(sb.build(), expectedStrings[1], 'JSON should be added correctly');
		},

		'base 64 encoding': function() {

			var sb = payload.payloadBuilder(true);

			sb.addJson('cx', 'co', sampleJson);

			assert.equal(sb.build(), expectedStrings[2], 'JSON should be encoded correctly');
		}
	});
});

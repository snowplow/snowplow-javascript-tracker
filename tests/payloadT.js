define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../src/js/payload.js'
], function (registerSuite, assert, payload) {

	registerSuite({

		name: 'Payload test',

		'build payload': function () {

			var sb = payload.payloadBuilder(false);
			sb.add('e', 'pv');

			assert.equal(sb.build(), "?e=pv", 'Payload should be built correctly');

		}
	});
});

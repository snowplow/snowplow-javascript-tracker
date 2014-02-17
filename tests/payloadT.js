define([
	'intern!object',
	'intern/chai!assert',
	'src/js/payload'
], function (registerSuite, assert, payload) {
	registerSuite({
		name: 'Payload test',

		'build payload': function () {

			
			var sb = payload.payloadBuilder(false);
			sb.add('e', 'pv');

			assert.equal(sb.build(), "?e=pv", 'is payload built correctly?');

		}
	});
});

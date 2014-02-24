define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../src/js/lib/identifiers'
], function (registerSuite, assert, identifiers) {

	registerSuite({

		name: 'JSON identification tests',

		'Identify JSON': function() {
			var json = {
				'name': 'john',
				'properties': {
					'age': 30,
					'languages': ['English', 'French']
				}
			};

			assert.strictEqual(identifiers.isJson(json), true, 'JSON should be identified');
		},

		'Identify non-JSON': function() {
			var nonJson = [1,2,3];

			assert.strictEqual(identifiers.isJson(nonJson), false, 'non-JSON should be rejected');
		},

		'Identify empty JSON': function() {
			var emptyJson = {};

			assert.strictEqual(identifiers.isNonEmptyJson(emptyJson), false, 'identify {} as empty')
		}
	});
});

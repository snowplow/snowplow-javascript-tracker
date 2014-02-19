define([
	'intern!object',
	'intern/chai!assert',
	'src/js/queue.js',
], function(registerSuite, assert, queue) {

	var MockTracker = function () {
		var attribute = 10;
		return {
			increaseAttribute: function(n) {
				attribute += n;
			},
			setAttribute: function(p) {
				attribute = p;
			},
			getAttribute: function() {
				return attribute;
			}
		}
	};

	var mockTracker = new MockTracker();
	var snaq = [['increaseAttribute', 5]];
	snaq = new AsyncQueueProxy(mockTracker, snaq);

	registerSuite({
		name: 'queue test',
		'make a proxy': function() {
			assert.equal(mockTracker.getAttribute(), 15, 'Function originally stored in snaq gets executed when snaq becomes an AsyncQueueProxy');
		},

		'add to snaq after conversion': function() {
			snaq.push(['setAttribute', 7]);
			assert.equal(mockTracker.getAttribute(), 7, 'Function added to snaq after it becomes an AsyncQueueProxy gets executed')
		}
	});
});

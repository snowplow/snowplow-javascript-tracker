define([
	'intern!object',
	'intern/chai!assert',
	'src/js/queue.js',
], function(registerSuite, assert, queue) {
	registerSuite({
		name: 'queue test',
		'make a proxy': function() {

			var MockTracker = function () {
				var attribute = 10;
				return {
					increase: function(n) {
						attribute += n;
					},
					getAttribute: function() {
						return attribute;
					}
				}
			};

			var mockTracker = new MockTracker();

			var snaq = [['increase', 5]];
			snaq = new AsyncQueueProxy(mockTracker, snaq);
			assert.equal(mockTracker.getAttribute(), 15, 'The function originally stored in snaq gets executed');
			
			snaq.push(['increase', 7]);
			assert.equal(mockTracker.getAttribute(), 22, 'The function added to snaq after it becomes a proxy gets executed');
		}
	});
});

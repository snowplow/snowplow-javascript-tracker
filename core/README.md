# Snowplow JavaScript Tracker Core [![npm version][npm-image]][npm-url]

Core module to be used by all Snowplow JavaScript trackers.

## Installation

With npm:

```bash
npm install snowplow-tracker-core
```

## Example

```js
var core = require('snowplow-tracker-core');

// Create an instance with base 64 encoding set to false (it defaults to true)
var coreInstance = core(false);

// Add a name-value pair to all payloads
coreInstance.addPayloadPair('vid', 2);

// Add each name-value pair in a dictionary to all payloads
coreInstance.addPayloadDict({
	'ds': '1160x620',
	'fp': 4070134789
});

// Add name-value pairs to all payloads using convenience methods
coreInstance.setTrackerVersion('js-3.0.0');
coreInstance.setPlatform('web');
coreInstance.setUserId('user-321');
coreInstance.setColorDepth(24);
coreInstance.setViewport(600, 400);

// Track a page view with URL and title
var pageViewPayload = coreInstance.trackPageView('http://www.example.com', 'landing page');

console.log(pageViewPayload);
/*
{
	'e': 'pv',
	'url': 'http://www.example.com',
	'page': 'landing page',
	'uid': 'user-321',
	'vd': 2,
	'ds': '1160x620',	
	'fp': 4070134789
	'tv': 'js-3.0.0',
	'p': 'web',
	'cd': 24,
	'vp': '600x400',
	'dtm': 1406879959702,                          // timestamp
	'eid': '0718a85a-45dc-4f71-a949-27870442ed7d'  // UUID
}
*/

// Stop automatically adding tv, p, and dtm to the payload
coreInstance.resetPayloadPairs();

// Track an unstructured event
var unstructEventPayload = coreInstance.trackUnstructEvent({
	'schema': 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
	'data': {
		'targetUrl': 'http://www.destination.com',
		'elementId': 'bannerLink'
	}
});

console.log(unstructEventPayload);
/*
{
	'e': 'ue',
	'ue_pr': {
		'schema': 'iglu:com.snowplowanalytics.snowplow/unstruct_even/jsonschema/1-0-0',
		'data': {
			'schema': 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0',
			'data': {
				'targetUrl': 'http://www.destination.com',
				'elementId': 'bannerLink'
			}
		}
	},
	'dtm': 1406879973439,
	'eid': '956c6670-cbf6-460b-9f96-143e0320fdf6'
}
*/
```

## Other features

Core instances can be initialized with two parameters. The first is a boolean and determines whether custom contexts and unstructured events will be base 64 encoded. The second is an optional callback function which gets applied to every payload created by the instance.

```js
var coreInstance = core(true, console.log);
```

The above example would base 64 encode all unstructured events and custom contexts and would log each payload to the console.

Use the `setBase64Encoding` method to turn base 64 encoding on or off after initializing a core instance:

```js
var core = require('snowplow-tracker-core');

var coreInstance = core(); // Base 64 encoding on by default

coreInstance.setBase64Encoding(false); // Base 64 encoding is now off
```

## Documentation

For more information on the Snowplow JavaScript Tracker Core's API, view its [wiki page][wiki].

## Copyright and license

The Snowplow JavaScript Tracker Core is copyright 2014 Snowplow Analytics Ltd.

Licensed under the [Apache License, Version 2.0][apache-license] (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[apache-license]: http://www.apache.org/licenses/LICENSE-2.0

[npm-url]: http://badge.fury.io/js/snowplow-tracker-core
[npm-image]: https://badge.fury.io/js/snowplow-tracker-core.svg
[wiki]: https://github.com/snowplow/snowplow/wiki/Javascript-Tracker-Core

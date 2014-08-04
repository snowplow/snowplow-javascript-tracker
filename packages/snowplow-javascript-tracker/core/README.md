# Snowplow JavaScript Tracker Core [![npm version][npm-image]][npm-url]

Core module to be used by all Snowplow JavaScript trackers.

## Installation

With npm:

```
npm install intern --save-dev
```

## Example

```js
var core = require('snowplow-tracker-core');

// Create an instance with base 64 encoding set to false (it defaults to true)
var coreInstance = core(false);

// Add this name-value pair to all payloads
coreInstance.addPayloadPair('dtm', new Date().getTime());

// Add each name-value pair in this dictionary to all payloads
coreInstance.addPayloadDict({
	'p': 'web',      // platform
	'tv': 'js-3.0.0' // tracker version
});

// Track a page view with URL and title
var pageViewPayload = coreInstance.trackPageView('http://www.example.com', 'landing page');

console.log(pageViewPayload);
/*
{
	'tv': 'js-2.0.0',
	'p': 'web',
	'dtm': 1406879959702,
	'e': 'pv',
	'url': 'http://www.example.com',
	'page': 'landing page'
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
	}
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

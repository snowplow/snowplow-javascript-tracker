/*
 * JavaScript tracker for Snowplow: tests/integration/cookieless.spec.js
 *
 * Significant portions copyright 2010 Anthon Pang. Remainder copyright
 * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 *	 notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 *	 notice, this list of conditions and the following disclaimer in the
 *	 documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
 *	 names of their contributors may be used to endorse or promote products
 *	 derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import util from 'util'
import F from 'lodash/fp'
import { fetchResults, start, stop } from '../micro'

const dumpLog = log => console.log(util.inspect(log, true, null, true))

const retrieveSchemaData = schema =>
	F.compose(
		F.get('data'),
		F.find({ schema }),
		F.get('data')
	)

describe('Anonymous tracking features', () => {
	let log = []
	let docker

	const listContains = (items, ev) => F.some(F.isMatch(ev), items)

	beforeAll(() => {
		browser.call(() => {
		  return start()
			.then((container) => {
			  docker = container
			})
		})
		browser.url('/index.html')
		browser.setCookies({ name: 'container', value: docker.url })
		browser.url('/cookieless.html')
		browser.pause(5000) // Time for requests to get written
		browser.url('/cookieless.html?ieTest=true')
		browser.pause(2500) // Time for requests to get written

		browser.call(() =>
		  fetchResults(docker.url).then(result => {
			log = result
		  })
		)
	})

	afterAll(() => {
		browser.call(() => {
		  return stop(docker.container)
		})
	  })

	it('should have no user information in page view when server anonymisation ', () => {
		const expected = {
			event: 'page_view',
			app_id: 'anon',
			page_title: 'Server Anon',
			user_id: null,
			domain_userid: null,
			domain_sessionidx: null,
			domain_sessionid: null
		};

		const pageViews = F.filter(
			ev =>
				F.get('event.event', ev) === 'page_view' &&
				F.get('event.app_id', ev) === 'anon' &&
				F.get('event.page_title', ev) === 'Server Anon',
				log
		)

		expect(F.size(pageViews)).toBe(2)

		// We should still get these events in IE9, 
		// but they will be sent with the non-anonymous events
		if (F.isMatch({ browserName: 'internet explorer', version: '9' }, browser.capabilities)) {
			expect(listContains(pageViews, {
				event: expected
			})).toBe(true)
		} else { // All other browsers we support
			expect(listContains(pageViews, {
				event: {
					...expected,
					user_ipaddress: 'unknown'
				}
			})).toBe(true)

			// Each event should have different network_userids (therefore anonymous)
			expect(F.get('event.network_userid', pageViews[0])).not.toEqual(F.get('event.network_userid', pageViews[1]))
		}
	})

	it('should have user information in page view when no anonymisation ', () => {

		const pageViews = F.filter(
			ev =>
				F.get('event.event', ev) === 'page_view' &&
				F.get('event.app_id', ev) === 'anon' &&
				F.get('event.page_title', ev) === 'No Anon',
				log
		)

		expect(listContains(pageViews, {
			event: {
				event: 'page_view',
				app_id: 'anon',
				page_title: 'No Anon',
				user_id: 'Malcolm'
			}
		})).toBe(true)

		expect(F.size(pageViews)).toBe(1)

		expect(F.get('event.domain_userid', pageViews[0])).not.toBeNull()
		expect(F.get('event.domain_sessionidx', pageViews[0])).not.toBeNull()
		expect(F.get('event.domain_sessionid', pageViews[0])).not.toBeNull()
		expect(F.get('event.network_userid', pageViews[0])).not.toBeNull()
		expect(F.get('event.user_ipaddress', pageViews[0])).not.toBe('unknown')
	})

	it('should have no client user information in page view when client anonymisation', () => {

		const pageViews = F.filter(
			ev =>
				F.get('event.event', ev) === 'page_view' &&
				F.get('event.app_id', ev) === 'anon' &&
				F.get('event.page_title', ev) === 'Client Anon',
				log
		)

		expect(listContains(pageViews, {
			event: {
				event: 'page_view',
				app_id: 'anon',
				page_title: 'Client Anon',
				user_id: null,
				domain_userid: null,
				domain_sessionidx: null,
				domain_sessionid: null
			}
		})).toBe(true)

		expect(F.size(pageViews)).toBe(1)

		// IP should be tracked as only client side
		expect(F.get('event.user_ipaddress', pageViews[0])).not.toBe('unknown')
	})

	it('Check pageViewId is regenerated for each trackPageView', () => {
		const pageViews = F.filter(
			ev =>
				F.get('event.event', ev) === 'page_view' &&
				F.get('event.name_tracker', ev) === 'sp',
			log
		)

		const getWebPageId = F.compose(
			F.get('id'),
			retrieveSchemaData(
				'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
			),
			F.get('event.contexts')
		)

		expect(F.size(F.groupBy(getWebPageId, pageViews))).toBeGreaterThanOrEqual(2)
	})

	it('should send no events in IE9 when server anonymisation is enabled', () => {
		const pageViews = F.filter(
			ev =>
				F.get('event.event', ev) === 'page_view' &&
				F.get('event.app_id', ev) === 'ie',
				log
		)

		// Unable to send anonymous header on IE 9, so we don't send anything
		if (F.isMatch({ browserName: 'internet explorer', version: '9' }, browser.capabilities)) {
			expect(F.size(pageViews)).toBe(0)
		} else {
			expect(F.size(pageViews)).toBe(2)
		}
	})
})

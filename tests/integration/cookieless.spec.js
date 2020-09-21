/*
 * JavaScript tracker for Snowplow: tests/functional/integration.spec.js
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

describe('Test that request_recorder logs meet expectations', () => {
	let log = []
	let docker

	const logContains = ev => F.some(F.isMatch(ev), log)

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

	it('Check existence of page view without sensitive fields', () => {
		expect(
			logContains({
				event: {
					event: 'page_view',
					platform: 'mob',
					app_id: 'CFe23a',
					page_title: 'Cookieless test page',
					user_id: null,
					domain_userid: null,
					domain_sessionidx: null,
					domain_sessionid: null
				}
			})
		).toBe(true)
	})

	it('Check pageViewId is regenerated for each trackPageView', () => {
		const pageViews = F.filter(
			ev =>
				F.get('event.event', ev) === 'page_view' &&
				F.get('event.name_tracker', ev) === 'cf',
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
})

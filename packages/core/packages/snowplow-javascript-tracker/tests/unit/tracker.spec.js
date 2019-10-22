import util from 'util'
import F from 'lodash/fp'
import { advanceBy, advanceTo, clear } from 'jest-date-mock'

jest.useFakeTimers()

const getPPEvents = F.compose(
  F.filter(
    F.compose(
      F.eq('pp'),
      F.get('evt.e')
    )
  ),
  F.first
)

const extractPageId = F.compose(
  F.get('data[0].data.id'),
  cx => JSON.parse(cx),
  F.get('evt.co')
)

describe('Activity tracker behaviour', () => {
  let oldDocument

  beforeAll(() => {
    oldDocument = document
    global.document = Object.create(document)
    document.domain = ''
    advanceTo(new Date(2019, 10, 25, 0, 0, 0))
  })

  afterAll(() => {
    global.document = oldDocument
    clear()
  })

  it('supports different timings for ping vs callback activity tracking', () => {
    let callbacks = 0
    const outQueues = []
    const Tracker = require('../../src/js/tracker').Tracker
    const t = new Tracker(
      '',
      '',
      '',
      { outQueues },
      { stateStorageStrategy: 'cookies' }
    )
    t.enableActivityTracking(10, 10)
    t.enableActivityTrackingCallback(5, 5, () => {
      callbacks++
    })
    t.trackPageView()
    advanceBy(5000)
    jest.advanceTimersByTime(5000)

    // callback timer starts tracking
    advanceBy(1000)
    t.updatePageActivity()
    advanceBy(4000)
    jest.advanceTimersByTime(5000)

    // page ping timer starts tracking
    advanceBy(1000)
    t.updatePageActivity()
    advanceBy(4000)
    jest.advanceTimersByTime(5000)

    // window for callbacks ticks
    advanceBy(1000)
    t.updatePageActivity()
    advanceBy(4000)
    jest.advanceTimersByTime(5000)
    // window for page ping ticks

    expect(callbacks).toBe(3)
    expect(F.size(getPPEvents(outQueues))).toBe(1)
  })

  it('maintains current static context behaviour', () => {
    const outQueues = []
    const Tracker = require('../../src/js/tracker').Tracker
    const t = new Tracker(
      '',
      '',
      '',
      { outQueues },
      {
        stateStorageStrategy: 'cookies',
        encodeBase64: false,
        contexts: {
          webPage: true,
        },
      }
    )
    t.enableActivityTracking(0, 2)
    t.trackPageView(null, [
      {
        schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
        data: {
          staticValue: Date.now(),
        },
      },
    ])
    const pageOneTime = Date.now()

    advanceBy(1000)
    jest.advanceTimersByTime(1000)
    t.updatePageActivity()
    advanceBy(1000)
    jest.advanceTimersByTime(1000)

    // page two with new static context, time has moved on 2 seconds by now
    t.trackPageView(null, [
      {
        schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
        data: {
          staticValue: Date.now(),
        },
      },
    ])
    const pageTwoTime = Date.now()

    advanceBy(1000)
    jest.advanceTimersByTime(1000)
    t.updatePageActivity()
    advanceBy(1000)
    jest.advanceTimersByTime(1000)

    // current behaviour is to capture context on the first trackPageView after enabling
    // event tracking. This might not be ideal, but lets make sure it stays this way
    // unless we mean it to change.

    const extractSchemas = F.map(
      F.compose(
        F.get('data'),
        cx => JSON.parse(cx),
        F.get('evt.co')
      )
    )
    const findWithStaticValue = F.filter(F.get('data.staticValue'))
    const extractContextsWithStaticValue = F.compose(
      findWithStaticValue,
      F.flatten,
      extractSchemas,
      getPPEvents
    )

    const countWithStaticValueEq = value =>
      F.compose(
        F.size,
        F.filter(
          F.compose(
            F.eq(value),
            F.get('data.staticValue')
          )
        ),
        extractContextsWithStaticValue
      )

    // we expect there to be two page pings with static contexts attached
    // they should both have the time from page one.
    expect(countWithStaticValueEq(pageOneTime)(outQueues)).toBe(2)
    expect(countWithStaticValueEq(pageTwoTime)(outQueues)).toBe(0)
  })

  it('does not reset activity tracking on pageview', () => {
    const outQueues = []
    const Tracker = require('../../src/js/tracker').Tracker
    const t = new Tracker(
      '',
      '',
      '',
      { outQueues },
      {
        stateStorageStrategy: 'cookies',
        encodeBase64: false,
        contexts: {
          webPage: true,
        },
      }
    )
    t.enableActivityTracking(0, 30)
    t.trackPageView()

    advanceBy(15000)
    jest.advanceTimersByTime(15000)

    // activity on page one
    t.updatePageActivity()
    advanceBy(1000)

    // shift to page two and trigger tick
    t.trackPageView()
    advanceBy(14000)
    jest.advanceTimersByTime(15000)

    // Activity was triggered on the first page.
    // Activity tracking is currently not reset per page view so it is reported as happening on the second page.

    const pps = getPPEvents(outQueues)

    expect(F.size(pps)).toBe(1)

    const pp = F.head(pps)

    const secondPageId = t.getPageViewId()

    expect(secondPageId).toBe(extractPageId(pp))
  })
})

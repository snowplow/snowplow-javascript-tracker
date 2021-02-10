import F from 'lodash/fp'
import { Tracker } from '../../src/js/tracker';

jest.useFakeTimers('modern');

const getPPEvents = F.compose(
  F.filter(
    F.compose(
      F.eq('pp'),
      F.get('evt.e')
    )
  ),
  F.first
)

const getUEEvents = F.compose(
  F.filter(
    F.compose(
      F.eq('ue'),
      F.get('evt.e')
    )
  ),
  F.first
)

const extractSchemas = F.map(
  F.compose(
    F.get('data'),
    cx => JSON.parse(cx),
    F.get('evt.co')
  )
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
  })

  afterAll(() => {
    global.document = oldDocument
    clear()
  })

  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('supports different timings for ping vs callback activity tracking', () => {
    let callbacks = 0
    const outQueues = []
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
    jest.advanceTimersByTime(2500)
    t.updatePageActivity()
    jest.advanceTimersByTime(5000) // CB = 1, PP = 0

    // callback timer starts tracking
    t.updatePageActivity()
    jest.advanceTimersByTime(5000) // CB = 2, PP = 1

    // page ping timer starts tracking
    t.updatePageActivity()
    jest.advanceTimersByTime(5000) // CB = 3, PP = 1

    // window for callbacks ticks
    t.updatePageActivity()
    jest.advanceTimersByTime(5000) // CB = 4, PP = 2
    // window for page ping ticks

    expect(callbacks).toBe(4)
    expect(F.size(getPPEvents(outQueues))).toBe(2)
  })

  it('maintains current static context behaviour', () => {
    const outQueues = []
    const t = new Tracker(
      '',
      '',
      '',
      { outQueues },
      {
        resetActivityTrackingOnPageView: false,
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

    jest.advanceTimersByTime(500)

    t.updatePageActivity()
    jest.advanceTimersByTime(2000) // PP = 1

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

    jest.advanceTimersByTime(500)
    t.updatePageActivity()
    jest.advanceTimersByTime(2000) // PP = 2

    // current behaviour is to capture context on the first trackPageView after enabling
    // event tracking. This might not be ideal, but lets make sure it stays this way
    // unless we mean it to change when resetActivityTrackingOnPageView = false.

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

  it('does compute dynamic context for each page ping', () => {
    const outQueues = []
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
    let id = 0
    t.trackPageView(null, null, () => ([
      {
        schema: 'iglu:com.acme/dynamic_context/jsonschema/1-0-0',
        data: { pingId: id++ },
      },
    ]))

    jest.advanceTimersByTime(10000)

    // PP 1
    t.updatePageActivity()
    jest.advanceTimersByTime(30000)

    // PP 2
    t.updatePageActivity()
    jest.advanceTimersByTime(30000)

    const findWithPingId = F.filter(F.get('data.pingId'))
    const extractContextsWithPingId = F.compose(
      findWithPingId,
      F.flatten,
      extractSchemas,
      getPPEvents
    )
    const contexts = extractContextsWithPingId(outQueues)

    expect(contexts[0].data.pingId).toBe(1)
    expect(contexts[1].data.pingId).toBe(2)
  })

  it('does not reset activity tracking on pageview when resetActivityTrackingOnPageView: false,', () => {
    const outQueues = []
    const t = new Tracker(
      '',
      '',
      '',
      { outQueues },
      {
        resetActivityTrackingOnPageView: false,
        stateStorageStrategy: 'cookies',
        encodeBase64: false,
        contexts: {
          webPage: true,
        },
      }
    )
    t.enableActivityTracking(0, 30)
    t.trackPageView()

    jest.advanceTimersByTime(15000)

    // activity on page one
    t.updatePageActivity()
    jest.advanceTimersByTime(25000)

    // activity on page one
    t.updatePageActivity()

    // shift to page two and trigger tick
    t.trackPageView()
    jest.advanceTimersByTime(25000)

    // Activity tracking is currently not reset per page view so we get an extra page ping on page two.
    const pps = getPPEvents(outQueues)
    expect(F.size(pps)).toBe(2)
  })

  it('does reset activity tracking on pageview by default', () => {
    const outQueues = []
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

    jest.advanceTimersByTime(15000)

    // activity on page one
    t.updatePageActivity()

    jest.advanceTimersByTime(25000) // PP = 1

    // activity on page one
    t.updatePageActivity()

    // shift to page two and trigger tick
    t.trackPageView()

    jest.advanceTimersByTime(5000)

    // activity on page two
    t.updatePageActivity()

    jest.advanceTimersByTime(20000)

    // Activity began tracking on the first page but moved on before 30 seconds.
    // Activity tracking should still not have fire despite being on site 30 seconds, as user has moved page.

    const pps = getPPEvents(outQueues)

    expect(F.size(pps)).toBe(1)
  })

  it('allows running callback after sending tracking events', () => {
    const outQueues = []
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

    let marker = false
    t.trackPageView(null, null, null, null, ev => (marker = true))

    expect(marker).toBe(true)
  })

  it('fires initial delayed activity tracking on first pageview and second pageview', () => {
    const outQueues = []
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
    t.enableActivityTracking(10, 5)

    t.trackPageView()
    const firstPageId = t.getPageViewId()

    jest.advanceTimersByTime(2500)
    
    // initial callback timer starts tracking
    t.updatePageActivity() 

    jest.advanceTimersByTime(5000)

    const initial_pps = getPPEvents(outQueues)
    expect(F.size(initial_pps)).toBe(0)
    
    jest.advanceTimersByTime(5000) // PP = 1

    // page ping timer starts tracking
    t.updatePageActivity()

    jest.advanceTimersByTime(5000) // PP = 2

    t.updatePageActivity()
    jest.advanceTimersByTime(5000) // PP = 3

    // Move to second page view
    t.trackPageView()
    const secondPageId = t.getPageViewId()

    jest.advanceTimersByTime(2500)

    // window for callbacks ticks
    t.updatePageActivity()

    jest.advanceTimersByTime(5000)

    // Should still only have 3 page pings from first page
    const first_page_only_pps = getPPEvents(outQueues)
    expect(F.size(first_page_only_pps)).toBe(3)

    jest.advanceTimersByTime(5000) // PP = 4

    // window for page ping ticks
    t.updatePageActivity() 
    jest.advanceTimersByTime(5000) // PP = 5

    // Activity began tracking on the first page and tracked two page pings in 16 seconds.
    // Activity tracking only fires one further event over next 11 seconds as a page view event occurs, resetting timer back to 10 seconds.

    const pps = getPPEvents(outQueues)

    expect(F.size(pps)).toBe(5)

    const pph = F.head(pps)
    const ppl = F.last(pps)

    expect(firstPageId).toBe(extractPageId(pph))
    expect(secondPageId).toBe(extractPageId(ppl))
  })

  it('does not log skipped browser features', () => {
    const outQueues = []
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
        skippedBrowserFeatures: ['cd'],
      }
    )
    t.enableActivityTracking(10, 5)

    t.trackPageView()
    t.updatePageActivity();
    jest.advanceTimersByTime(15000)

    const pps = getPPEvents(outQueues)

    const pph = F.head(pps)
    expect(F.hasIn(pph, 'evt.e.cd')).toBe(false)
  })

  it('attaches enhanced ecommerce contexts to enhanced ecommerce events', () => {
    const outQueues = []
    const t = new Tracker(
      '',
      '',
      '',
      { outQueues },
      {
        stateStorageStrategy: 'cookies',
        encodeBase64: false
      }
    )

    t.addEnhancedEcommerceProductContext('1234-5678','T-Shirt');
    t.addEnhancedEcommerceImpressionContext('1234-5678','T-Shirt');
    t.addEnhancedEcommercePromoContext('1234-5678','T-Shirt');
    t.addEnhancedEcommerceActionContext('1234-5678','T-Shirt');
    t.trackEnhancedEcommerceAction();

    const findWithStaticValue = F.filter(F.get('data.id'))
    const extractContextsWithStaticValue = F.compose(
      findWithStaticValue,
      F.flatten,
      extractSchemas,
      getUEEvents
    )

    const countWithStaticValueEq = value =>
      F.compose(
        F.size,
        F.filter(
          F.compose(
            F.eq(value),
            F.get('data.id')
          )
        ),
        extractContextsWithStaticValue
      )

    // we expect there to be four contexts added to the event
    expect(countWithStaticValueEq('1234-5678')(outQueues)).toBe(4)
  })
})

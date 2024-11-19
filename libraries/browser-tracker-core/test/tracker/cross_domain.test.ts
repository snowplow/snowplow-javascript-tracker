import * as uuid from 'uuid';
jest.mock('uuid');
const MOCK_UUID = '123456789';
jest.spyOn(uuid, 'v4').mockReturnValue(MOCK_UUID);

import { createTracker } from '../helpers';
import { getByText, queryByText, waitFor } from '@testing-library/dom';
import { urlSafeBase64Encode } from '../../src';

function getCrossDomainURLParam(url: string) {
  const CROSS_DOMAIN_PARAMETER_NAME = '_sp';
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get(CROSS_DOMAIN_PARAMETER_NAME);
}

function decodeExtendedCrossDomainLinkParam(crossDomainLinkValue: string) {
  return crossDomainLinkValue.split('.');
}

describe('Cross-domain linking: ', () => {
  const CROSS_DOMAIN_LINK_PARAMETERS_LENGTH = 7;
  const standardDate = new Date(2023, 1, 1);

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(standardDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const CROSS_DOMAIN_LINK_TEXT = 'Cross-domain link';
  const appId = 'my-app';
  const userId = 'U1234';
  function getLinkDom() {
    const div = document.createElement('div');
    div.innerHTML = `
          <a href="https://example.com/cross-domain">${CROSS_DOMAIN_LINK_TEXT}</a>
        `;
    return div;
  }

  it('Adds the correct link decoration', async () => {
    const container = getLinkDom();

    const elem = getByText(container, CROSS_DOMAIN_LINK_TEXT);
    // @ts-ignore
    jest.spyOn(document, 'links', 'get').mockReturnValue([elem]);
    createTracker({ crossDomainLinker: () => true });
    elem.click();
    await waitFor(() => {
      const clickedLink = queryByText(container, CROSS_DOMAIN_LINK_TEXT)?.getAttribute('href') as string;
      const crossDomainLinkParam = getCrossDomainURLParam(clickedLink);
      const crossDomainParamParts = crossDomainLinkParam?.split('.') as string[];
      expect(crossDomainParamParts?.length).toEqual(2);
      expect(crossDomainParamParts[0]).toEqual(MOCK_UUID);
      expect(crossDomainParamParts[1]).toEqual(String(standardDate.getTime()));
    });
  });

  it('Adds the correct link decoration with default extended format', async () => {
    const container = getLinkDom();
    const elem = getByText(container, CROSS_DOMAIN_LINK_TEXT);
    // @ts-ignore
    jest.spyOn(document, 'links', 'get').mockReturnValue([elem]);
    const t = createTracker({ appId, crossDomainLinker: () => true, useExtendedCrossDomainLinker: true });
    t?.setUserId(userId);
    elem.click();
    await waitFor(() => {
      const clickedLink = queryByText(container, CROSS_DOMAIN_LINK_TEXT)?.getAttribute('href') as string;
      const crossDomainLinkParam = getCrossDomainURLParam(clickedLink) as string;
      const decodedCrossDomainLinkParam = decodeExtendedCrossDomainLinkParam(crossDomainLinkParam);
      expect(decodedCrossDomainLinkParam.length).toBe(CROSS_DOMAIN_LINK_PARAMETERS_LENGTH - 2);
      expect(decodedCrossDomainLinkParam).toStrictEqual([
        MOCK_UUID,
        String(standardDate.getTime()),
        MOCK_UUID,
        '',
        urlSafeBase64Encode(appId),
      ]);
    });
  });

  it('Adds the correct link decoration with configurable extended format and link text collection', async () => {
    const container = getLinkDom();

    const elem = getByText(container, CROSS_DOMAIN_LINK_TEXT);
    // @ts-ignore
    jest.spyOn(document, 'links', 'get').mockReturnValue([elem]);
    const t = createTracker({
      appId,
      crossDomainLinker: () => true,
      useExtendedCrossDomainLinker: { userId: true, reason: true, sourcePlatform: true },
    });
    t?.setUserId(userId);
    elem.click();
    await waitFor(() => {
      const clickedLink = queryByText(container, CROSS_DOMAIN_LINK_TEXT)?.getAttribute('href') as string;
      const crossDomainLinkParam = getCrossDomainURLParam(clickedLink) as string;
      const decodedCrossDomainLinkParam = decodeExtendedCrossDomainLinkParam(crossDomainLinkParam);
      expect(decodedCrossDomainLinkParam.length).toBe(CROSS_DOMAIN_LINK_PARAMETERS_LENGTH);
      expect(decodedCrossDomainLinkParam).toStrictEqual([
        MOCK_UUID,
        String(standardDate.getTime()),
        MOCK_UUID,
        urlSafeBase64Encode(userId),
        urlSafeBase64Encode(appId),
        'web',
        urlSafeBase64Encode(CROSS_DOMAIN_LINK_TEXT),
      ]);
    });
  });

  it('Adds the correct link decoration with configurable extended format and event callback', async () => {
    const container = getLinkDom();

    const elem = getByText(container, CROSS_DOMAIN_LINK_TEXT);
    // @ts-ignore
    jest.spyOn(document, 'links', 'get').mockReturnValue([elem]);
    createTracker({
      appId,
      crossDomainLinker: () => true,
      useExtendedCrossDomainLinker: { reason: (evt) => evt.type },
    });
    elem.click();
    await waitFor(() => {
      const clickedLink = queryByText(container, CROSS_DOMAIN_LINK_TEXT)?.getAttribute('href') as string;
      const crossDomainLinkParam = getCrossDomainURLParam(clickedLink) as string;
      const decodedCrossDomainLinkParam = decodeExtendedCrossDomainLinkParam(crossDomainLinkParam);
      expect(decodedCrossDomainLinkParam.length).toBe(CROSS_DOMAIN_LINK_PARAMETERS_LENGTH);
      expect(decodedCrossDomainLinkParam).toStrictEqual([
        MOCK_UUID,
        String(standardDate.getTime()),
        MOCK_UUID,
        '',
        urlSafeBase64Encode(appId),
        '',
        urlSafeBase64Encode('click'),
      ]);
    });
  });
});

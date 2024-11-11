import { CorePluginConfiguration, PayloadBuilder, TrackerCore } from '@snowplow/tracker-core';
import { ScreenSize, SubjectConfiguration } from './types';

export function newSubject(core: TrackerCore, configuration?: SubjectConfiguration) {
  let domainUserId: string | undefined;
  let networkUserId: string | undefined;

  const addSubjectToPayload = (payload: PayloadBuilder) => {
    payload.add('duid', domainUserId);
    payload.add('nuid', networkUserId);
  };

  const setScreenResolution = (screenSize: ScreenSize) =>
    core.setScreenResolution(String(screenSize[0]), String(screenSize[1]));

  const setNetworkUserId = (userId: string | undefined) => {
    networkUserId = userId;
  };

  const setDomainUserId = (userId: string | undefined) => {
    domainUserId = userId;
  };

  const setColorDepth = (colorDepth: number) => {
    core.setColorDepth(String(colorDepth));
  };

  const setScreenViewport = (screenSize: ScreenSize) => {
    core.setViewport(String(screenSize[0]), String(screenSize[1]));
  };

  const setSubjectData = (data: SubjectConfiguration) => {
    setNetworkUserId(data.networkUserId);
    setDomainUserId(data.domainUserId);
    if (data.userId) {
      core.setUserId(data.userId);
    }
    if (data.useragent) {
      core.setUseragent(data.useragent);
    }
    if (data.ipAddress) {
      core.setIpAddress(data.ipAddress);
    }
    if (data.timezone) {
      core.setTimezone(data.timezone);
    }
    if (data.language) {
      core.setLang(data.language);
    }
    if (data.screenResolution) {
      setScreenResolution(data.screenResolution);
    }
    if (data.colorDepth) {
      setColorDepth(data.colorDepth);
    }
    if (data.screenViewport) {
      setScreenViewport(data.screenViewport);
    }
  };

  if (configuration) {
    setSubjectData(configuration);
  }

  const subjectPlugin: CorePluginConfiguration = {
    plugin: {
      beforeTrack: addSubjectToPayload,
    },
  };

  return {
    subjectPlugin,
    properties: {
      setUserId: core.setUserId,
      setIpAddress: core.setIpAddress,
      setUseragent: core.setUseragent,
      setTimezone: core.setTimezone,
      setLanguage: core.setLang,
      setScreenResolution,
      setNetworkUserId,
      setDomainUserId,
      setSubjectData,
      setColorDepth,
      setScreenViewport,
    },
  };
}

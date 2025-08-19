import { CorePluginConfiguration } from '@snowplow/tracker-core';
import { PlatformContextConfiguration, PlatformContextProperty } from '../../types';
import { MOBILE_CONTEXT_SCHEMA } from '../../constants';
import {
  Platform,
  PlatformAndroidStatic,
  PlatformIOSStatic,
  Dimensions,
  PixelRatio,
  NativeModules,
} from 'react-native';
import { removeEmptyProperties } from '@snowplow/tracker-core';

export interface PlatformContextPlugin extends CorePluginConfiguration {
  enablePlatformContext: () => Promise<void>;
  disablePlatformContext: () => void;
  refreshPlatformContext: () => Promise<void>;
}

function getIOSConstants() {
  // Example Platform info on iOS:
  // {
  //   "OS": "ios",
  //   "Version": "18.0",
  //   "constants": {
  //     "forceTouchAvailable": false,
  //     "interfaceIdiom": "phone",
  //     "isMacCatalyst": false,
  //     "isTesting": false,
  //     "osVersion": "18.0",
  //     "systemName": "iOS"
  //   },
  //   "isMacCatalyst": false,
  //   "isPad": false,
  //   "isTV": false,
  //   "isVision": false
  // }

  // Example NativeModules.SettingsManager?.settings info on iOS:
  // {
  //   "AppleLanguages": [
  //     "en-GB"
  //   ],
  //   "AppleLocale": "en_GB"
  // }

  const { isPad, isTV, isVision, isMacCatalyst, constants } = Platform as PlatformIOSStatic;
  return {
    osType: constants.systemName,
    deviceManufacturer: 'Apple Inc.',
    osVersion: constants.osVersion,
    deviceModel: isPad ? 'iPad' : isTV ? 'Apple TV' : isVision ? 'Vision' : isMacCatalyst ? 'Mac' : 'iPhone',
    language:
      NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages[0], //iOS 13
  };
}

function getAndroidConstants() {
  // Example Platform info on Android:
  // {
  //   "OS": "android",
  //   "Version": 33,
  //   "constants": {
  //     "Brand": "google",
  //     "Manufacturer": "Google",
  //     "Model": "sdk_gphone64_arm64",
  //     "Release": "13",
  //     "Version": 33,
  //   },
  // }

  // Example NativeModules.I18nManager info on Android:
  // { "localeIdentifier": "en_US" }
  const constants = Platform.constants as PlatformAndroidStatic['constants'];
  return {
    osType: 'android',
    deviceManufacturer: constants.Manufacturer,
    osVersion: constants.Release,
    deviceModel: constants.Model,
    language: NativeModules.I18nManager?.localeIdentifier,
  };
}

/**
 * Tracks a mobile_context entity with all events if platformContext is enabled.
 */
export async function newPlatformContextPlugin({
  platformContext = true,
  platformContextProperties,
  platformContextRetriever,
}: PlatformContextConfiguration = {}): Promise<PlatformContextPlugin> {
  let deviceModel: string | undefined;
  let osType: string | undefined;
  let deviceManufacturer: string | undefined;
  let osVersion: string | undefined;
  let carrier: string | undefined;
  let networkType: 'mobile' | 'wifi' | 'offline' | undefined;
  let networkTechnology: string | undefined;
  let appleIdfa: string | undefined;
  let appleIdfv: string | undefined;
  let androidIdfa: string | undefined;
  let physicalMemory: number | undefined;
  let systemAvailableMemory: number | undefined;
  let appAvailableMemory: number | undefined;
  let batteryLevel: number | undefined;
  let batteryState: 'unplugged' | 'charging' | 'full' | undefined;
  let lowPowerMode: boolean | undefined;
  let availableStorage: number | undefined;
  let totalStorage: number | undefined;
  let isPortrait: boolean | undefined;
  let resolution: string | undefined;
  let scale: number | undefined;
  let language: string | undefined;
  let appSetId: string | undefined;
  let appSetIdScope: string | undefined;

  const refreshPlatformContext = async () => {
    const constants =
      Platform.OS === 'ios' ? getIOSConstants() : Platform.OS == 'android' ? getAndroidConstants() : undefined;

    deviceModel = platformContextRetriever?.getDeviceModel
      ? await platformContextRetriever?.getDeviceModel()
      : constants?.deviceModel;
    osType = platformContextRetriever?.getOsType ? await platformContextRetriever?.getOsType() : constants?.osType;
    deviceManufacturer = platformContextRetriever?.getDeviceManufacturer
      ? await platformContextRetriever?.getDeviceManufacturer()
      : constants?.deviceManufacturer;
    osVersion = platformContextRetriever?.getOsVersion
      ? await platformContextRetriever?.getOsVersion()
      : constants?.osVersion;
    carrier =
      platformContextProperties?.includes(PlatformContextProperty.Carrier) ?? true
        ? platformContextRetriever?.getCarrier
          ? await platformContextRetriever?.getCarrier()
          : undefined
        : undefined;
    networkType =
      platformContextProperties?.includes(PlatformContextProperty.NetworkType) ?? true
        ? platformContextRetriever?.getNetworkType
          ? await platformContextRetriever?.getNetworkType()
          : undefined
        : undefined;
    networkTechnology = platformContextRetriever?.getNetworkTechnology
      ? await platformContextRetriever?.getNetworkTechnology()
      : undefined;
    appleIdfa =
      platformContextProperties?.includes(PlatformContextProperty.AppleIdfa) ?? true
        ? platformContextRetriever?.getAppleIdfa
          ? await platformContextRetriever?.getAppleIdfa()
          : undefined
        : undefined;
    appleIdfv =
      platformContextProperties?.includes(PlatformContextProperty.AppleIdfv) ?? true
        ? platformContextRetriever?.getAppleIdfv
          ? await platformContextRetriever?.getAppleIdfv()
          : undefined
        : undefined;
    androidIdfa =
      platformContextProperties?.includes(PlatformContextProperty.AndroidIdfa) ?? true
        ? platformContextRetriever?.getAndroidIdfa
          ? await platformContextRetriever?.getAndroidIdfa()
          : undefined
        : undefined;
    physicalMemory =
      platformContextProperties?.includes(PlatformContextProperty.PhysicalMemory) ?? true
        ? platformContextRetriever?.getPhysicalMemory
          ? await platformContextRetriever.getPhysicalMemory()
          : undefined
        : undefined;
    systemAvailableMemory =
      platformContextProperties?.includes(PlatformContextProperty.SystemAvailableMemory) ?? true
        ? platformContextRetriever?.getSystemAvailableMemory
          ? await platformContextRetriever.getSystemAvailableMemory()
          : undefined
        : undefined;
    appAvailableMemory =
      platformContextProperties?.includes(PlatformContextProperty.AppAvailableMemory) ?? true
        ? platformContextRetriever?.getAppAvailableMemory
          ? await platformContextRetriever?.getAppAvailableMemory()
          : undefined
        : undefined;
    batteryLevel =
      platformContextProperties?.includes(PlatformContextProperty.BatteryLevel) ?? true
        ? platformContextRetriever?.getBatteryLevel
          ? await platformContextRetriever?.getBatteryLevel()
          : undefined
        : undefined;
    batteryState =
      platformContextProperties?.includes(PlatformContextProperty.BatteryState) ?? true
        ? platformContextRetriever?.getBatteryState
          ? await platformContextRetriever?.getBatteryState()
          : undefined
        : undefined;
    lowPowerMode =
      platformContextProperties?.includes(PlatformContextProperty.LowPowerMode) ?? true
        ? platformContextRetriever?.getLowPowerMode
          ? await platformContextRetriever?.getLowPowerMode()
          : undefined
        : undefined;
    availableStorage =
      platformContextProperties?.includes(PlatformContextProperty.AvailableStorage) ?? true
        ? platformContextRetriever?.getAvailableStorage
          ? await platformContextRetriever?.getAvailableStorage()
          : undefined
        : undefined;
    totalStorage =
      platformContextProperties?.includes(PlatformContextProperty.TotalStorage) ?? true
        ? platformContextRetriever?.getTotalStorage
          ? await platformContextRetriever?.getTotalStorage()
          : undefined
        : undefined;
    isPortrait =
      platformContextProperties?.includes(PlatformContextProperty.IsPortrait) ?? true
        ? platformContextRetriever?.isPortrait
          ? await platformContextRetriever.isPortrait()
          : undefined
        : undefined;
    resolution =
      platformContextProperties?.includes(PlatformContextProperty.Resolution) ?? true
        ? platformContextRetriever?.getResolution
          ? await platformContextRetriever?.getResolution()
          : Math.floor(Dimensions.get('window').width) + 'x' + Math.floor(Dimensions.get('window').height)
        : undefined;
    scale =
      platformContextProperties?.includes(PlatformContextProperty.Scale) ?? true
        ? platformContextRetriever?.getScale
          ? await platformContextRetriever?.getScale()
          : PixelRatio.get()
        : undefined;
    language = (
      platformContextProperties?.includes(PlatformContextProperty.Language) ?? true
        ? platformContextRetriever?.getLanguage
          ? await platformContextRetriever?.getLanguage()
          : constants?.language
        : undefined
    )?.substring(0, 8);
    appSetId =
      platformContextProperties?.includes(PlatformContextProperty.AppSetId) ?? true
        ? platformContextRetriever?.getAppSetId
          ? await platformContextRetriever?.getAppSetId()
          : undefined
        : undefined;
    appSetIdScope =
      platformContextProperties?.includes(PlatformContextProperty.AppSetIdScope) ?? true
        ? platformContextRetriever?.getAppSetIdScope
          ? await platformContextRetriever?.getAppSetIdScope()
          : undefined
        : undefined;
  };

  const enablePlatformContext = async () => {
    platformContext = true;
    await refreshPlatformContext();
  };

  const disablePlatformContext = () => {
    platformContext = false;
  };

  if (platformContext) {
    await refreshPlatformContext();
  }

  const contexts = () => {
    // check required properties
    if (
      platformContext &&
      osType !== undefined &&
      osVersion !== undefined &&
      deviceManufacturer !== undefined &&
      deviceModel !== undefined
    ) {
      return [
        {
          schema: MOBILE_CONTEXT_SCHEMA,
          data: removeEmptyProperties({
            osType,
            osVersion,
            deviceManufacturer,
            deviceModel,
            carrier,
            networkType,
            networkTechnology,
            appleIdfa,
            appleIdfv,
            androidIdfa,
            physicalMemory,
            systemAvailableMemory,
            appAvailableMemory,
            batteryLevel,
            batteryState,
            lowPowerMode,
            availableStorage,
            totalStorage,
            isPortrait,
            resolution,
            scale,
            language,
            appSetId,
            appSetIdScope,
          }),
        },
      ];
    } else {
      return [];
    }
  };

  return {
    enablePlatformContext,
    disablePlatformContext,
    refreshPlatformContext,
    plugin: {
      contexts,
    },
  };
}

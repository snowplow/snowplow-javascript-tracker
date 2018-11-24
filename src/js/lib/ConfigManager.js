/**
 * The configuration defaults
 * @typedef {Object} TrackerConfiguration
 *
 * @property {Boolean} encodeBase64 - defaults to true
 * @property {String} cookieDomain - defaults to null
 * @property {String} cookieName - defaults to '_sp_'
 * @property {String} appId - defaults to ''
 * @property {String} platform - defaults to 'web'
 * @property {Boolean} respectDoNotTrack - defaults to false
 * @property {Number} userFingerprintSeed - defaults to 123412414
 * @property {Boolean} userFingerprint - Fingerprint users
 * @property {Number} pageUnloadTimer - defaults to 500
 * @property {Boolean} forceSecureTracker, - defaults to alse
 * @property {Boolean} forceUnsecureTracker, - defaults to alse
 * @property {Boolean} useLocalStorage - defaults to true
 * @property {Boolean} useCookies - defaults to true
 * @property {Number} sessionCookieTimeout - defaults to 1800
 * @property {Object} contexts - defaults to {}
 * @property {Boolean} post - defaults to false
 * @property {Numner} bufferSize - defaults to 1
 * @property {Boolean} crossDomainLinker - defaults to false
 * @property {Number} maxPostBytes - defaults to 40000
 * @property {Boolean} discoverRootDomain - defaults to false
 * @property {Number} cookieLifetime - defaults to 63072000
 * @property {String} stateStorageStrategy - defaults to 'cookieAndLocalStorage'
 */

/**
 * @returns {TrackerConfiguration} - The configuration defaults
 */
export const ConfigDefaults = {
    encodeBase64: true,
    cookieDomain: null,
    cookieName: '_sp_',
    appId: '',
    platform: 'web',
    respectDoNotTrack: false,
    userFingerprint: true,
    userFingerprintSeed: 123412414,
    pageUnloadTimer: 500,
    forceSecureTracker: false,
    forceUnsecureTracker: false,
    useLocalStorage: true,
    useCookies: true,
    sessionCookieTimeout: 1800,
    contexts: {},
    post: false,
    bufferSize: 1,
    crossDomainLinker: false,
    maxPostBytes: 40000,
    discoverRootDomain: false,
    cookieLifetime: 63072000,
    stateStorageStrategy: 'cookieAndLocalStorage',
}

/**
 * @class ConfigManager
 */
class ConfigManager {
    /**
     *
     * @param {TrackerConfiguration}  - Custom tracker configuration settings
     * @returns {ConfigManager} instance of the ConfigManager class
     */
    constructor(config) {
        this._config = config
    }

    /**
     * @returns {TrackerConfiguration}
     */
    get config() {


        // // Whether to use localStorage to store events between sessions while offline
        // this.useLocalStorage = argmap.hasOwnProperty('useLocalStorage')
        //     ? (helpers.warn(
        //         'argmap.useLocalStorage is deprecated. ' +
        //               'Use argmap.stateStorageStrategy instead.'
        //     ),
        //     argmap.useLocalStorage)
        //     : true

        // // Whether to use cookies
        // this.configUseCookies = argmap.hasOwnProperty('useCookies')
        //     ? (helpers.warn(
        //         'argmap.useCookies is deprecated. Use argmap.stateStorageStrategy instead.'
        //     ),
        //     argmap.useCookies)
        //     : true

        // // Strategy defining how to store the state: cookie, localStorage or none
        // this.configStateStorageStrategy = argmap.hasOwnProperty(
        //     'stateStorageStrategy'
        // )
        //     ? argmap.stateStorageStrategy
        //     : !configUseCookies && !useLocalStorage
        //         ? 'none'
        //         : configUseCookies && useLocalStorage
        //             ? 'cookieAndLocalStorage'
        //             : configUseCookies
        //                 ? 'cookie'
        //                 : 'localStorage'



        return { ...ConfigDefaults, ...this._config }
    }
}

export default ConfigManager

# Change Log - @snowplow/browser-tracker-core

This log was last generated on Wed, 24 Jul 2024 08:59:00 GMT and should not be manually modified.

## 3.24.2
Wed, 24 Jul 2024 08:59:00 GMT

### Updates

- Fix tracking a page view with a custom title sets the title for future page views as well (#1332)

## 3.24.1
Tue, 02 Jul 2024 07:08:17 GMT

### Updates

- Fix ResizeObserver initialization if document.body does not exist yet (#1311)

## 3.24.0
Tue, 25 Jun 2024 08:31:05 GMT

### Updates

- Add an option to generate the page view ID according to changes in the page URL to account for events tracked before page views in SPAs (#1307 and #1125)
- Fix custom document title override using setDocumentTitle (#1317)

## 3.23.1
Tue, 04 Jun 2024 13:34:45 GMT

_Version update only_

## 3.23.0
Thu, 28 Mar 2024 11:28:45 GMT

### Updates

- Cache browser properties and use the ResizeObserver to update when changed (#1295) thanks to @rvetere

## 3.22.1
Wed, 13 Mar 2024 08:39:48 GMT

_Version update only_

## 3.22.0
Fri, 08 Mar 2024 08:13:04 GMT

### Updates

- Update method signatures for BrowserTracker

## 3.21.0
Mon, 29 Jan 2024 08:34:06 GMT

### Updates

- Consistently access navigator via window.navigator

## 3.20.0
Mon, 15 Jan 2024 14:41:16 GMT

### Updates

- Allow for extended cross domain linking information using the useExtendedCrossDomainLinker option

## 3.19.0
Thu, 14 Dec 2023 10:45:23 GMT

### Updates

- Do not set the previous session ID reference in cookies if anonymous tracking is enabled (#1268)
- Fix config for callbacks

## 3.18.0
Mon, 04 Dec 2023 13:44:02 GMT

### Updates

- Add onRequestSuccess and onRequestFailure callbacks

## 3.17.0
Tue, 14 Nov 2023 17:58:26 GMT

### Updates

- Consider status codes <200
- Bump browser_context schema to 2-0-0

## 3.16.0
Mon, 16 Oct 2023 14:58:08 GMT

_Version update only_

## 3.15.0
Mon, 28 Aug 2023 14:25:14 GMT

### Updates

- Add idService option

## 3.14.0
Thu, 10 Aug 2023 13:56:44 GMT

### Updates

- Allow disabling activity tracking actions with disableActivityTracking and disableActivityTrackingCallback APIs

## 3.13.1
Thu, 29 Jun 2023 14:20:06 GMT

### Updates

- Allow events to be tracked on the onSessionUpdate callback

## 3.13.0
Tue, 20 Jun 2023 07:44:23 GMT

_Version update only_

## 3.12.1
Thu, 15 Jun 2023 10:05:37 GMT

_Version update only_

## 3.12.0
Mon, 05 Jun 2023 11:51:22 GMT

_Version update only_

## 3.11.0
Wed, 24 May 2023 15:56:17 GMT

### Updates

- Add onSessionUpdate callback configuration option
- Round dimension type values on payload

## 3.10.1
Fri, 12 May 2023 06:59:31 GMT

_Version update only_

## 3.10.0
Thu, 11 May 2023 08:29:15 GMT

_Version update only_

## 3.9.0
Thu, 30 Mar 2023 13:46:56 GMT

### Updates

- Add touchmove and touchstart events on page ping calculation
- Add client_session context entity if anonymous tracking with session tracking is enabled (#1124)
- Fix root domain algorithm initial attempt
- Fix generating domain user ID when clearing user data with anonymous tracking (#1164)
- Add browser context and ability to generate tab identifier.

## 3.8.0
Tue, 03 Jan 2023 15:36:33 GMT

_Version update only_

## 3.7.0
Mon, 31 Oct 2022 06:26:28 GMT

_Version update only_

## 3.6.0
Thu, 15 Sep 2022 07:55:20 GMT

### Updates

- Fix newTracker built-in context typing
- Added BuiltInContexts type
- Correct initial session_index value and after clearUserData (closes #1106 #1107)

## 3.5.0
Fri, 10 Jun 2022 18:57:46 GMT

### Updates

- Add client session context entity (#1077)
- Add a customizable set of failure HTTP status codes for which collector requests should not be retried (#1079)

## 3.4.0
Thu, 07 Apr 2022 11:56:26 GMT

### Updates

- Bump dependencies (#1067)
- Add configurable max GET request size in bytes attribute (#449)

## 3.3.1
Wed, 23 Feb 2022 19:27:40 GMT

_Version update only_

## 3.3.0
Mon, 31 Jan 2022 15:58:10 GMT

_Version update only_

## 3.2.3
Tue, 18 Jan 2022 16:23:52 GMT

### Updates

- Bump Copyright to 2022 (#1040)

## 3.2.2
Fri, 14 Jan 2022 10:17:59 GMT

_Version update only_

## 3.2.1
Wed, 12 Jan 2022 09:50:29 GMT

_Version update only_

## 3.2.0
Tue, 11 Jan 2022 12:53:22 GMT

### Updates

- Add support for custom headers (#1010)
- Allow alternative Access-Control-Allow-Credentials values (#808)
- Ensure Browser Data is added to Payload before plugin beforeTrack fires (#1025)

## 3.1.6
Tue, 19 Oct 2021 09:17:22 GMT

### Updates

- Fix failing build on ARM Macs (#1012)

## 3.1.5
Fri, 01 Oct 2021 08:09:21 GMT

### Updates

- Fix removeGlobalContexts not removing expected context (#1006)

## 3.1.4
Tue, 21 Sep 2021 14:59:36 GMT

### Updates

- Fix linkDecorationHandler targeting (#1002)

## 3.1.3
Mon, 23 Aug 2021 10:13:18 GMT

### Updates

- Add missing setter to detectPassiveEvents (#995)

## 3.1.2
Mon, 16 Aug 2021 12:59:59 GMT

### Updates

- Fix undefined argument regression in setUserId and setOptOutCookie (#991)
- Update READMEs with correct Node requirements (#994)

## 3.1.1
Wed, 04 Aug 2021 10:12:25 GMT

### Updates

- Automate api-extractor on release (#972)
- Allow tracker to load in fully sandboxes iframes (#981)
- Allow options: false when calling enableAnonymousTracking (#977)
- Prevent the Activity Tracking timer being enabled twice with duplicate enableActivityTracking calls (#975)
- Bump tslib to 2.3.0 (#986)
- Prevent the Activity Tracking timer being enabled twice with duplicate enableActivityTracking calls (#975)
- Protect against invalid domain_sessionid values being used by the tracker (#978)
- Bump typescript to 4.3.5 (#987)
- Switch from @wessberg/rollup-plugin-ts to rollup-plugin-ts (#988)

## 3.1.0
Fri, 14 May 2021 10:45:32 GMT

### Updates

- Clear in memory identifiers in clearUserData() (#968)
- Allow stateStorageStrategy to be changed on enableAnonymousTracking (#969)

## 3.0.3
Wed, 21 Apr 2021 12:35:06 GMT

### Updates

- Fix race condition when using Form and Link Click tracking (#962)

## 3.0.2
Thu, 15 Apr 2021 21:07:39 GMT

### Updates

- Remove compatMode check in activity tracking page offsets (#958)

## 3.0.1
Wed, 14 Apr 2021 16:30:05 GMT

### Updates

- Mark packages as sideEffect: false (#951)
- Add unit tests to plugin track* functions (#954)

## 3.0.0
Wed, 31 Mar 2021 14:46:47 GMT

### Updates

- Allow plugins to be dynamically loaded when using tracker (#918)
- Add debug mode (#381)
- Remove forceSecureTracker and forceUnsecureTracker properties (#913)
- Bump uuid to 3.4.0 (close #915)
- Bump rollup to 2.41 (#916)
- Remove module level references to window and document (close #928)
- Ensure browser-tracker API methods catch exceptions (#919)
- Introduce TSDoc comments and extract interfaces where appropriate (#906)
- Bump major version to v3 and update READMEs (#904)
- Improve Core API for module bundlers which support treeshaking (#903)
- Rename @snowplow/browser-core to @snowplow/browser-tracker-core (#901)
- Publish lite version of sp.js (#900)
- Ensure correct 3-Clause BSD License notices are being used (#316)
- Improve API for module bundlers which support treeshaking (#899)
- Bump rush to 5.39 (#895)
- Port to TypeScript (#72)
- Make sp.js build process modular (#450)
- Create @snowplow/browser-tracker package for npm distribution (#541)
- Split auto contexts into plugins (#880)
- Add rush to manage monorepo (#883)
- Add ES Module builds (#882)
- Cleanup deprecated methods (#557)
- Update publishing process for rush (#907)
- Change white and black lists to allow and deny lists (#908)
- Create rush change files for major version 3 release (#909)
- Improve event flushing options and remove pageUnloadTimer (#719)


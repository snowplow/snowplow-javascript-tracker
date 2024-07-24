# Change Log - @snowplow/javascript-tracker

This log was last generated on Wed, 24 Jul 2024 08:59:00 GMT and should not be manually modified.

## 3.24.2
Wed, 24 Jul 2024 08:59:00 GMT

### Updates

- Fix integration tests (#826)

## 3.24.1
Tue, 02 Jul 2024 07:08:17 GMT

_Version update only_

## 3.24.0
Tue, 25 Jun 2024 08:31:05 GMT

### Updates

- Fix running integration tests due to a problem with Micro

## 3.23.1
Tue, 04 Jun 2024 13:34:45 GMT

### Updates

- Add E2E test compatibility with Micro v3

## 3.23.0
Thu, 28 Mar 2024 11:28:45 GMT

### Updates

- Additions for the Event Specifications plugin
- Update webdriverio to 8.35 and saucelabs to 7.5 (#1301)

## 3.22.1
Wed, 13 Mar 2024 08:39:48 GMT

_Version update only_

## 3.22.0
Fri, 08 Mar 2024 08:13:04 GMT

_Version update only_

## 3.21.0
Mon, 29 Jan 2024 08:34:06 GMT

_Version update only_

## 3.20.0
Mon, 15 Jan 2024 14:41:16 GMT

### Updates

- Support clicks on child elements in button click tracking (#1280)

## 3.19.0
Thu, 14 Dec 2023 10:45:23 GMT

_Version update only_

## 3.18.0
Mon, 04 Dec 2023 13:44:02 GMT

### Updates

- Add onRequestSuccess and onRequestFailure callbacks

## 3.17.0
Tue, 14 Nov 2023 17:58:26 GMT

### Updates

- Add further options for the gaCookies context

## 3.16.0
Mon, 16 Oct 2023 14:58:08 GMT

_Version update only_

## 3.15.0
Mon, 28 Aug 2023 14:25:14 GMT

_Version update only_

## 3.14.0
Thu, 10 Aug 2023 13:56:44 GMT

### Updates

- Introduce PrivacySandboxPlugin
- End to end test changes

## 3.13.1
Thu, 29 Jun 2023 14:20:06 GMT

### Updates

- Added onSessionUpdate callback integration test

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

_Version update only_

## 3.10.1
Fri, 12 May 2023 06:59:31 GMT

_Version update only_

## 3.10.0
Thu, 11 May 2023 08:29:15 GMT

_Version update only_

## 3.9.0
Thu, 30 Mar 2023 13:46:56 GMT

### Updates

- Add files attribute for npm publishing

## 3.8.0
Tue, 03 Jan 2023 15:36:33 GMT

### Updates

- Add Snowplow Ecommerce browser plugin

## 3.7.0
Mon, 31 Oct 2022 06:26:28 GMT

_Version update only_

## 3.6.0
Thu, 15 Sep 2022 07:55:20 GMT

### Updates

- Add whitelabel build capability for javascript tracker (#161)

## 3.5.0
Fri, 10 Jun 2022 18:57:46 GMT

### Updates

- Add client session context entity (#1077)

## 3.4.0
Thu, 07 Apr 2022 11:56:26 GMT

### Updates

- Enable form tracking on forms embedded within iframes where possible (#1066)
- Bump dependencies (#1067)
- Add ability to enable only form_change, or form_submit, focus_form or any combination (#371)

## 3.3.1
Wed, 23 Feb 2022 19:27:40 GMT

### Updates

- Pin Browser integration tests to specific versions (#1063)

## 3.3.0
Mon, 31 Jan 2022 15:58:10 GMT

### Updates

- Fix YouTube plugin throwing errors on calling player methods (#1043)
- Fix options.boundaries not being respected (#1044)
- Fix 'paused' property never being true (#1047)
- Add `ready` to YouTube Plugin DefaultEvents (#1049)
- Add ready to Media Plugin DefaultEvents (#1053)
- Fix YouTube Plugin enabling of seek/volume events (#1058)

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
- Allow enableFormTracking to capture dynamic form changes (#748)
- Allow alternative Access-Control-Allow-Credentials values (#808)
- Add HTML5 Media Tracking plugin (#805)
- JavaScript Tracker YouTube Tracking (#1014)

## 3.1.6
Tue, 19 Oct 2021 09:17:22 GMT

### Updates

- Fix failing build on ARM Macs (#1012)

## 3.1.5
Fri, 01 Oct 2021 08:09:21 GMT

_Version update only_

## 3.1.4
Tue, 21 Sep 2021 14:59:36 GMT

_Version update only_

## 3.1.3
Mon, 23 Aug 2021 10:13:18 GMT

_Version update only_

## 3.1.2
Mon, 16 Aug 2021 12:59:59 GMT

### Updates

- Fix undefined argument regression in setUserId and setOptOutCookie (#991)
- Update READMEs with correct Node requirements (#994)

## 3.1.1
Wed, 04 Aug 2021 10:12:25 GMT

### Updates

- Bump snowplow-micro to 1.1.2 (#984)
- Bump tslib to 2.3.0 (#986)
- Bump typescript to 4.3.5 (#987)
- Switch from @wessberg/rollup-plugin-ts to rollup-plugin-ts (#988)

## 3.1.0
Fri, 14 May 2021 10:45:32 GMT

_Version update only_

## 3.0.3
Wed, 21 Apr 2021 12:35:06 GMT

_Version update only_

## 3.0.2
Thu, 15 Apr 2021 21:07:39 GMT

_Version update only_

## 3.0.1
Wed, 14 Apr 2021 16:30:05 GMT

### Updates

- Add unit tests to plugin track* functions (#954)

## 3.0.0
Wed, 31 Mar 2021 14:46:47 GMT

### Updates

- Allow plugins to be dynamically loaded when using tracker (#918)
- Add debug mode (#381)
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


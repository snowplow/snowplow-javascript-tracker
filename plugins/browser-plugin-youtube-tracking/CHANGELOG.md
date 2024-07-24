# Change Log - @snowplow/browser-plugin-youtube-tracking

This log was last generated on Wed, 24 Jul 2024 08:59:00 GMT and should not be manually modified.

## 3.24.2
Wed, 24 Jul 2024 08:59:00 GMT

_Version update only_

## 3.24.1
Tue, 02 Jul 2024 07:08:17 GMT

_Version update only_

## 3.24.0
Tue, 25 Jun 2024 08:31:05 GMT

_Version update only_

## 3.23.1
Tue, 04 Jun 2024 13:34:45 GMT

_Version update only_

## 3.23.0
Thu, 28 Mar 2024 11:28:45 GMT

_Version update only_

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

_Version update only_

## 3.19.0
Thu, 14 Dec 2023 10:45:23 GMT

_Version update only_

## 3.18.0
Mon, 04 Dec 2023 13:44:02 GMT

_Version update only_

## 3.17.0
Tue, 14 Nov 2023 17:58:26 GMT

_Version update only_

## 3.16.0
Mon, 16 Oct 2023 14:58:08 GMT

_Version update only_

## 3.15.0
Mon, 28 Aug 2023 14:25:14 GMT

_Version update only_

## 3.14.0
Thu, 10 Aug 2023 13:56:44 GMT

_Version update only_

## 3.13.1
Thu, 29 Jun 2023 14:20:06 GMT

_Version update only_

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

### Updates

- Fix 'percentprogress' events not firing without 'play' and 'pause' in 'captureEvents'

## 3.10.0
Thu, 11 May 2023 08:29:15 GMT

### Updates

- Fix 'captureEvents' not being respected

## 3.9.0
Thu, 30 Mar 2023 13:46:56 GMT

### Updates

- Remove fixed values for playbackQuality in YT integrations plus type fixes (closes #1122)

## 3.8.0
Tue, 03 Jan 2023 15:36:33 GMT

_Version update only_

## 3.7.0
Mon, 31 Oct 2022 06:26:28 GMT

### Updates

- Fix youtube error mapping codes to fit the Iglu schema (closes #1111)
- Use shared logger for Youtube plugin loading and add helpful message for plugin initialization missing (closes #1113)
- Round youtube volume sent on volumechange (closes #1126)

## 3.6.0
Thu, 15 Sep 2022 07:55:20 GMT

_Version update only_

## 3.5.0
Fri, 10 Jun 2022 18:57:46 GMT

_Version update only_

## 3.4.0
Thu, 07 Apr 2022 11:56:26 GMT

### Updates

- Bump dependencies (#1067)

## 3.3.1
Wed, 23 Feb 2022 19:27:40 GMT

_Version update only_

## 3.3.0
Mon, 31 Jan 2022 15:58:10 GMT

### Updates

- Fix YouTube plugin throwing errors on calling player methods (#1043)
- Fix options.boundaries not being respected (#1044)
- Fix 'paused' property never being true (#1047)
- Add `ready` to YouTube Plugin DefaultEvents (#1049)
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

### Updates

- Add volume change to YouTube plugin default event group (#1032)
- Fix License Badges in READMEs (#1028)
- Remove additional console logging when Youtube iFrame API fails to load (#1027)

## 3.2.0
Tue, 11 Jan 2022 12:53:22 GMT

### Updates

- JavaScript Tracker YouTube Tracking (#1014)


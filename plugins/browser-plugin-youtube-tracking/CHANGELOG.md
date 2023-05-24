# Change Log - @snowplow/browser-plugin-youtube-tracking

This log was last generated on Wed, 24 May 2023 15:56:17 GMT and should not be manually modified.

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


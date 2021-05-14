# Change Log - @snowplow/browser-tracker-core

This log was last generated on Fri, 14 May 2021 10:45:32 GMT and should not be manually modified.

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


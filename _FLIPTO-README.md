This is a fork of the main repo to add support for in-memory domain user ids.
The main change is removing emptyIdCookie from id_cookie and index
to build a whitelabel build 
https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/javascript-trackers/web-tracker/hosting-the-javascript-tracker/creating-a-whitelabel-build/

updated tracker.lite.config.ts to contain plugins necessary

HOW TO BUILD 

cd C:\Git\snowplow-javascript-tracker\
rush update
rush build

CURRENTLY BROKEN!
--cd .\trackers\javascript-tracker\
--rushx build --whitelabel=FliptoGlobalSnowplowNamespace

Take the code built for snowplow.lite and rename to ftsa.js and ftsa.js.map
Ensure you rename the mapping url and remove any header text from ftsa as well!
Publish to Azure Storage and clear CDN
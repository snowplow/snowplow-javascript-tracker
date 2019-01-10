import packageJSON from '../package.json'

const banner =
`/*
* Snowplow - The world's most powerful web analytics platform
*
* @description ${packageJSON.description}
* @version     ${packageJSON.version}
* @author      ${packageJSON.contributors}
* @copyright   Anthon Pang, Snowplow Analytics Ltd
* @license     ${packageJSON.license}
*
* For technical documentation:
* https://github.com/snowplow/snowplow/wiki/javascript-tracker
*
* For the setup guide:
* https://github.com/snowplow/snowplow/wiki/javascript-tracker-setup
*
* Minimum supported browsers:
* - Firefox 27
* - Chrome 32
* - IE 9
* - Safari 8
*/
`
export default banner
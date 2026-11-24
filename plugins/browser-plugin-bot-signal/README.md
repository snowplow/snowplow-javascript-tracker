# @snowplow/browser-plugin-bot-signal (prototype)

Local prototype, not published. Mirrors `browser-plugin-bot-detection` but uses
[bot-signal](https://github.com/okasi/bot-signal) instant checks instead of BotD.
It emits the standard `client_side_bot_detection` 1-0-0 entity (`bot`, `kind`), so no new Iglu schema is needed.

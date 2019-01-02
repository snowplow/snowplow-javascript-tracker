const express = require('express')
const app = express()
const port = 3000

app.listen(port, () => console.log(`Test server listening on port ${port}!`))
app.use(express.static('dist'))
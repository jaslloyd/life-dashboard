const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        ['http://localhost:3002', 'http://localhost:3001'].includes(origin) !==
        -1
      ) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1', indexRouter)

module.exports = app

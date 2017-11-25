const mongoose = require('mongoose')

mongoose.Promise = global.Promise
const dbURI = 'mongodb://localhost:27017/TodoApp'
mongoose.connect(dbURI, { useMongoClient: true })

module.exports = { mongoose }

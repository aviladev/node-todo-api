const mongoose = require('mongoose')

mongoose.Promise = global.Promise
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp'
mongoose
  .connect(dbURI, { useMongoClient: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(e => {
    console.error('Could not connect to MongoDB')
    console.error(e)
    process.exit(1)
  })


module.exports = { mongoose }

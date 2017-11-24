const { MongoClient } = require('mongodb')

const dbURI = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(dbURI, (err, db) => {
  if (err) return console.log('Unable to connect to MongoDB server')

  console.log('Connected to MongoDB server')

  db.collection('Todos')
    .find({ completed: false })
    .toArray()
    .then((docs) => console.log(
      JSON.stringify(docs, undefined, 2)
    ))
    .catch(err => console.log('Unable to fetch toods', err))

  // db.close()
})

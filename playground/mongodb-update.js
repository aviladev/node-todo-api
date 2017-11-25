const { MongoClient, ObjectID } = require('mongodb')

const dbURI = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(dbURI, (err, db) => {
  if (err)
    return console.log('Unable to connect to MongoDB server')

  console.log('Connected to MongoDB server')

  db.collection('Users')
    .findOneAndUpdate(
      { _id: ObjectID('5a196435f6c868cf9be6bc99') },
      { 
        $set: {
          name: 'Pedro',
          location: 'Belo Horizonte, MG, Brasil'
        },
        $inc: {
          age: -1
        }
      },
      { returnOriginal: false }
    )
    .then(results =>
      console.log( JSON.stringify(results, null, 2) )
    )
    .catch(console.log)

  // db.close()
})

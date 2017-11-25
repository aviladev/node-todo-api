const { MongoClient, ObjectID } = require('mongodb')

const dbURI = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(dbURI, (err, db) => {
  if (err) return console.log('Unable to connect to MongoDB server')

  console.log('Connected to MongoDB server')

  // deleteMany
  // db.collection('Users')
  //   .deleteMany({ name: 'Pedro' })
  //   .then(result =>
  //     JSON.stringify(console.log(result), undefined, 2)
  //   )
  //   .catch(err => console.log(err))

  // findOneAndDelete by id
  db.collection('Users')
    .findOneAndDelete({ _id: ObjectID('5a196415f6c868cf9be6bc97') })
    .then(result =>
      JSON.stringify(console.log(result), undefined, 2)
    )
    .catch(err => console.log(err))

  // db.close()
})

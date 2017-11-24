const { MongoClient } = require('mongodb')

const dbURI = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(dbURI, (err, db) => {
  if (err) return console.log('Unable to connect to MongoDB server')

  console.log('Connected to MongoDB server')

  // db
  //   .collection('Todos')
  //   .insertOne({
  //     test: 'Something to do',
  //     completed: false
  //   }, (err, result) => {
  //     if (err) return console.log('Unable to insert todo', err)

  //     console.log(JSON.stringify(result.ops, undefined, 2))
  //   })

  // db
  //   .collection('Users')
  //   .insertOne({
  //     name: 'Pedro',
  //     age: 21,
  //     location: 'Rua Maravilha, Belo Horizonte, MG, Brasil'
  //   }, (err, result) => {
  //     if (err) return console.log('Unable to create user', err)

  //     console.log(JSON.stringify(result.ops, undefined, 2))
  //   })

  db.close()
})

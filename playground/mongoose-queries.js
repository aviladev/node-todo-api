const { ObjectID } = require('mongodb')

const { mongoose }  = require('../server/db/mongoose')
const { Todo } = require('../server/models/todo')
const { User } = require('../server/models/user')


// const id = '5a1a2267e3b2e959b5d827f411'

// if ( !ObjectID.isValid(id) ) {
//   return console.log('ID not valid')
// }

// Todo.find({ _id: id })
//   .then(todos => console.log('Todos', todos))

// Todo.findOne({ _id: id })
//   .then(todo => console.log('Todo', todo))

// Todo.findById(id)
//   .then(todo => {
//     if (!todo)
//       return console.log('ID not found')

//     console.log('Todo by ID', todo)
//   })
//   .catch(console.log)

User.findById('5a19af1c459d171ff8773a3c')
  .then(user => {
    if (!user)
      return console.log('ID not found')

    console.log(
      JSON.stringify(user, null, 2)
    )
  })
  .catch(console.log)

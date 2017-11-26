const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/todo')

const todos = [
  { _id: ObjectID(), text: 'First test todo' },
  { _id: ObjectID(), text: 'Second test todo' }
]

beforeEach(async () => {
  await Todo.remove({})
  await Todo.insertMany(todos)
})

describe('POST /todos', () => {
  it('should create a new todo', () => {
    const text = 'Test todo text'

    return request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .then(({ body }) =>
        expect(body.text).toBe(text)
      )
      .then(() =>
        Todo.find({text})
          .then(todos => {
            expect(todos.length).toBe(1)
            expect(todos[0].text).toBe(text)
          })
      )
    }
  )

  it('should not create todo with invalid body data', () =>
    request(app)
      .post('/todos')
      .send()
      .expect(400)
      .then(() => Todo.find()
        .then(todos => {
          expect(todos.length).toBe(2)
        })
      )
  )
})

describe('GET /todos', () => {
  
  it('should get all todos', async () => {
    const res = await request(app)
      .get('/todos')
      .expect(200)
    
    const { todos } = res.body
    expect(todos.length).toBe(2)
  })

})

describe('GET /todos/:id', () => {
  it('should return todo doc', async () => {
    const [ firstTestTodo ] = todos
    const res = await request(app)
      .get(`/todos/${firstTestTodo._id.toHexString()}`)
      .expect(200)

    const { todo } = res.body
    
    expect(todo.text).toBe(firstTestTodo.text)
  })

  it('should return 404 if todo not found', () =>
    request(app)
      .get(`/todos/${ObjectID().toHexString()}`)
      .expect(404)
  )

  it('should return 404 for non-object ids', () =>
    request(app)
      .get(`/todos/${123}`)
      .expect(404)
  )
})

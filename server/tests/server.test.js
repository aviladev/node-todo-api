const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/todo')
const { User } = require('../models/user')
const { todos, populateTodos, users, populateUsers } = require('./seed/seed')

const [firstTestTodo, secondTestTodo] = todos
const [firstTestUser, secondTestUser] = users

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should create a new todo', () => {
    const text = 'Test todo text'
    const { tokens: [{token}] } = firstTestUser
    
    return request(app)
      .post('/todos')
      .set('x-auth', token)
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
  })

  it('should not create todo with invalid body data', () => {
    const { tokens: [{token}] } = firstTestUser

    return request(app)
      .post('/todos')
      .set('x-auth', token)
      .send()
      .expect(400)
      .then(() => Todo.find()
        .then(todos => {
          expect(todos.length).toBe(2)
        })
      )
  })
})

describe('GET /todos', () => {
  
  it('should get all todos', async () => {
    const { tokens: [{ token }] } = firstTestUser

    const res = await request(app)
      .get('/todos')
      .set('x-auth', token)
      .expect(200)
    
    const { todos } = res.body
    expect(todos.length).toBe(1)
  })

})

describe('GET /todos/:id', () => {
  it('should return todo doc', async () => {
    const { tokens: [{token}] } = firstTestUser
    
    const res = await request(app)
      .get(`/todos/${firstTestTodo._id.toHexString()}`)
      .set('x-auth', token)
      .expect(200)

    const { todo } = res.body

    expect(todo.text).toBe(firstTestTodo.text)
  })

  it('should not return todo doc created by other user', async () => {
    const { tokens: [{ token: firstUserToken }] } = firstTestUser
    const secondTodoId = secondTestTodo._id.toHexString()

    await request(app)
      .get(`/todos/${secondTodoId}`)
      .set('x-auth', firstUserToken)
      .expect(404)
  })

  it('should return 404 if todo not found', () => {
    const { tokens: [{token}] } = firstTestUser

    return request(app)
      .get(`/todos/${ObjectID().toHexString()}`)
      .set('x-auth', token)
      .expect(404)
  })
  
  it('should return 404 for non-object ids', () => {
    const { tokens: [{token}] } = firstTestUser

    return request(app)
      .get(`/todos/${123}`)
      .set('x-auth', token)
      .expect(404)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', async () => {
    const { tokens: [{token}] } = secondTestUser
    const todoID = secondTestTodo._id.toHexString()

    const res = await request(app)
      .delete(`/todos/${todoID}`)
      .set('x-auth', token)
      .expect(200)

    const { body: {removedTodo} } = res
    expect(removedTodo._id).toBe(todoID)

    const queriedTodo = await Todo.findById(todoID)
    expect(queriedTodo).toNotExist()
  })

  it('should not remove the todo created by other user', async () => {
    const firstTodoID = firstTestTodo._id.toHexString()
    const { tokens: [{ token }] } = secondTestUser
    
    const res = await request(app)
      .delete(`/todos/${firstTodoID}`)
      .set('x-auth', token)
      .expect(404)
    
    const queriedTodo = await Todo.findById(firstTodoID)
    expect(queriedTodo).toExist()
  })
  
  it('should return 404 if todo not found', () => {
    const { tokens: [{ token }] } = secondTestUser

    return request(app)
      .delete(`/todos/${ObjectID().toHexString()}`)
      .set('x-auth', token)
      .expect(404)
  })

  it('should return 404 for non-object ids', () => {
    const { tokens: [{ token }] } = secondTestUser

    return request(app)
      .delete(`/todos/${123}`)
      .set('x-auth', token)
      .expect(404)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', async () => {
    const { tokens: [{token}] } = firstTestUser
    const newText = 'First test todo updated'
    
    const res = await request(app)
      .patch(`/todos/${firstTestTodo._id}`)
      .set('x-auth', token)
      .send({
        text: newText,
        completed: true 
      })
      .expect(200)
      
    const { todo: {text, completed, completedAt} } = res.body
    expect(text).toBe(newText)
    expect(completed).toBe(true)
    expect(completedAt).toBeA('number')
  })

  it('should not update the todo created by other user', async () => {
    const { tokens: [{ token }] } = secondTestUser
    const newText = 'First test todo updated'

    const res = await request(app)
      .patch(`/todos/${firstTestTodo._id}`)
      .set('x-auth', token)
      .send({
        text: newText,
        completed: true
      })
      .expect(404)

    expect(res.body).toEqual({})
  })
    
  it('should clear completedAt when todo is not completed', async () => {
    const { tokens: [{token}] } = secondTestUser
    const newText = 'Second test todo updated'

    const res = await request(app)
      .patch(`/todos/${secondTestTodo._id}`)
      .set('x-auth', token)
      .send({
        text: newText,
        completed: false
      })
      .expect(200)

    const { todo: {text, completed, completedAt} } = res.body
    expect(text).toBe(newText)
    expect(completed).toBe(false)
    expect(completedAt).toNotExist()
  })
})

describe('GET /users/me', () => {
  it('should return user if authenticated', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('x-auth', firstTestUser.tokens[0].token)
      .expect(200)

    const { body: {_id, email} } = response

    expect(_id).toBe(firstTestUser._id.toHexString())
    expect(email).toBe(firstTestUser.email)
  })

  it('should return 401 if not authenticated', async () => {
    const { body } = await request(app)
      .get('/users/me')
      .expect(401)
    
    expect(body).toEqual({})
  })
})

describe('POST /users', () => {
  it('should create a user', async () => {
    const email = 'newemail@example.com'
    const password = '123abc'

    const response = await request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)

    const { header, body } = response

    expect(header['x-auth']).toExist()
    expect(body._id).toExist()
    expect(body.email).toBe(email)

    const user = await User.findOne({email})
    expect(user).toExist()
    expect(user.password).toNotBe(password)
  })

  it('should return validation errors if request invalid', async () => {
    const email = 'invalidEmail.com'
    const password = 'less6'

    const response = await request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
  })

  it('should not create user if email in use', async () => {
    const email = firstTestUser.email
    const password = '123abc'

    const response = await request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: secondTestUser.email,
        password: secondTestUser.password
      })
      .expect(200)
    
    const { header } = response
    expect(header['x-auth']).toExist()

    const user = await User.findById(secondTestUser._id)
    expect(user.tokens[1]).toInclude({
      access: 'auth',
      token: header['x-auth']
    })
  })

  it('should reject invalid login', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: secondTestUser.email,
        password: 'invalidpw'
      })
      .expect(400)

    const { header } = response
    expect(header['x-auth']).toNotExist()

    const user = await User.findById(secondTestUser._id)
    expect(user.tokens.length).toBe(1)
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', async () => {
    const { _id, tokens: [{token}] } = firstTestUser

    await request(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)

    const user = await User.findById(_id)
    expect(user.tokens.length).toBe(0)
  })
})

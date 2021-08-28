const app = require('../app');

const mongoose = require('mongoose');
const supertest = require('supertest');
const api = supertest(app);
const bcrypt = require('bcrypt');
const Blog = require('../models/blog');
const User = require('../models/user');

const helper = require('./test_helper.js');

const nInitialBlogs = 4;
const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
];

let loggedInUser = {};

beforeEach(async () => {
  // Create one user and get their token
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('root', 10);
  const userObj = new User({
    username: 'root', name: 'root', passwordHash,
    _id: '6126323c3eb3228da4f37b88'
  });
  await userObj.save();

  const loginResponse = await api
    .post('/api/login')
    .send({username: 'root', password: 'root'});

  loggedInUser = loginResponse.body;

  // Initialize blogs with the one user
  await Blog.deleteMany({});

  for(let i = 0; i < nInitialBlogs; i++){
    let blogObj = new Blog(initialBlogs[i]);
    blogObj.user = userObj._id;
    await blogObj.save();
  }
});

test('correct number of blogs is returned', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body).toHaveLength(nInitialBlogs);
});

test('the unique identifier is called id', async () => {
  const response = await api
    .get('/api/blogs/' + initialBlogs[0]._id)
    .expect(200);

  expect(response.body.id).toBeDefined();
  expect(response.body._id).toBe(undefined);
});

describe('Post new', () => {
  test('blog', async () => {
    const newBlog = initialBlogs[initialBlogs.length - 1];

    await api.post('/api/blogs')
      .set('Authorization', 'bearer ' + loggedInUser.token)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(await helper.blogsInDb()).toHaveLength(nInitialBlogs + 1);
  });

  test('blog without likes', async () => {
    const newBlog = {
      title: 'Testing',
      author: 'Roni',
      url: 'www.roni.test',
    };

    const response = await api.post('/api/blogs')
      .send(newBlog)
      .set('Authorization', 'bearer ' + loggedInUser.token)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.likes).toEqual(0);
  });

  test('blog without title', async () => {
    const newBlog = {
      author: 'Roni',
      url: 'www.roni.test',
    };

    await api.post('/api/blogs')
      .set('Authorization', 'bearer ' + loggedInUser.token)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('blog without url', async () => {
    const newBlog = {
      title: 'test',
      author: 'Roni'
    };

    await api.post('/api/blogs')
      .set('Authorization', 'bearer ' + loggedInUser.token)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('blog without authorization', async () => {
    const newBlog = initialBlogs[initialBlogs.length - 1];

    await api.post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

describe('Expansions', () => {
  test('delete blog', async () => {
    await api
      .delete('/api/blogs/' + initialBlogs[0]._id)
      .set('Authorization', 'bearer ' + loggedInUser.token)
      .expect(204);

    expect(await helper.blogsInDb()).toHaveLength(nInitialBlogs - 1);
  });

  test('update blog', async () => {
    const newLikes = 100;
    const newBlog = {
      likes: newLikes
    };

    const response = await api
      .put('/api/blogs/' + initialBlogs[0]._id)
      .set('Authorization', 'bearer ' + loggedInUser.token)
      .send(newBlog)
      .expect(200);

    expect(response.body.likes).toEqual(newLikes);
  });

  test('delete without login token', async () => {
    await api
      .delete('/api/blogs/' + initialBlogs[0]._id)
      .expect(401);

    expect(await helper.blogsInDb()).toHaveLength(nInitialBlogs);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
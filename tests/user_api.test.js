const app = require('../app');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const api = supertest(app);

const User = require('../models/user');

const helper = require('./test_helper.js');

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({username: 'root', name: 'Root Beer', passwordHash});

  await user.save();
});

describe('when there is initially one user in db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'admin',
      name: 'admin',
      password: '123123',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with a reserved username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'admin',
      password: '123123',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

describe.only('Creation fails when', () => {
  test('the username is less than three characters', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'ad',
      name: 'admin',
      password: '123123',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('is shorter than');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('the password is less than three characters', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'admin',
      name: 'admin',
      password: '12',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('must be at least');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});


afterAll(() => {
  mongoose.connection.close();
});
const { factory } = require('factory-girl');
const request = require('supertest');
require('../config/config');
const app = require('../../app');
const User = require('../../models/user');
// const { beforeAll } = require('@jest/globals');

beforeEach(async () => {
  await User.deleteMany({});
})

describe('POST /sign_up', () => {
  test('sign up success with valid data', async () => {
    let userParams = await factory.attrs('user');
    let res = await request(app).post('/api/v1/sign_up')
                                .send(userParams);
    let numberUser = await User.estimatedDocumentCount({});

    expect(res.status).toBe(201);
    expect(numberUser).toBe(1);
  })

  test('sign up failed with invalid data', async () => {
    let userParams = await factory.attrs('user');
    userParams['email'] = 'wrong email';
    userParams['idNumber'] = '12345dd6';
    let res = await request(app).post('/api/v1/sign_up')
                                .send(userParams);

    let numberUser = await User.estimatedDocumentCount({});
    expect(res.status).toBe(422);
    expect(res.body['errors']).toHaveProperty('email');
    expect(res.body['errors']).toHaveProperty('idNumber');
    expect(numberUser).toBe(0);
  })

  test('sign up failed with duplicated email', async () => {
    let user = await factory.create('user');
    let userParams = await factory.attrs('user');
    userParams['email'] = user.email;
    let res = await request(app).post('/api/v1/sign_up')
                                .send(userParams);

    let numberUser = await User.estimatedDocumentCount({});
    expect(res.status).toBe(422);
    expect(numberUser).toBe(1);
  })

  test('sign up success with duplicated email but difference type', async () => {
    let socialUser = await factory.create('user', { type: 'social' });
    let userParams = await factory.attrs('user');
    userParams['email'] = socialUser.email;
    userParams['type'] = 'normal';
    let res = await request(app).post('/api/v1/sign_up')
                                .send(userParams);

    let numberUser = await User.estimatedDocumentCount({});
    expect(res.status).toBe(201);
    expect(numberUser).toBe(2);
  })
})

describe('POST /sign_in', () => {
  test('valid email and password', async () => {
    let user = await factory.create('user');
    let params = { email: user.email, password: 'Aa@123456' }
    let res = await request(app).post('/api/v1/sign_in')
                                .send(params);

    expect(res.status).toBe(200);
    expect(res.body['message']).toBe('login successfull');
    expect(res.body).toHaveProperty('accessToken');
  })

  test('invalid email or password', async () => {
    let res = await request(app).post('/api/v1/sign_in')
                                .send({ email: 'wrong', password: 'wrong' });

    expect(res.status).toBe(401);
  })
})

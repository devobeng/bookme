import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
  });

  it('should login a user', async () => {
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});

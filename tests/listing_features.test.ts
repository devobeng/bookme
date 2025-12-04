import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import Listing from '../src/models/Listing';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Listing.deleteMany({});
});

describe('Listing Features', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Create a host user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Host User',
        email: 'host@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'host'
      });
    
    token = userRes.body.token;
    userId = userRes.body.data.user._id;
  });

  it('should create a listing with full details', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Beautiful Beach House',
        description: 'Amazing view of the ocean',
        price: 200,
        category: 'beach',
        propertyType: 'entire-home',
        guestCapacity: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522], // Los Angeles
          address: '123 Ocean Dr, LA'
        },
        amenities: ['wifi', 'kitchen']
      });

    expect(res.status).toBe(201);
    expect(res.body.data.listing.title).toBe('Beautiful Beach House');
    expect(res.body.data.listing.location.type).toBe('Point');
  });

  it('should filter listings by price and category', async () => {
    // Create two listings
    await Listing.create({
      title: 'Cheap Room',
      description: 'Small room',
      price: 50,
      category: 'rooms',
      propertyType: 'private-room',
      guestCapacity: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      host: userId,
      location: { type: 'Point', coordinates: [0, 0], address: 'Test' }
    });

    await Listing.create({
      title: 'Luxury Villa',
      description: 'Big house',
      price: 500,
      category: 'beach',
      propertyType: 'entire-home',
      guestCapacity: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      host: userId,
      location: { type: 'Point', coordinates: [0, 0], address: 'Test' }
    });

    // Filter by category=rooms
    const resCategory = await request(app).get('/api/v1/listings?category=rooms');
    expect(resCategory.status).toBe(200);
    expect(resCategory.body.results).toBe(1);
    expect(resCategory.body.data.listings[0].title).toBe('Cheap Room');

    // Filter by price < 100
    const resPrice = await request(app).get('/api/v1/listings?price[lt]=100');
    expect(resPrice.status).toBe(200);
    expect(resPrice.body.results).toBe(1);
    expect(resPrice.body.data.listings[0].title).toBe('Cheap Room');
  });

  it('should sort listings', async () => {
    await Listing.create({
      title: 'A Listing',
      description: 'Desc',
      price: 100,
      category: 'rooms',
      propertyType: 'private-room',
      guestCapacity: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      host: userId,
      location: { type: 'Point', coordinates: [0, 0], address: 'Test' },
      ratingsAverage: 4.5
    });

    await Listing.create({
      title: 'B Listing',
      description: 'Desc',
      price: 200,
      category: 'rooms',
      propertyType: 'private-room',
      guestCapacity: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      host: userId,
      location: { type: 'Point', coordinates: [0, 0], address: 'Test' },
      ratingsAverage: 4.8
    });

    // Sort by price desc
    const resSort = await request(app).get('/api/v1/listings?sort=-price');
    expect(resSort.body.data.listings[0].price).toBe(200);
  });
});

// packages/api/tests/blog.test.ts
import request from 'supertest';
import app from '../src/app';
import { connectToDB, disconnectFromDB } from '../src/database/mongo';
import { Outbox } from '../src/models/outbox.model';
import { Blog } from '../src/models/blog.model';
import { User } from '../src/models/user.model';
import mongoose from 'mongoose';

describe('Blog Interactions', () => {
  let token: string;
  let userId: string;
  let blogId: string;

  beforeAll(async () => {
    await connectToDB(); // Connect to test DB (e.g., MongoMemoryServer)
  });

  afterAll(async () => {
    await disconnectFromDB();
  });

  beforeEach(async () => {
    // Clear collections and create a user and a blog for testing
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Outbox.deleteMany({});

    const user = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    // In a real scenario, you'd need to bypass email verification for tests or mock it
    await User.updateOne({ email: 'test@example.com' }, { isVerified: true });

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    token = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user._id;

    const blog = await Blog.create({
      title: 'Test Blog',
      content: 'This is some test content that is long enough.',
      author: new mongoose.Types.ObjectId(userId),
      status: 'published',
    });
    blogId = (blog._id as string).toString();
  });

  it('POST /blogs/:id/like should create an outbox event', async () => {
    const res = await request(app).post(`/api/v1/blogs/${blogId}/like`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Like event queued');

    const outboxEvent = await Outbox.findOne({ 'payload.blogId': blogId });
    expect(outboxEvent).not.toBeNull();
    expect(outboxEvent?.topic).toBe('interactions.events');
    expect(outboxEvent?.payload.type).toBe('LIKE');
    expect(outboxEvent?.payload.userId).toBe(userId);
  });
});

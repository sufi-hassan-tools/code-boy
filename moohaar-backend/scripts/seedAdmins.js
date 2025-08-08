import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/user.model.js';

const accounts = [
  { email: 'sufimarketing@outlook.com', password: 'ChangeMe123!' },
  { email: 'sufimarketing.pk@gmail.com', password: 'ChangeMe123!' },
];

async function seedAdmins() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    for (const { email, password } of accounts) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`Admin user already exists: ${email}`);
        continue;
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({ email, passwordHash, role: 'admin' });
      console.log(`Admin user created: ${email} / Password: ${password}`);
    }
  } catch (err) {
    console.error('Error seeding admin users:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmins();

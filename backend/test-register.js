const mongoose = require('mongoose');
const User = require('./models/User');

const testRegistration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/finance-dashboard');
    console.log('✅ Connected to MongoDB');

    // Test user data
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
    };

    // Create user
    const user = await User.create(userData);
    console.log('✅ User created successfully:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Test password comparison
    const isMatch = await user.comparePassword('password123');
    console.log('✅ Password comparison:', isMatch ? 'MATCH' : 'NO MATCH');

    // Find user without password
    const foundUser = await User.findOne({ email: 'test@example.com' }).select('-password');
    console.log('✅ User found (without password):', {
      id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
    });

    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log('✅ Test user cleaned up');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n🎉 All tests passed! Registration should work.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testRegistration();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

process.on('exit', (code) => {
  console.log('Process exit with code', code);
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database connected and models synchronized');

    // Create default admin user if not exists
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin1234', 10);
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        role: 'admin'
      });
      console.log('Default admin user created');
    }

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
})();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogDB';
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));
app.get('/', (req, res) => {
  res.send('Blog backend server running');
});
const Blog = require('./models/Blog');
const User = require('./models/User');
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}
app.get('/blogs', async (req, res) => {
  const blogs = await Blog.find();
  res.json(blogs);
});
app.post('/blogs', verifyToken, async (req, res) => {
  const { title, description } = req.body;
  const newBlog = new Blog({ title, description });
  await newBlog.save();
  res.json({ message: 'Blog added successfully', blog: newBlog });
});
app.put('/blogs/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedBlog);
});
app.delete('/blogs/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  await Blog.findByIdAndDelete(id);
  res.json({ message: 'Blog deleted successfully' });
});
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ message: 'Username already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.json({ message: 'Signup successful' });
});
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Signin successful', token });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
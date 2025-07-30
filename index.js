const express = require('express');
const app = express();
const userRoutes = require('./routes/user');

app.use(express.json());
app.use('/api/user', userRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

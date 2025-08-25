const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const eatingHistoryRoutes = require('./src/routes/eatingHistoryRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');
const rankingRoutes = require('./src/routes/rankingRoutes');
const inquiryRoutes = require('./src/routes/inquiryRoutes');

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/eating-history', eatingHistoryRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

require('./src//utils/scheduler'); // 스케줄러 미들웨어

const sslOptions = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert')
};

https.createServer(sslOptions, app).listen(3000, () => {
  console.log('HTTPS Server running on port 3000');
});


// http.createServer((req, res) => {
//   res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
//   res.end();
// }).listen(80);

// ^ http->https 리다이렉트 코드(주석 처리됨, 필요시 사용 가능)
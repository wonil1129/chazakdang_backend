const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const userRoutes = require('./src/routes/userRoutes');
const rankingRoutes = require('./src/routes/rankingRoutes');
const boardRoutes = require('./src/routes/boardRoutes');

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/user', userRoutes);
app.use('/api/ranking', rankingRoutes);
app.user('/api/board', boardRoutes);

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
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { mysql } = require('./db/mysql');

const port = 5000;
app.use(cors());
app.use(express.json());
app.use('/section', require('./routes/section'));
app.use('/student', require('./routes/student'));
app.use('/teacher', require('./routes/teacher'));
app.use('/classroom', require('./routes/classroom'));
app.use('/material', require('./routes/material'));
app.use('/event', require('./routes/event'));
app.use('./feedback', require('./routes/feedback'));
app.use('/announcement', require('./routes/announcement'));
app.use('/auth', require('./routes/auth'));

app.get('/test', (req, res) => res.json({ ok: true }));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

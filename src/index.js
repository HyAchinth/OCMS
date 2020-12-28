require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { mysql } = require('./db/mysql');

const port = 5000;
app.use(cors())
app.use(express.json());
app.use('/student', require('./routes/student'));
app.use('/teacher', require('./routes/teacher'));
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

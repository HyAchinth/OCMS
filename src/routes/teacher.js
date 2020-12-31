const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');
const generateAuthToken = require('../token/generateAuthToken');
const { getBucket } = require('../db/mongo');
const { get } = require('./auth');
const { Readable } = require('stream');

//Teacher Login

router.post('/login', async (req, res) => {
    try {
        const [
            results,
            fields,
        ] = await mysql.query(
            'SELECT emailid,pass FROM teacher WHERE emailid = ?',
            [req.body.emailid]
        );
        if (results.length == 0) {
            return res
                .status(400)
                .json({ ok: false, auth: false, msg: 'Authentication Error!' });
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = { emailid: user_data.emailid, userType: 'teacher' };
        const str = user_data.pass;
        const isMatch = await bcrypt.compare(req.body.pass, str);
        if (isMatch) {
            generateAuthToken(user, token => {
                res.json({ ok: true, auth: true, token });
            });
        } else {
            res.status(400).json({
                ok: true,
                auth: false,
                msg: 'Authentication Error!',
            });
        }
    } catch (error) {
        res.status(500).send('Server Error!');
        console.log(error);
    }
});

//change password

router.put('/login', auth('teacher'), async (req, res) => {
    try {
        const data = req.body;
        const salt = await bcrypt.genSalt(10);
        data.newpassword = await bcrypt.hash(data.newpassword, salt);

        let passwordHash = '';
        const [
            results,
        ] = await mysql.query('SELECT pass FROM teacher WHERE emailid = (?)', [
            data.emailid,
        ]);

        if (results.length === 0) {
            res.status(500).send({
                ok: false,
                msg: 'Invalid emailid. User does not exist',
            });
        } else {
            const teacherString = JSON.stringify(results[0]);
            const teacher = JSON.parse(teacherString);
            passwordHash = teacher.pass;
        }

        const isMatch = await bcrypt.compare(data.oldpassword, passwordHash);

        if (isMatch) {
            const [
                results2,
            ] = await mysql.query(
                'UPDATE teacher SET pass = (?) WHERE emailid = (?)',
                [data.newpassword, data.emailid]
            );
            res.json({ ok: true, msg: 'password updated' });
        } else {
            res.status(401).send({ ok: false, msg: 'Wrong password' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get all teachers

router.get('/', async (req, res) => {
    try {
        const [results] = await mysql.query(
            'SELECT teacherid,tname,emailid from teacher'
        );

        const teacherString = JSON.stringify(results);
        const teachers = JSON.parse(teacherString);
        res.json({ ok: true, teachers });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get all teachers by deptid

router.get('/dept/:deptid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT teacherid,tname,emailid from teacher where deptid = (?)',
            [data.deptid]
        );

        const teacherString = JSON.stringify(results);
        const teachers = JSON.parse(teacherString);
        res.json({ ok: true, teachers });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get one teacher by teacherid

router.get('/:teacherid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT teacherid,tname,emailid,deptid from teacher where teacherid = (?)',
            [data.teacherid]
        );

        if (results.length === 0) {
            res.send({ ok: true, teacher: {} });
        } else {
            const teacherString = JSON.stringify(results[0]);
            const teacher = JSON.parse(teacherString);
            res.json({ ok: true, teacher });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get one teacher by emailid

router.get('/email/:emailid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT teacherid,tname,emailid,deptid from teacher where emailid = (?)',
            [data.teacherid]
        );

        if (results.length === 0) {
            res.send({ ok: true, teacher: {} });
        } else {
            const teacherString = JSON.stringify(results[0]);
            const teacher = JSON.parse(teacherString);
            res.json({ ok: true, teacher });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//view the enrolled subjects

router.get(
    '/subjects/:emailid',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'select classname from teaches inner join classroom  on teaches.teacherid = ? and teaches.classid = classroom.classid',
                [req.params.teacherid]
            );
            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

// get teachers not assigned to class

router.get('/notassigned/:classid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query('SELECT * from teacher where teacherid NOT IN (select teacherid from teaches where classid = (?))', [
            data.classid,
        ]);
        if (results.length === 0) {
            res.json({ ok: true, teachers: [] });
        } else {
            const teacherString = JSON.stringify(results);
            const teachers = JSON.parse(teacherString);
            res.json({ ok: true, teachers });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;

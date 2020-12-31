const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');
const generateAuthToken = require('../token/generateAuthToken');
const { getBucket } = require('../db/mongo');
const { get } = require('./auth');
const { Readable } = require('stream');

//Student Login

router.post('/login', async (req, res) => {
    try {
        const [results, fields] = await mysql.query('SELECT emailid,studentpass FROM student WHERE emailid = ?', [
            req.body.emailid,
        ]);
        if (results.length == 0) {
            return res.status(400).json({ ok: false, auth: false, msg: 'Authentication Error!' });
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = { emailid: user_data.emailid, userType: 'student' };
        const str = user_data.studentpass;
        const isMatch = await bcrypt.compare(req.body.studentpass, str);
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

router.put('/login', auth('student'), async (req, res) => {
    try {
        const data = req.body;
        const salt = await bcrypt.genSalt(10);
        data.newpassword = await bcrypt.hash(data.newpassword, salt);

        let passwordHash = '';
        const [results] = await mysql.query('SELECT studentpass FROM student WHERE emailid = (?)', [data.emailid]);

        if (results.length === 0) {
            res.status(500).send({
                ok: false,
                msg: 'Invalid emailid. User does not exist',
            });
        } else {
            const studentString = JSON.stringify(results[0]);
            const student = JSON.parse(studentString);
            passwordHash = student.studentpass;
        }

        const isMatch = await bcrypt.compare(data.oldpassword, passwordHash);

        if (isMatch) {
            const [results2] = await mysql.query('UPDATE student SET studentpass = (?) WHERE emailid = (?)', [
                data.newpassword,
                data.emailid,
            ]);
            res.json({ ok: true, msg: 'password updated' });
        } else {
            res.status(401).send({ ok: false, msg: 'Wrong password' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get all students

router.get('/', async (req, res) => {
    try {
        const [results] = await mysql.query('SELECT usn, stname, emailid, yearno, semester, sectionid from student');

        const studentString = JSON.stringify(results);
        const students = JSON.parse(studentString);
        res.json({ ok: true, students });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get all students by deptid

router.get('/dept/:deptid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT usn, stname, emailid, yearno, semester, sectionid from student where deptid = (?)',
            [data.deptid]
        );

        const studentString = JSON.stringify(results);
        const students = JSON.parse(studentString);
        res.json({ ok: true, students });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get all students by sectionid

router.get('/section/:sectionid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT usn, stname, emailid, yearno, semester, sectionid from student where sectionid = (?)',
            [data.sectionid]
        );

        const studentString = JSON.stringify(results);
        const students = JSON.parse(studentString);
        res.json({ ok: true, students });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get one student by usn

router.get('/:usn', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT usn, stname, emailid, yearno, semester, deptid, sectionid from student where usn = (?)',
            [data.usn]
        );

        if (results.length === 0) {
            res.send({ ok: true, student: {} });
        } else {
            const studentString = JSON.stringify(results[0]);
            const student = JSON.parse(studentString);
            res.json({ ok: true, student });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Get one student by email id
router.get('/email/:emailid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query(
            'SELECT usn, stname, emailid, yearno, semester, deptid, sectionid from student where emailid = (?)',
            [data.emailid]
        );

        if (results.length === 0) {
            res.send({ ok: true, student: {} });
        } else {
            const studentString = JSON.stringify(results[0]);
            const student = JSON.parse(studentString);
            res.json({ ok: true, student });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//view students list

router.get(
    '/class/:id',
    /*auth('student'),*/ async (req, res) => {
        const [
            results,
            fields,
        ] = await mysql.query(
            'SELECT usn,stname,emailid FROM student as S WHERE EXISTS(SELECT * FROM attends where S.usn = usn AND classid=?)',
            [req.params.id]
        );
        res.json(results);
    }
);

//view the enrolled subjects

router.get('/subjects/:usn', async (req, res) => {
    try {
        const [
            results,
            fields,
        ] = await mysql.query(
            'select classroom.classid,classname from attends inner join classroom  on attends.usn = ? and attends.classid = classroom.classid',
            [req.params.usn]
        );
        res.json({ ok: true, results });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// get students not assigned to class

router.get('/notassigned/:classid', async (req, res) => {
    try {
        const data = req.params;

        const [
            results,
        ] = await mysql.query('SELECT * from student where usn NOT IN (select usn from attends where classid = (?))', [
            data.classid,
        ]);
        if (results.length === 0) {
            res.json({ ok: true, students: [] });
        } else {
            const studentString = JSON.stringify(results);
            const students = JSON.parse(studentString);
            res.json({ ok: true, students });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//add feedback

router.post(
    '/feedback',
    /*auth('student'),*/ async (req, res) => {
        const data = req.body;
        const [results] = await mysql.query('INSERT INTO feedback (usn,eventid,fback) values (?)', [
            [data.usn, data.eventid, data.fback],
        ]);
        res.json({ msg: 'feedback added' });
    }
);

module.exports = router;

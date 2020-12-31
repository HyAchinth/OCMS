const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');
const generateAuthToken = require('../token/generateAuthToken');
const generateEvent = require('./addevent');
const generate = require('nanoid/async/generate');

//Crete new department/admin

router.post('/department', async (req, res) => {
    try {
        const data = req.body;
        const [results] = await mysql.query('SELECT adminuser AS adminuser FROM department WHERE adminuser = ?', [
            data.adminuser,
        ]);
        if (results.length !== 0 && results[0].adminuser === data.adminuser) {
            return res.json({ msg: 'adminuser already registered!' });
        }
        const salt = await bcrypt.genSalt(10);
        data.adminpass = await bcrypt.hash(data.adminpass, salt);
        const [results2] = await mysql.query('INSERT INTO department (deptname,adminuser,adminpass) values (?)', [
            [data.deptname, data.adminuser, data.adminpass],
        ]);
        const user = { email: data.adminuser, userType: 'admin' };
        generateAuthToken(user, token => {
            res.json({ token });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// Get admin details

router.get('/department/:adminuser', auth('admin'), async (req, res) => {
    try {
        data = req.params;
        const [results, fields] = await mysql.query('SELECT * FROM department WHERE adminuser = ?', [data.adminuser]);
        const userString = JSON.stringify(results[0]);
        const user = JSON.parse(userString);
        delete user.adminpass;
        res.json({ ok: true, dept: user });
    } catch (error) {
        res.status(500).send('Server Error!');
        console.log(error);
    }
});

//Update admin details

router.put('/department', async (req, res) => {
    try {
        const data = req.body;
        const [results] = await mysql.query(
            'UPDATE department SET deptname = (?), adminuser = (?) where deptid = (?)',
            [data.deptname, data.adminuser, data.deptid]
        );
        res.json({ ok: true, msg: 'department updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/*
Admin Login
*/

router.post('/admin/login', async (req, res) => {
    try {
        const [results, fields] = await mysql.query('SELECT adminuser,adminpass FROM department WHERE adminuser = ?', [
            req.body.adminuser,
        ]);
        if (results.length == 0) {
            return res.status(400).json({ ok: false, auth: false, msg: 'Authentication Error!' });
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = { email: user_data.adminuser, userType: 'admin' };
        const isMatch = await bcrypt.compare(req.body.adminpass, user_data.adminpass);
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

//register student

router.post('/admin/student', auth('admin'), async (req, res) => {
    try {
        const data = req.body;
        data.usn = String(data.usn).toUpperCase();
        console.log(data);
        const [results] = await mysql.query('SELECT usn AS usn FROM student WHERE usn = ?', [data.usn]);
        if (results.length !== 0 && results[0].usn === data.usn) {
            return res.json({ msg: 'student already registered!' });
        }
        const salt = await bcrypt.genSalt(10);
        data.studentpass = await bcrypt.hash(data.studentpass, salt);
        const [
            results2,
        ] = await mysql.query(
            'INSERT INTO student (usn,stname,emailid,yearno,semester,studentpass,deptid,sectionid) VALUES (?)',
            [
                [
                    data.usn,
                    data.stname,
                    data.emailid,
                    data.yearno,
                    data.semester,
                    data.studentpass,
                    data.deptid,
                    data.sectionid,
                ],
            ]
        );

        res.json({ ok: true, msg: 'student added' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//update student

router.put('/admin/student', auth('admin'), async (req, res) => {
    try {
        const data = req.body;

        const [
            results2,
        ] = await mysql.query(
            'UPDATE student SET stname = (?),emailid = (?),yearno = (?),semester = (?),deptid = (?),sectionid=(?) WHERE usn = (?)',
            [data.stname, data.emailid, data.yearno, data.semester, data.deptid, data.sectionid, data.usn]
        );

        res.json({ ok: true, msg: 'student updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//delete student

router.delete('/admin/student/:usn', auth('admin'), async (req, res) => {
    try {
        const data = req.params;

        const [results2] = await mysql.query('DELETE from student where usn = (?)', [data.usn]);

        res.json({ ok: true, msg: 'student deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//register teacher

router.post('/admin/teacher', auth('admin'), async (req, res) => {
    try {
        const data = req.body;
        const [results] = await mysql.query('SELECT teacherid AS teacherid FROM teacher WHERE teacherid = ?', [
            data.teacherid,
        ]);
        if (results.length !== 0 && results[0].teacherid === data.teacherid) {
            return res.json({ msg: 'teacher already registered!' });
        }
        const salt = await bcrypt.genSalt(10);
        data.pass = await bcrypt.hash(data.pass, salt);
        const [results2] = await mysql.query('INSERT INTO teacher (teacherid,tname,emailid,pass,deptid) VALUES (?)', [
            [data.teacherid, data.tname, data.emailid, data.pass, data.deptid],
        ]);

        res.json({ msg: 'teacher added' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//update teacher

router.put('/admin/teacher', auth('admin'), async (req, res) => {
    try {
        const data = req.body;

        const [
            results2,
        ] = await mysql.query('UPDATE teacher SET tname = (?),emailid = (?),deptid = (?) WHERE  teacherid = (?)', [
            data.tname,
            data.emailid,
            data.deptid,
            data.teacherid,
        ]);

        res.json({ msg: 'teacher updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//delete teacher

router.delete('/admin/teacher/:teacherid', auth('admin'), async (req, res) => {
    try {
        const data = req.params;

        const [results2] = await mysql.query('DELETE from teacher where teacherid = (?)', [data.teacherid]);

        res.json({ ok: true, msg: 'teacher deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//add timetable

router.post('/admin/timetable', auth('admin'), async (req, res) => {
    const data = req.body;
    const [results, fields] = await mysql.query('INSERT INTO timetable (sectionid,yearno,semester,deptid) values (?)', [
        [data.sectionid, data.yearno, data.semester, data.deptid],
    ]);
    res.json({ msg: 'timetable added' });
});

//edit timetable

router.put('/admin/timetable', auth('admin'), async (req, res) => {
    try {
        const data = req.body;

        const [
            results2,
        ] = await mysql.query(
            'UPDATE timetable SET sectionid = (?),yearno = (?), semester = (?),deptid = (?) where sectionid=(?)',
            [data.sectionid, data.yearno, data.semester, data.deptid, data.sectionid]
        );

        res.json({ msg: 'timetable updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//delete section

router.delete('/admin/timetable/:sectionid', auth('admin'), async (req, res) => {
    try {
        const data = req.params;

        const [results2] = await mysql.query('DELETE from timetable where sectionid = (?)', [data.sectionid]);

        res.json({ ok: true, msg: 'timetable deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//create classroom

router.post('/admin/classroom', auth('admin'), async (req, res) => {
    const data = req.body;
    const [results, fields] = await mysql.query('INSERT INTO classroom (classid,classname) values (?)', [
        [data.classid, data.classname],
    ]);
    res.json({ msg: 'classroom added' });
});

//delete classroom

router.delete('/admin/classroom/:classid', auth('admin'), async (req, res) => {
    try {
        const data = req.params;

        const [results2] = await mysql.query('DELETE from classroom where classid = (?)', [data.classid]);

        res.json({ ok: true, msg: 'classroom deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//create teaches ( teacherid - classid)

router.post('/admin/teaches', auth('admin'), async (req, res) => {
    const data = req.body;
    const [results, fields] = await mysql.query('INSERT INTO teaches (teacherid,classid) values (?)', [
        [data.teacherid, data.classid],
    ]);
    res.json({ msg: 'teaches relation added' });
});

//create attends ( studentid - classid)

router.post('/admin/attends', auth('admin'), async (req, res) => {
    const data = req.body;
    const [results, fields] = await mysql.query('INSERT INTO attends (usn,classid) values (?)', [
        [data.usn, data.classid],
    ]);
    res.json({ msg: 'attends relation added' });
});

//create usestt (teacherid - sectionid)

router.post('/admin/usestt', auth('admin'), async (req, res) => {
    const data = req.body;
    const [results, fields] = await mysql.query('INSERT INTO usestt (teacherid,sectionid) values (?)', [
        [data.teacherid, data.sectionid],
    ]);
    res.json({ msg: 'usestt relation added' });
});

//create TESTING ENV

// router.post(
//     '/admin/events',
//     /*auth('admin'),*/ async (req, res) => {
//         const data = req.body;

//         const [
//             results,
//         ] = await mysql.query(
//             'select emailid as email from student inner join attends on student.usn = attends.usn and classid = (?)',
//             [[data.classid]]
//         );
//         const T = JSON.stringify(results);
//         desc = 'Teacher Name:' + results[0].tname;
//         console.log(data.dt.getTime(), data.dt.getDate());
//         res.json({ msg: 'event added' });
//     }
// );

//add event from admin
router.post(
    '/admin/event',
    /*auth('admin'),*/ async (req, res) => {
        const { sectionid, classid, summary, start, end, freq, count } = req.body;
        try {
            const eid = await generate('1234567890abcdef', 10);

            const [
                results,
            ] = await mysql.query(
                'select tname  from teacher inner join teaches on teacher.teacherid = teaches.teacherid and classid = (?)',
                [[classid]]
            );
            const desc = 'Teacher Name:' + results[0].tname;
            //console.log(desc);

            const [
                results2,
            ] = await mysql.query(
                'select emailid as email from student inner join attends on student.usn = attends.usn and classid = (?)',
                [[classid]]
            );
            //console.log(results2);
            const mails = JSON.stringify(results2);
            const emails = JSON.parse(mails);

            const link = await generateEvent(emails, eid, summary, desc, start, end, freq, count);
            ///console.log(link);
            const split = start.split('T');
            const split2 = end.split('T');
            const [
                results3,
            ] = await mysql.query(
                'INSERT INTO events (eventid,fromtime,totime,ondate,classid,sectionid,description,link) values (?)',
                [[eid, split[1].split('.')[0], split2[1].split('.')[0], split[0], classid, sectionid, summary, link]]
            );
            res.json({ msg: 'Event added' });
        } catch (e) {
            res.status(500).json({ msg: 'internal error', e });
            //console.log(e);
        }
    }
);

module.exports = router;

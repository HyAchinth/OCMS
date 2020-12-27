const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');
const generateAuthToken = require('../token/generateAuthToken');

//Crete new department/admin

router.post('/department', async (req, res) => {
    try {
        const data = req.body;
        const [
            results,
        ] = await mysql.query(
            'SELECT adminuser AS adminuser FROM department WHERE adminuser = ?',
            [data.adminuser]
        );
        if (results.length !== 0 && results[0].adminuser === data.adminuser) {
            return res.json({ msg: 'adminuser already registered!' });
        }
        const salt = await bcrypt.genSalt(10);
        data.adminpass = await bcrypt.hash(data.adminpass, salt);
        const [
            results2,
        ] = await mysql.query(
            'INSERT INTO department (deptname,adminuser,adminpass) values (?)',
            [[data.deptname, data.adminuser, data.adminpass]]
        );
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

router.get('/department', auth('admin'), async (req, res) => {
    try {
        const data = req.body;
        const [
            results,
            fields,
        ] = await mysql.query('SELECT * FROM department WHERE adminuser = ?', [
            data.adminuser,
        ]);
        const userString = JSON.stringify(results[0]);
        const user = JSON.parse(userString);
        delete user.adminpass;
        res.json(user);
    } catch (error) {
        res.status(500).send('Server Error!');
        console.log(error);
    }
});

/*
Admin Login
*/

router.post('/admin/login', async (req, res) => {
    try {
        const [
            results,
            fields,
        ] = await mysql.query(
            'SELECT adminuser,adminpass FROM department WHERE adminuser = ?',
            [req.body.adminuser]
        );
        if (results.length == 0) {
            return res.status(400).json({ msg: 'Authentication Error!' });
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = { email: user_data.adminuser, userType: 'admin' };
        const isMatch = await bcrypt.compare(
            req.body.adminpass,
            user_data.adminpass
        );
        if (isMatch) {
            generateAuthToken(user, token => {
                res.json({ token });
            });
        } else {
            res.status(400).json({ msg: 'Authentication Error!' });
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
        const [
            results,
        ] = await mysql.query('SELECT usn AS usn FROM student WHERE usn = ?', [
            data.usn,
        ]);
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

        res.json({ msg: 'student added' });
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
            'UPDATE student SET usn = (?),stname = (?),emailid = (?),yearno = (?),semester = (?),studentpass = (?),deptid = (?),sectionid=(?) WHERE usn = (?)',
            [
                data.usn,
                data.stname,
                data.emailid,
                data.yearno,
                data.semester,
                data.studentpass,
                data.deptid,
                data.sectionid,
                data.usn,
            ]
        );

        res.json({ msg: 'student updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//register teacher

router.post('/admin/teacher', auth('admin'), async (req, res) => {
    try {
        const data = req.body;
        const [
            results,
        ] = await mysql.query(
            'SELECT teacherid AS teacherid FROM teacher WHERE teacherid = ?',
            [data.teacherid]
        );
        if (results.length !== 0 && results[0].teacherid === data.teacherid) {
            return res.json({ msg: 'teacher already registered!' });
        }
        const salt = await bcrypt.genSalt(10);
        data.pass = await bcrypt.hash(data.pass, salt);
        const [
            results2,
        ] = await mysql.query(
            'INSERT INTO teacher (teacherid,tname,emailid,pass) VALUES (?)',
            [[data.teacherid, data.tname, data.emailid, data.pass]]
        );

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
        ] = await mysql.query(
            'UPDATE teacher SET teacherid = (?),tname = (?),emailid = (?),pass = (?) WHERE  teacherid = (?)',
            [
                data.teacherid,
                data.tname,
                data.emailid,
                data.pass,
                data.teacherid,
            ]
        );

        res.json({ msg: 'teacher updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//add timetable

router.post('/admin/timetable', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query(
        'INSERT INTO timetable (sectionid,yearno,semester,deptname,deptid) values (?)',
        [
            [
                data.sectionid,
                data.yearno,
                data.semester,
                data.department,
                data.deptid,
            ],
        ]
    );
    res.json({ msg: 'timetable added' });
});

//edit timetable

router.put('/admin/timetable', auth('admin'), async (req, res) => {
    try {
        const data = req.body;

        const [
            results2,
        ] = await mysql.query(
            'UPDATE timetable SET sectionid = (?),yearno = (?), semester = (?),deptname = (?),deptid = (?) where sectionid=(?)',
            [
                data.sectionid,
                data.yearno,
                data.semester,
                data.department,
                data.deptid,
                data.sectionid,
            ]
        );

        res.json({ msg: 'timetable updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//create follows table(student - section relation)

router.post('/admin/follows', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query('INSERT INTO follows (usn,sectionid) values (?)', [
        [data.usn, data.sectionid],
    ]);
    res.json({ msg: 'follows entry added' });
});

//create faculty of(teacher - department relation)

router.post('/admin/facultyof', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query(
        'INSERT INTO facultyof (teacherid,deptid) values (?)',
        [[data.teacherid, data.deptid]]
    );
    res.json({ msg: 'facultyof entry added' });
});

//create classroom

router.post('/admin/classroom', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query(
        'INSERT INTO classroom (classid,materials,announcements,classname) values (?)',
        [[data.classid, data.materials, data.announcements, data.classname]]
    );
    res.json({ msg: 'classroom added' });
});

//create teaches ( teacherid - classid)

router.post('/admin/teaches', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query(
        'INSERT INTO teaches (teacherid,classid) values (?)',
        [[data.teacherid, data.classid]]
    );
    res.json({ msg: 'teaches relation added' });
});

//create attends ( studentid - classid)

router.post('/admin/attends', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query('INSERT INTO attends (usn,classid) values (?)', [
        [data.usn, data.classid],
    ]);
    res.json({ msg: 'attends relation added' });
});

//create events

router.post('/admin/events', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query(
        'INSERT INTO events (eventid,fromtime,totime,ondate,link,feedback,classid,sectionid) values (?)',
        [
            [
                data.eventid,
                data.fromtime,
                data.totime,
                data.ondate,
                data.link,
                data.feedback,
                data.classid,
                data.sectionid,
            ],
        ]
    );
    res.json({ msg: 'event added' });
});

//create usestt (teacherid - sectionid)

router.post('/admin/usestt', auth('admin'), async (req, res) => {
    const data = req.body;
    const [
        results,
        fields,
    ] = await mysql.query(
        'INSERT INTO usestt (teacherid,sectionid) values (?)',
        [[data.teacherid, data.sectionid]]
    );
    res.json({ msg: 'usestt relation added' });
});

module.exports = router;

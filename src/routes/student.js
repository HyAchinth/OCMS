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
        const [
            results,
            fields,
        ] = await mysql.query(
            'SELECT usn,studentpass FROM student WHERE usn = ?',
            [req.body.usn]
        );
        if (results.length == 0) {
            return res.status(400).json({ msg: 'Authentication Error!' });
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = { usn: user_data.usn, userType: 'student' };
        const str = user_data.studentpass;
        const isMatch = str.localeCompare(req.body.studentpass);
        if (!isMatch) {
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

//change password

router.put('/login', auth('student'), async (req, res) => {
    try {
        const data = req.body;

        const [
            results2,
        ] = await mysql.query(
            'UPDATE student SET studentpass = (?) WHERE usn = (?)',
            [data.studentpass, data.usn]
        );

        res.json({ msg: 'password updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Download Material

router.get(
    '/material/:id',
    /*auth('student'),*/ async (req, res) => {
        const materialid = req.params.id;
        try {
            const result = await downloader(materialid);
            res.json({ result });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

async function downloader(id) {
    const bucket = await getBucket();
    return new Promise((res, rej) => {
        let data = Buffer.from([]);

        bucket
            .openDownloadStreamByName(id.toString())
            .on('data', d => {
                // data.push(d);
                // data.
                data = Buffer.concat([data, d]);
            })
            .on('error', e => {
                // console.log(e);
                rej(e);
            })
            .on('end', () => {
                //console.log('i>Read stats', data.length, size);
                res(data);
            });
    });
}

//view students list

router.get(
    '/studentlist/:id',
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

//view materials list

router.get(
    '/materiallist/:id',
    /*auth('student'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'SELECT materialname FROM material WHERE classid=?',
                [req.params.id]
            );
            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//view announcements list

router.get(
    '/announcementlist/:id',
    /*auth('student'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'SELECT announcement,dtime FROM announcements WHERE classid=?',
                [req.params.id]
            );
            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//view the enrolled subjects

router.post(
    '/subjects',
    /*auth('student'),*/ async (req, res) => {
        try {
            const [
                results,
                fields,
            ] = await mysql.query(
                'select classname from attends inner join classroom  on attends.usn = ? and attends.classid = classroom.classid',
                [req.body.usn]
            );
            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

module.exports = router;

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
            'SELECT teacherid,pass FROM teacher WHERE teacherid = ?',
            [req.body.teacherid]
        );
        if (results.length == 0) {
            return res.status(400).json({ msg: 'Authentication Error!' });
        }
        const userString = JSON.stringify(results[0]);
        const user_data = JSON.parse(userString);
        const user = { teacherid: user_data.teacherid, userType: 'teacher' };
        const str = user_data.pass;
        const isMatch = str.localeCompare(req.body.pass);
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

router.put('/login', auth('teacher'), async (req, res) => {
    try {
        const data = req.body;

        const [
            results2,
        ] = await mysql.query(
            'UPDATE teacher SET pass = (?) WHERE teacherid = (?)',
            [data.pass, data.teacherid]
        );

        res.json({ msg: 'password updated' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/*upload material as teacher
expected filename,classid,file as array
*/

router.post(
    '/material',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const { materialname, classid, file } = req.body;
            const [
                results,
            ] = await mysql.query(
                'INSERT INTO material (materialname,classid) VALUES (?)',
                [[materialname, classid]]
            );
            const id = results.insertId.toString();
            console.log('Calling uploader');
            const ans = await uploader(id, file);
            res.json({ Response: 'File Uploaded' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

async function uploader(id, file) {
    const bucket = await getBucket();
    const buffer = Buffer.from(file);
    console.log('Calling promise');
    return new Promise((resolve, reject) => {
        //convert buffer to readable stream and feed it into the bucket upload stream
        // reject on error otherwise move to the next part
        Readable.from(buffer)
            .pipe(bucket.openUploadStream(id))
            .on('error', error => {
                console.log('W>write error', error);
                reject(error);
            })
            .on('finish', () => {
                console.log('finished');
                resolve(true);
            });
    });
}
//get material

router.get(
    '/material/:id',
    /*auth('teacher'),*/ async (req, res) => {
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

//add announcements

router.post(
    '/announcements',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const { classid, announcement, dtime } = req.body;
            const [
                results,
            ] = await mysql.query(
                'INSERT INTO announcements (classid, announcement, dtime) VALUES (?)',
                [[classid, announcement, dtime]]
            );
            res.json({ Response: 'Announcement added' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//delete announcements

router.delete(
    '/announcements/:id',
    /*auth('teacher'),*/ async (req, res) => {
        const aid = req.params.id;
        console.log(aid);
        try {
            const [
                result,
            ] = await mysql.query('DELETE FROM announcements where aid = (?)', [
                [aid],
            ]);
            res.json({ msg: 'deleted' });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

//view students list

router.get(
    '/studentlist/:id',
    /*auth('teacher'),*/ async (req, res) => {
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
    /*auth('teacher'),*/ async (req, res) => {
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
    /*auth('teacher'),*/ async (req, res) => {
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

module.exports = router;

const express = require('express');
const router = express.Router();
const { mysql } = require('../db/mysql');
const auth = require('../middleware/auth');
const { getBucket } = require('../db/mongo');
const { get } = require('./auth');
const { Readable } = require('stream');

/*upload material as teacher
expected filename,classid,file as array
*/

router.post('/', auth('teacher'), async (req, res) => {
    try {
        const { materialname, classid, filetype, file } = req.body;
        const [results] = await mysql.query('INSERT INTO material (materialname,classid,filetype) VALUES (?)', [
            [materialname, classid, filetype],
        ]);
        const id = results.insertId.toString();
        const ans = await uploader(id, file);
        res.json({ Response: 'File Uploaded' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

async function uploader(id, file) {
    const bucket = await getBucket();
    const buffer = Buffer.from(file);
    return new Promise((resolve, reject) => {
        //convert buffer to readable stream and feed it into the bucket upload stream
        // reject on error otherwise move to the next part
        Readable.from(buffer)
            .pipe(bucket.openUploadStream(id))
            .on('error', error => {
                console.error('W>write error', error);
                reject(error);
            })
            .on('finish', () => {
                resolve(true);
            });
    });
}

//delete announcements

router.delete('/:id', auth('teacher'), async (req, res) => {
    const materialid = req.params.id;
    console.log(materialid);
    try {
        const [result] = await mysql.query('DELETE FROM material where materialid = (?)', [[materialid]]);
        res.json({ msg: 'deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get material

router.get(
    '/:id',
    /*auth('teacher'),*/ async (req, res) => {
        const materialid = req.params.id;
        try {
            const result = await downloader(materialid);
            const [result2] = await mysql.query('select filetype from material where materialid = (?)', [materialid]);
            res.json({ file: result, ...result2[0] });
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

//get all materials

router.get('/', async (req, res) => {
    try {
        const [results, fields] = await mysql.query('SELECT materialid,materialname FROM material');
        res.json({ results });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//view materials list

router.get(
    '/class/:id',
    /*auth('teacher'),*/ async (req, res) => {
        try {
            const [results, fields] = await mysql.query(
                'SELECT materialid,materialname FROM material WHERE classid=?',
                [req.params.id]
            );
            res.json({ results });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
);

module.exports = router;

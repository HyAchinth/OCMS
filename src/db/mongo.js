const { GridFSBucket, MongoClient } = require('mongodb');

const mongos = new MongoClient(
    `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.khh7t.mongodb.net/testmaterial?retryWrites=true&w=majority`,
    {
        maxPoolSize: 15,
        useUnifiedTopology: true,
    }
);

let mongoclient = null;

/**
 * Connect to mongodb and get db
 * @returns database
 */
async function mdb(dbname = 'testmaterial') {
    // if (!mongos.isConnected) {
    //     console.log('I>connecting');
    //     mongoclient = await mongos.connect();

    //     return m
    // }
    if (!mongoclient || !mongoclient.isConnected) {
        mongoclient = await mongos.connect();
    }

    return mongoclient.db(dbname);
    // const conn = await mongos.connect();
    // return conn.db('test');
}

async function getBucket() {
    const db = await mdb();
    return new GridFSBucket(db);
}
module.exports = { mdb, getBucket, mongos };

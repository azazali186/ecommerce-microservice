import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'tensorflow-training';
export let db;

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Connected successfully to MongoDB server");
    db = client.db(dbName);
});

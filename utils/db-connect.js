const { MongoClient, ServerApiVersion } = require('mongodb');
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
const mongoConnectionString = process.env.MONGOCONNECTIONURI;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDB,
    password: process.env.PGPW,
    port: process.env.PGPORT
})

const uri = mongoConnectionString;

const mClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

module.exports.mongoClient = mClient;

module.exports.pgPool = pool;

module.exports.dbConnect = async () => {
    
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await mClient.connect();

        // console.log(mClient);
        // Send a ping to confirm a successful connection
        await mClient.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
      }
}

module.exports.pgConnect = async () => {
    const client = await pool.connect();
    try {
        console.log(`Connected to Postgres DB`);
        const res = await client.query('SELECT * FROM Resources');
        console.log("Test query ran.")
    } catch (error) {
        console.log(error)
    } finally {
        client.release();
    }
}
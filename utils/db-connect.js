const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
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

module.exports.dbConnect = async () => {
    try {
      mongoose.set('strictQuery', false);
      mongoose.connect(mongoConnectionString);

      const db = mongoose.connection;
      db.on("error", console.error.bind(console, "connection error:"));
      db.once("open", () => {
          console.log("Pinged your deployment. You successfully connected to MongoDB!");
      });
    }
    catch(err){
      console.log(err);
      req.flash('error', 'An error has occurred. Unable to delete resource.');
      res.redirect('/catalogue');
    }
}

module.exports.pgPool = pool;

module.exports.pgConnect = async () => {
    const client = await pool.connect();
    try {
        console.log(`Connected to Postgres DB`);
        const res = await client.query('SELECT * FROM Resources');
        console.log("Test query ran.")
    } catch (error) {
        console.log(error)
    } finally {
        client.release(true);
    }
}
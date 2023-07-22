const Resource = require('../models/resource');
const date = new Date();
const { pgPool } = require('../utils/db-connect');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { s3client } = require('../aws');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

function addProductToStripe(resource, id) {
    stripe.products.create({
        id: id,
        name: resource.name,
        description: resource.description,
        images: [resource.image],
      });
}

function deleteFromAWSS3Bucket(image, file) {
    const deleteImageObject = {
        Bucket: "mercatus-test", // required
        Key: image, // required
    };

    const deleteFileObject = {
        Bucket: "mercatus-test", // required
        Key: file, // required
    };

    const imageDeleteCommand = new DeleteObjectCommand(deleteImageObject);
    const fileDeleteCommand = new DeleteObjectCommand(deleteFileObject);
    const imageDeleteResponse = s3client.send(imageDeleteCommand);
    const fileDeleteResponse = s3client.send(fileDeleteCommand);

    const finalResponse = {
        imageResponse: imageDeleteResponse,
        fileResponse: fileDeleteResponse,
    }

    return finalResponse;
}

module.exports.catalogue = async (req, res) => {
    // const { subject } = req.query;
    const { subject, level } = req.query;
    const client = await pgPool.connect();
    try {
        const values = [subject, level];

        // if(level){
        //     res.send(level);
        // } else if(subject){
        //     res.send(subject);
        // } else 
        // if(level && subject){
        //     res.send(`${level} and ${subject}` )
        // } else if(subject){ 

        // } else{
        //     const query = "SELECT * FROM Resources;"
        //     await client.query(query, (err, result) => {
        //         if (err) {
        //           throw err
        //         }

        //         resources = result.rows;
        //         res.render('resources/catalogue', { resources, subject: 'All' });
        //     });
        // }

        if(subject){
            const query = "SELECT * FROM Resources WHERE subject=$1;"
            await client.query(query, values, (err, result) => {
                if (err) {
                  throw err
                }
                console.log("Subject queried");
                resources = result.rows;
                res.render('resources/catalogue', { resources, subject });
            });
        } else{
            const query = "SELECT * FROM Resources;"
            await client.query(query, (err, result) => {
                if (err) {
                  throw err
                }

                resources = result.rows;
                res.render('resources/catalogue', { resources, subject: 'All' });
            });

        }
    } catch(err){
        console.log(err);
        req.flash('error', 'An error has occurred. Unable to locate resources.');
        res.redirect('/catalogue');
    } finally{
        client.release();
    }
}

module.exports.createResouce = async (req, res, next) => {
    console.log("Creating Resource");
    const resource = new Resource(req.body.resource);
    resource.image = req.files.image[0].location;
    resource.file = req.files.material[0].location;
    const id = resource._id.valueOf();
    const author = req.session.passport.user;
    const client = await pgPool.connect();
    const query = `INSERT INTO Resources(resourceid, name, image, price, description, subject, file, author) VALUES('${id}', '${resource.name}', '${resource.image}', ${resource.price}, '${resource.description}', '${resource.subject}', '${resource.file}' , '${author}');`;

    try{
        await addProductToStripe(resource, id);
        await client.query(query, (err, result) => {
            if (err) {
              throw err
            }    
        });
        req.flash('success', 'New resource has been successfully created.');
        res.redirect(`/catalogue/${id}`);
        console.log(date);
    } catch(err){
        console.log(err);
        req.flash('error', 'An error has occurred. Unable to create resource.');
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
    
}

//If setting req.body property to be a single name (resource in this case), must not forget the name+square brackets
//in EJS template for forms with POST requests.

module.exports.renderNewForm = (req, res) => {
    res.render('resources/new');
}

module.exports.showResource = async (req, res) => {
    const { id } = req.params;
    const client = await pgPool.connect();

    try{
        const result = await client.query({
            rowMode: "array",
            text: `SELECT * FROM Resources WHERE resourceid='${id}';`
        })

        const resource = {
            resourceid: id,
            name: result.rows[0][1],
            price: result.rows[0][2],
            description: result.rows[0][3],
            subject: result.rows[0][4],
            image: result.rows[0][5],
            author: result.rows[0][7]
        }
        
        res.render('resources/resource', { resource, msg: req.flash("success") });

    } catch(err){
        console.log(err);
        req.flash('error', 'An error has occurred. Unable to locate resource.');
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
}

module.exports.editResource = async (req, res) => {
    const { id } = req.params;
    const client = await pgPool.connect();
    const resource = { ...req.body.resource }
    const values = [id];

    try{
        const query = `UPDATE resources SET name='${resource.name}', price=${resource.price}, subject='${resource.subject}', image='${resource.image}', description='${resource.description}' WHERE resourceid=$1;`
        await client.query(query, values, (err, result) => {
            if (err) {
                throw err
            }

        });
        req.flash('success', 'Successfully updated resource.');
        res.redirect(`/catalogue/${id}`);
    } catch(err){
        console.log(err);
        req.flash('error', 'An error has occurred. Unable to update resource.');
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
    
}

module.exports.deleteResource = async (req, res) => {
    const { id } = req.params;
    const client = await pgPool.connect();
    const values = [id];

    try{
        const result = await client.query({
            rowMode: "array",
            text: `SELECT image,file FROM Resources WHERE resourceid='${id}';`
        })

        const image = result.rows[0][0];
        const file  = result.rows[0][1];
        imageKey = image.replace("https://mercatus-test.s3.ap-southeast-1.amazonaws.com/", "")
        fileKey = file.replaceAll("https://mercatus-test.s3.ap-southeast-1.amazonaws.com/", "").replaceAll(/%20/g, " ");
        deleteResponse = await deleteFromAWSS3Bucket(imageKey, fileKey);

        console.log(deleteResponse);
        
        const query = "DELETE FROM resources WHERE resourceid=$1;"

        await client.query(query, values, (err, result) => {
            if (err) {
                throw err
            }
            
            if (!id) {
                req.flash('error', 'Cannot find that resource!');
            }
        });
        req.flash('success', 'Successfully deleted resource.');
        res.redirect(`/catalogue`);
    } catch(err){
        console.log(err);
        req.flash('error', 'An error has occurred. Unable to delete resource.');
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const client = await pgPool.connect();
    const values = [id];

    try{
        const query = "SELECT * FROM Resources WHERE resourceid=$1;"
        await client.query(query, values, (err, result) => {
            if (err) {
                throw err
            }
            const resource = result.rows[0];

            res.render('resources/edit', { resource });
            
            if (!resource) {
                req.flash('error', 'Cannot find that resource!');
                return res.redirect('/catalogue');
            }
        });
        // res.render('resources/edit', { resource });
    } catch (err){
        console.log(err);
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
    
}
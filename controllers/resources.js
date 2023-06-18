const Resource = require('../models/resource');
const date = new Date();
const { pgPool } = require('../utils/db-connect');

module.exports.catalogue = async (req, res) => {
    const { subject } = req.query;
    const client = await pgPool.connect();
    try {
        const values = [subject];

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
            // Don't return query result or the page load will slow down.
            // const resources = await Resource.find({ subject })
            // res.render('resources/catalogue', { resources, subject });
        } else{
            const query = "SELECT * FROM Resources;"
            await client.query(query, (err, result) => {
                if (err) {
                  throw err
                }

                resources = result.rows;
                res.render('resources/catalogue', { resources, subject: 'All' });
            });
            // const resources = await Resource.find({})
        }
    } catch(err){
        console.log(err);
        // req.flash('error', 'An error has occurred. Unable to locate resources.');
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
}

module.exports.createResouce = async (req, res, next) => {
    
    console.log(date);
    console.log("Creating Resource");
    const resource = new Resource(req.body.resource);
    resource.image = req.files.image[0].location;
    resource.file = req.files.material[0].location;
    const id = resource._id.valueOf();
    const client = await pgPool.connect();
    const query = `INSERT INTO Resources(resourceid, name, image, price, description, subject) VALUES('${id}', '${resource.name}', '${resource.image}', ${resource.price}, '${resource.description}', '${resource.subject}');`;

    try{
        // console.log(req.files.image[0].location);
        // console.log(req.files.material[0].location);
        
        await client.query(query, (err, result) => {
            if (err) {
              throw err
            }    
        });
        // await resource.save();
        // req.flash('success', 'New resource has been successfully created.');
        res.redirect(`/catalogue/${id}`);
        console.log(date);
    } catch(err){
        console.log(err);
        // req.flash('error', 'An error has occurred. Unable to create resource.');
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
    const values = [id];

    // console.log(values);

    try{
        const query = "SELECT * FROM Resources WHERE resourceid=$1;"
        // const resource = await Resource.findById(id);
        await client.query(query, values, (err, result) => {
            if (err) {
                throw err
            }
            resource = result.rows[0];

            res.render('resources/resource', { resource });
            // res.render('resources/resource', { resource, msg: req.flash("success") });
        });
        // console.log(resource.file);
        
    } catch(err){
        console.log(err);
        // req.flash('error', 'An error has occurred. Unable to locate resource.');
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
        // const resource = await Resource.findByIdAndUpdate(id, { ...req.body.resource });
        // req.flash('success', 'Successfully updated resource.');
        res.redirect(`/catalogue/${id}`);
    } catch(err){
        console.log(err);
        // req.flash('error', 'An error has occurred. Unable to update resource.');
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
        const query = "DELETE FROM resources WHERE resourceid=$1;"
        // await Resource.findByIdAndDelete(id);
        await client.query(query, values, (err, result) => {
            if (err) {
                throw err
            }
            // req.flash('success', 'Successfully deleted resource.');
            if (!resource) {
                // req.flash('error', 'Cannot find that resource!');
            }
        });
        res.redirect(`/catalogue`);
    } catch(err){
        console.log(err);
        // req.flash('error', 'An error has occurred. Unable to delete resource.');
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
                // console.log(query);
                throw err
            }
            const resource = result.rows[0];

            res.render('resources/edit', { resource });
            
            if (!resource) {
                // req.flash('error', 'Cannot find that resource!');
                return res.redirect('/catalogue');
            }
        });
        // const resource = await Resource.findById(id);
        // res.render('resources/edit', { resource });
    } catch (err){
        console.log(err);
        res.redirect('/catalogue');
    } finally {
        client.release();
    }
    
}
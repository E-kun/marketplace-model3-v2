const Cart = require('../models/cart');
const Resource = require('../models/resource');
const { pgPool } = require('../utils/db-connect');

module.exports.showCart = async (req, res) => {
     try{
        if(!req.session.cart){
            return res.render('checkout/cart', {resources: null});
        }
        const cart = new Cart(req.session.cart);
        const cartArray = cart.generateArray();
        totalPrice = cart.getTotalPrice();
        res.render('checkout/cart', {resources: cartArray, totalPrice});
    } catch(err){
         console.log(err);
         req.flash('error', 'An error has occurred. Unable to show shopping cart.');
         res.redirect('/catalogue');
    }
}

module.exports.addItemToCart = async (req, res) => {
    const resourceId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    const client = await pgPool.connect();
    const values = [resourceId]
    const query = `SELECT * FROM Resources WHERE subject='Maths';`

    try{
        
        //Result from SQL query in this return comes in the form of an array and so it is necessary to place result values into an object.
        const result = await client.query({
            rowMode: "array",
            text: `SELECT * FROM Resources WHERE resourceid='${resourceId}';`
        })

        const resource = {
            name: result.rows[0][1],
            price: result.rows[0][2],
            description: result.rows[0][3],
            subject: result.rows[0][4],
            image: result.rows[0][5]
            // file: String
        }
        // console.log(resource);

        cart.add(resource, resourceId);
            
        req.session.cart = cart;
        req.flash('success', 'Item added to cart.');

        res.redirect('/cart');
    } catch(err){
        console.log(err);
        req.flash('error', 'An error has occurred. Unable to add item to cart.');
        res.redirect('/catalogue');
    } finally {
        client.release();
    }  
}
const express = require('express')
// const multer = require('multer');
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const stripe = require('stripe')(process.env.DB_STRIPE_KEY);
const stripe = require('stripe')('sk_test_51NIaOwEHtBmNUMhd2SffVSOEAKkjWyyhiTYqMpfrMrGnKiuSY57hgslFbQPrUNUTjYQRnwLufdILrGbwpzLZXc7700vZmNpJ9r');

app.use(cors())
app.use(express.json())
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = `mongodb://0.0.0.0:27017`
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d1kr80i.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        const database = client.db("myShop");
        const products = database.collection('products')
        const sell = database.collection('sell')
        const stock = database.collection('stock')
        const cost = database.collection('costs')
        app.get('/product/sort/:name/:search', async (req, res) => {
            const sortby = req.params.name;
            let search = req.params.search;
            // Create a dynamic filter object
            let filter = {};
            filter[sortby] = search;
            if (sortby === "purhase") {
                const [lowerBound, upperBound] = search.split('-').map(Number);
                filter = {
                    "purhase": {
                        $gte: lowerBound,
                        $lte: upperBound,
                    }
                };
                const sortCriteria = { purhase: 1 };
                const result = await products.find(filter).sort(sortCriteria).toArray();
                res.send(result)
                // console.log(filter,sortCriteria)
            }
            else {
                const result = await products.find(filter).toArray();
                res.send(result)
            }
        });
        app.get('/cost', async (req, res) => {
            const costs = cost.find()
            const result = await costs.toArray();
            res.send(result)
        })
        app.get('/sold', async (req, res) => {
            const sold = sell.find()
            const result = await sold.toArray();
            res.send({ found: result.length, data: result })
        })
        app.get('/stock', async (req, res) => {
            const stck = stock.find()
            const result = await stck.toArray();
            res.send({ found: result.length, data: result })
        })
        app.get('/products', async (req, res) => {
            const cursor = products.find()
            const result = await cursor.toArray();
            res.send({ found: result.length, data: result })
        })
        app.get('/sold/:search', async (req, res) => {
            try {
                const searchValue = req.params.search;
                const query = await sell.findOne({ _id: new ObjectId(searchValue) });
                if (query) {
                    res.send({ success: true, data: query })
                }
                else {
                    res.send({ erorr: true, message: "This Product is Not Found, Try Another    " })
                }
            }
            catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ error: true, message: 'An error occurred while inserting data' });
            }

        })
        app.get('/stock/query/:search', async (req, res) => {
            try {
                const barCode = req.params.search;
                const query = await stock.findOne({ "barCode": barCode });
                if (query) {
                    res.send({ success: true, data: query })
                }
                else {
                    res.send({ erorr: true, message: "This Product is Not Found, Try Another    " })
                }
            }
            catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ error: true, message: 'An error occurred while inserting data' });
            }

        })
        app.get('/getproduct/:search', async (req, res) => {
            try {
                const barCode = req.params.search;
                const query = await products.findOne({ "barCode": barCode });
                if (query) {
                    res.send({ success: true, data: query })
                }
                else {
                    res.send({ erorr: true, message: "This Product is Not Found, Try Another    " })
                }
            }
            catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ error: true, message: 'An error occurred while inserting data' });
            }

        })
        app.post('/cost/daily/add', async (req, res) => {
            const data = req.body;
            // console.log(data)
            try {
                const result = await cost.insertOne(data);
                if (result.acknowledged) {
                    res.status(200).json({ success: true, message: 'Data inserted successfully' });
                } else {
                    res.status(500).json({ success: false, message: 'Failed to insert data' });
                }
            } catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ success: false, message: 'An error occurred while inserting data' });
            }
        });
        app.post('/products/add', async (req, res) => {
            const data = req.body;
            data.purhase = parseInt(data.purhase)
            // console.log(data)
            try {
                const result = await products.insertOne(data);
                const addStock = await stock.insertOne(data);
                if (result.acknowledged) {
                    res.status(200).json({ success: true, message: 'Data inserted successfully' });
                } else {
                    res.status(500).json({ success: false, message: 'Failed to insert data' });
                }
            } catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ success: false, message: 'An error occurred while inserting data' });
            }
        });
        
        app.post('/sell/add', async (req, res) => {

            const data = req.body;
            const barcodes = [];
        
            async function deleteStock() {
                try {
                    data.data = data.data.slice(1, data.data.length);
                    
                    await Promise.all(data.data.map(async (item) => {
                        const barcode = item.barcode;
                        const query = await stock.findOne({ "barCode": barcode });
                        barcodes.push(item.barcode);
                        const options = { upsert: true };
                        console.log(item.qty)
                        const doUpdate = {
                            $inc: {
                                qty: -parseInt(item.qty)
                            }
                        };
        
                        await stock.updateOne({ "barCode": barcode }, doUpdate, options);
        
                        console.log(parseInt(query.qty));
                        if (parseInt(query.qty)-parseInt(item.qty)<=0) {
                            await stock.deleteOne({ "barCode": barcode });
                        }
                    }));
                } catch (error) {
                    console.error('Error during update:', error);
                }
            }
        
            try {
                const result = await sell.insertOne(data && data);
                await deleteStock();
        
                if (result.acknowledged) {
                    res.status(200).json({ success: true, message: 'Data inserted successfully' });
                } else {
                    res.status(500).json({ success: false, message: 'Failed to insert data' });
                }
            } catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ success: false, message: 'An error occurred while inserting data' });
            }
        });
        
        
        app.patch('/product/update/:id', async (req, res) => {
            const body = req.body;
            const update = {
                ...body
            }
            const {
                images, barCode, name, groupCode, size, color, weight, materials, Gruaranty, Warranty, quality, manufacturer, min, max, details, instructions, purhase, cost
            } = update;
            const random = Math.floor(Math.random() * 99999)
            const findData = await products.findOne({ barCode: barCode });
            const oldLength = findData.images.length;
            const newImages = (oldLength === images.length || oldLength === undefined || name === null) ? findData.images : images;
            const newname = (name === "" || name === undefined || name === null) ? findData.name : name;
            const newGrup = (groupCode === "" || groupCode === undefined || groupCode === null) ? findData.groupCode : groupCode;
            const newsize = (size === "" || size === undefined || size === null) ? findData.size : size;
            const newcolor = (color === "" || color === undefined || color === null) ? findData.color : color;
            const newweight = (weight === "" || weight === undefined || weight === null) ? findData.weight : weight;
            const newmaterials = (materials === "" || materials === undefined || materials === null) ? findData.materials : materials;
            const newGruaranty = (Gruaranty === "" || Gruaranty === undefined || Gruaranty === null) ? findData.Gruaranty : Gruaranty;
            const newWarranty = (Warranty === "" || Warranty === undefined || Warranty === null) ? findData.Warranty : Warranty;
            const newquality = (quality === "" || quality === undefined || quality === null) ? findData.quality : quality;
            const newmanufacturer = (manufacturer === "" || manufacturer === undefined || manufacturer === null) ? findData.manufacturer : manufacturer;
            const newmin = (min === "" || min === undefined || min === null) ? findData.min : min;
            const newmax = (max === "" || max === undefined || max === null) ? findData.max : max;
            const newcost = (cost === "" || cost === undefined || cost === null) ? findData.cost : cost;
            const newpurhase = (purhase === "" || purhase === undefined || purhase === null) ? findData.purhase : purhase;
            const newdetails = (details === "" || details === undefined || details === null) ? findData.details : details;
            const newinstructions = (instructions === "" || instructions === undefined || instructions === null) ? findData.instructions : instructions;
            const newBarCode = (name === "" || name === undefined || name === null) ? findData.barCode : newname.slice(0, 5) + "-" + random;
            const totalCost = parseInt(newcost) + parseInt(newpurhase) + parseInt(findData.vat);
            const filter = { "barCode": barCode };
            const options = { upsert: true };
            const doUpdate = {
                $set: {
                    barCode: newBarCode,
                    images: newImages,
                    name: newname,
                    groupCode: newGrup,
                    size: newsize,
                    color: newcolor,
                    weight: newweight,
                    materials: newmaterials,
                    Gruaranty: newGruaranty,
                    Warranty: newWarranty,
                    quality: newquality,
                    manufacturer: newmanufacturer,
                    min: newmin,
                    max: newmax,
                    cost: newcost,
                    purhase: newpurhase,
                    details: newdetails,
                    instructions: newinstructions,
                    minProfit: parseInt(newmin) / 100 * parseInt(totalCost),
                    maxProfit: parseInt(newmax) / 100 * parseInt(totalCost)
                }
            };
            // console.log(doUpdate)
            const result = await products.updateOne(filter, doUpdate, options);
            // const newfilter = products.findOne({ "barCode": barCode }) 
            res.send(result);
        });
        app.patch('/edit/product/price/:id', async (req, res) => {
            const newPrice = req.body.newPrice;
            const id = req.params.id
            // console.log(newPrice,id)
            const options = { upsert: true };
            filter = { _id: new ObjectId(id) }
            const priceUpdate = {
                $set: {
                    purhase: newPrice,
                }
            }
            const result = await products.updateOne(filter, priceUpdate, options);
            if (result) {
                res.send({ res: "ok", message: "successfully updated" })
            }
        })
        app.delete('/stock/:productId', async (req, res) => {
            try {
                const productId = req.params.productId;

                // Use the 'products' collection and delete the product by its ID
                const result = await stock.deleteOne({ _id: new ObjectId(productId) });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                res.json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
        app.delete('/sold/:productId', async (req, res) => {
            try {
                const productId = req.params.productId;

                // Use the 'products' collection and delete the product by its ID
                const result = await sell.deleteOne({ _id: new ObjectId(productId) });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                res.json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
        app.delete('/products/:productId', async (req, res) => {
            try {
                const productId = req.params.productId;

                // Use the 'products' collection and delete the product by its ID
                const result = await products.deleteOne({ _id: new ObjectId(productId) });
                const fromStock = await stock.deleteOne({ _id: new ObjectId(productId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                res.json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });





        // testing the payment method 
        const calculateOrderAmount = (items) => {
            // Replace this constant with a calculation of the order's amount
            // Calculate the order total on the server to prevent
            // people from directly manipulating the amount on the client
            return 1400;
        };
        app.post("/create-payment-intent", async (req, res) => {
            const { items } = req.body;
            console.log(req.body)
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: calculateOrderAmount(items),
                currency: "usd",
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });











        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running try to cathc data')
})



app.listen(port, () => {
    console.log('express server is running on port: ' + port)
})





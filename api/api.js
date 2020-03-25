const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
mongoClient.connect(async (err, client) => {
    if (err) {
        console.log(err)
        return
    }

    /* I drop a collection to avoid re-writing info, then I insert
    list of available and rented bikes just to show, that calculating
    of time and price works correctly*/
    
    const db = client.db('bikedb')
    const collection = db.collection('bikes')
    const bikesList = require('./bikes')
    await collection.drop()
    await collection.insertMany(bikesList)
    

    app.get('/', async (req, res) => {
        let bikes = await collection.find().toArray()

        const rentedBikes = bikes.filter(el => el.isRented === true)
        rentedBikes.forEach(el => {
            const now = new Date(),
                rentedTime = (now - new Date(`${el.rentedTime}`)) / 3600000
            el.rentedHours = Math.ceil(rentedTime)
            el.currentPrice = el.rentedHours * el.price

            if (el.rentedHours > 20) {
                el.currentPrice = el.currentPrice / 2
            }

        })

        const allBikes = {
            available: bikes.filter(el => el.isRented === false),
            rented: rentedBikes
        }

        res.send(allBikes)
    })


    app.post('/add', async (req, res) => {
        const newBikeId = await (await collection.insertOne(req.body)).insertedId
        const newBike = await collection.findOne({ _id: new ObjectId(newBikeId) })
        res.send(newBike)
    })

    app.delete('/delete', async (req, res) => {
        const bikeId = req.query.id
        await collection.deleteOne({ _id: new ObjectId(bikeId) })
        const bikes = await collection.find().toArray()

        const availableBikes = bikes.filter(el => el.isRented === false)
        res.send(availableBikes)
    })

    app.put('/rent', async (req, res) => {
        const bikeId = req.query.id
        await collection.updateOne({ _id: new ObjectId(bikeId) }, { $set: { isRented: true, rentedTime: new Date() } })
        const rentedBike = await collection.findOne({ _id: new ObjectId(bikeId) })

        const now = new Date(),
            rentedTime = (now - new Date(`${rentedBike.rentedTime}`)) / 3600000
        rentedBike.rentedHours = Math.ceil(rentedTime)
        rentedBike.currentPrice = rentedBike.rentedHours * rentedBike.price

        if (rentedBike.rentedHours > 20) {
            rentedBike.currentPrice = rentedBike.currentPrice / 2

        }

        res.send(rentedBike)
    })

    app.put('/cancel_rent', async (req, res) => {

        const bikeId = req.query.id
        await collection.updateOne({ _id: new ObjectId(bikeId) }, { $set: { isRented: false }, $unset: { rentedTime: '' } })
        const unrentedBike = await collection.findOne({ _id: new ObjectId(bikeId) })
        res.send(unrentedBike)
    })

    app.listen(3001)
})











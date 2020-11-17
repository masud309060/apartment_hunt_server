const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const cors = require('cors'); 
require('dotenv').config();


const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrq7z.mongodb.net/ApartmentHunt?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("ApartmentHunt").collection("services");
  const apartmentsCollection = client.db("ApartmentHunt").collection("apartments");
  const bookingCollection = client.db("ApartmentHunt").collection("bookings");

  app.post('/addServices',(req, res) => {
    const services = req.body;
    servicesCollection.insertMany(services)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/addService',(req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const address = req.body.address;
    const bedRoom = req.body.bedroom;
    const bathRoom = req.body.bathroom;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };
    apartmentsCollection.insertOne({name, price, address, bedRoom, bathRoom, image})
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/addApartments',(req, res) => {
    const apartments = req.body;
    apartmentsCollection.insertMany(apartments)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/addBooking',(req, res) => {
    const booking = req.body;
    bookingCollection.insertOne(booking)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/bookings', (req, res) => {
    bookingCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/myRent', (req, res) => {
    const email = req.query.email;
    bookingCollection.find({email: email})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/services',(req,res) => {
    servicesCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/apartments',(req,res) => {
    apartmentsCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

});


app.get('/',(req,res) => {
  res.send("hello world")
})

app.listen(process.env.PORT || 5000);
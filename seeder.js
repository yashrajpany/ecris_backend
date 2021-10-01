const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

//Load env vars
dotenv.config({ path: './config/config.env' })

// load models
const Bootcamp = require('./models/Bootcamp')
const User = require('./models/User')
const Review = require('./models/Review')

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
})

// Read JSON file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
)
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
)

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    await User.create(users)
    await Review.create(reviews)

    console.log('Data Imported...'.green.inverse)
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

// Delete Data from DB
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()

    console.log('Data Deleted'.red.inverse)
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}

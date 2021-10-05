const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')
const modeEligibleForAddr = ['Offline']

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Add a description'],
      trim: true,
      maxlength: [500, 'Name can not be more than 500 characters'],
    },
    email: {
      type: String,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      required: [true, 'Please add a mode of event'],
    },
    address: {
      type: String,
      required: [isOffline, 'Please add an address'],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    link: {
      type: String,
      required: [!isOffline, 'Please add a link'],
    },
    careers: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    institute: {
      type: String,
    },
    dept: {
      type: String,
    },
    phone: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: Date,
      required: [true, 'Please add a date of conduction'],
    },
    time: {
      type: String,
      required: [true, 'Please add a time of conduction'],
    },
    criteria: {
      type: String,
      enum: ['Private', 'Public'],
      required: [true, 'Please add a criteria'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { vituals: true },
  }
)

BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

function isOffline() {
  if (modeEligibleForAddr.indexOf(this.mode) > -1) {
    return true
  }
  return false
}

// GEOCODER
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  }

  // Do not put address in DB
  this.address = undefined
  next()
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)

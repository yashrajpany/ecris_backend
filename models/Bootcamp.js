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
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
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
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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

// // Cascade delete cousrses when a bootcmap is deleted
// Boo

// Reverse populate with virtuals
// BootcampSchema.virtual('courses', {
//   ref: 'Course',
//   localField: '_id',
//   foreignField: 'bootcamp',
//   justOne: false
// });

module.exports = mongoose.model('Bootcamp', BootcampSchema)

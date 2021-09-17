const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const connectDB = require('./config/db')

// Load env vars
dotenv.config({path: './config/config.env'})

// Connect to database
connectDB()

// Route files
const bootcamps = require('./routes/bootcamps')

const app = express();

// Body parser
app.use(express.json())

// Using morgan as a logger
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Mouting routers
app.use('/api/v1/bootcamps', bootcamps)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handling Unhandled rejection
process.on('unhandledRejection', (err,promise) =>{
    console.log(`Error: ${err}`.red)
    // Close server and exit
    server.close(()=> process.exit(1))
})
const Bootcamp = require('../models/Bootcamp') 


// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = async (req, res, next) => {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({
        success: true, 
        count: bootcamps.length,
        data: bootcamps})
}

// @desc Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    res.status(200).json({
        success: true, 
        data: bootcamp})
    
}

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = async(req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
        success: true,
        data: bootcamp
    })
}

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators: true
    })

    if(!bootcamp){
        res.status(400).json({
            success: false,
            msg: `Bootcamp doesn't exist`
        })
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })
}

// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access  
exports.deleteBootcamp = async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if(!bootcamp){
        res.status(400).json({
            success: false,
            msg: `Bootcamp doesn't exist`
        })
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })
} 
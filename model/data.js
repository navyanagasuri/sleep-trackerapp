const mongoose = require('mongoose')

const DataSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        date: { type: String, required: true },
        age: { type: Number, required: false },
        sleepTime: { type: Number, required: true },
        disturbance: { type: String, required: false }
    },
)

const model = mongoose.model('data', DataSchema)

module.exports = model
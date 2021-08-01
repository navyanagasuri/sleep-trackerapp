const mongoose = require('mongoose')

const SleepSchema = new mongoose.Schema(
    {
        email: { type: String, required: true},
        password: { type: String, required: true }
    },
)

const model = mongoose.model('sleep', SleepSchema)

module.exports = model
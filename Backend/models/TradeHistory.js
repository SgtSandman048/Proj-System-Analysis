// models/TradeHistory.js
const mongoose = require('mongoose');

const TradeHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        default: 'guest',
        index: true
    },
    username: {
        type: String,
        default: 'Guest User'
    },
    itemName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    game: {
        type: String,
        enum: ['PetSimulator', 'GrowAGarden'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'support', 'cancelled'],
        default: 'pending'
    },
    imageUrl: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
TradeHistorySchema.index({ userId: 1, date: -1 });
TradeHistorySchema.index({ date: -1 });

module.exports = mongoose.model('TradeHistory', TradeHistorySchema);
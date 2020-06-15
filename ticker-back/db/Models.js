const { Schema, model } = require('mongoose');

let Misc = model('misc', new Schema({
    lastUpdate: Number,
}), 'misc')

let Posts = model('posts', new Schema({
    id: String, // Reddit assigned id string for this post
    ts: Number,
    link: String,
    have: String,
    want: String,
    loc: String,
    author: String,
    flair: String,
    selftext: String,
    trades: [{ type: String }] //List of ObjectIDs
}), 'posts')

let Trades = model('trades', new Schema({
    ts: Number,
    pid: String, //ObjectID
    post: String, //ObjectID
    price: Number,
    currency: String,
    confirm: Boolean
}), 'trades')

let Products = model('products', new Schema({
    displayName: String,
    keywords: [{ type: String }], //keywords to use when matching
    trades: [{ type: String }] //List of ObjectIDs
}), 'products')


module.exports = { Misc, Trades, Posts, Products }
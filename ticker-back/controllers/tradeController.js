const { spawn } = require('child_process')
const { Misc, Trades, Posts, Products } = require('../db/Models')

// Pulls new trades since lastUpdate timestamp
let update = (cb) => {
    let newData = ''
    Misc.find().then((res) => {
        let lastUpdate = res[0].lastUpdate
        let newUpdate = Math.floor(Date.now() / 1000)

        let runner = spawn('python3', ['scrape.py', '-t', lastUpdate])
        runner.stdout.on('data', function (data) {
            newData += data
        })

        runner.on('exit', function (code, signal) {
            if (code === 0) {
                jsonData = JSON.parse(newData)
                console.log('New Entries: ' + Object.keys(jsonData).length)
                cb(null, jsonData, newUpdate)
            }
            else {
                console.log(code + ' | ' + signal)
                cb(signal, null, null)
            }
        })
    })
}

// Process and Save new posts -> new trades
let saveUpdate = (newPosts, newUpdate, cb) => {
    let bulkOps = []
    Object.keys(newPosts).forEach((k) => {
        let kPost = newPosts[k]
        if (kPost != undefined || kPost != null) {
            bulkOps.push({
                updateOne: {
                    filter: {
                        id: k
                    },
                    update: {
                        ts: kPost.timestamp,
                        link: kPost.link,
                        have: kPost.have,
                        want: kPost.want,
                        loc: kPost.title,
                        author: kPost.author,
                        flair: kPost.flair,
                        selftext: kPost.selftext
                    },
                    upsert: true
                }
            })
        } else {
            console.log('SKIP SAVE DUE TO PARSING FAILURE')
        }

    })

    if (bulkOps.length === 0) {
        updatelastUpdateTS(newUpdate, cb)
    } else {
        Posts.bulkWrite(bulkOps, (err, res) => {
            if (err) cb(err, null)
            else {
                console.log('BULK UPDATE SUCCESS')
                updatelastUpdateTS(newUpdate, cb)
            }
        })
    }
}

// update lastUpdate timestamp
let updatelastUpdateTS = (newUpdate, cb) => {
    Misc.updateOne({ 'lastUpdate': { $exists: true } }, { 'lastUpdate': newUpdate }, (err, res) => {
        if (err) console.log(err)
        else {
            cb(null, res) //TODO send something more meaningful back
        }
    })
}

module.exports = { update, saveUpdate }

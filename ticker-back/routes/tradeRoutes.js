const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController')

let db = null;
let refreshTimer = setInterval(() => { updateAndSave() }, 3600000) // default 1hr

/* GET request wtih a search query */
router.get('/query', function (req, res, next) {
  console.log('Query: ' + req.query)
  res.render('index', { title: 'Express' });
});

// POST to force db update, no data return
router.post('/update', function (req, res, next) {
  updateAndSave(req, res, next)
});

// POST to set/unset refresh timer
router.post('/toggleRefresh', function (req, res, next) {
  clearInterval(refreshTimer)
  if (!req.body.interval) {
    res.send('Refresh OFF')
  } else {
    refreshTimer = setInterval(() => { updateAndSave() }, req.body.interval)
    res.send('Refreshing every ' + req.body.interval + ' seconds')
  }
})

// Pulls new posts, parses, and updates db
let updateAndSave = (req, res, next) => {
  tradeController.update((err, newPosts, newUpdate) => {
    if (err) {
      console.log(err)
      res ? res.status(500).send(err) : null
    } else {
      // parse newPosts data
      // TODO: separate out once this gets larger
      Object.keys(newPosts).forEach((k) => {
        let title = newPosts[k].title
        try {
          let tRegex = /\[[A-Za-z-]*\]/g
          let loc = tRegex.exec(title)

          // filter out artisan, ic, or gb posts
          // any other title with less than 3 pairs of square brackets will
          // safely error out too ('PARSING ERROR' catch block entered)
          if (!/(Meta|Vendor|Service|Artisan|IC|GB)/g.test(loc[0])) {
            let a = tRegex.exec(title)
            let b = tRegex.exec(title)
            let have = title.substring(a.index + 3, b.index).trim()
            let want = title.substring(b.index + 3).trim()
            if (a[0] === '[W]') {
              want = title.substring(a.index + 3, b.index).trim()
              have = title.substring(b.index + 3).trim()
            }
            loc = loc[0] // set loc to the actual location tag
            // console.log(loc + ': ' + '[H] ' + have + ' || [W] ' + want)
            newPosts[k].loc = loc
            newPosts[k].have = have
            newPosts[k].want = want
          }
        } catch (error) {
          //TODO make an offical report log for these parsing errors
          console.log(error)
          console.log(k + ': ' + newPosts[k].title)
          newPosts[k] = undefined // marked as unparse-able, will not be saved
        }
      })

      tradeController.saveUpdate(newPosts, newUpdate, (err, data2) => {
        if (err) {
          console.log(err)
          res ? res.status(500).send(err) : null
        } else {
          res ? res.send(data2) : null//TODO: send some conf but not actual new data
        }
      })
    }
  })
}

module.exports = (db) => {
  this.db = db
  return router
};


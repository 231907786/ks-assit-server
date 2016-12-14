var router = require('express').Router()
var av = require('leanengine')

router.get('/', async (req, res, next) => {
  try {
    const result = await av.Cloud.run('inventory', {username: req.query.a, password: req.query.b})
    res.end(JSON.stringify(result))
  } catch (err) {
    res.end(err.message)
  }
})

module.exports = router;

var router = require('express').Router()
var av = require('leanengine')

router.get('/', async (req, res, next) => {
  const result = await av.Cloud.run('hello', {username: req.query.a, password: req.query.b})
  res.end(JSON.stringify(result))
})

module.exports = router;

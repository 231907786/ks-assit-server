const cookie = require('./cookie');
const sites = require('./sites');
const request = require('superagent');

module.exports = async function(auth) {
  await cookie.init()
  const response = await request
    .post(sites.root + sites.index)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Cookie', cookie.cookie)
    .send({
      username: auth[0],
      password: auth[1],
      Submit: '登入',
    })
}

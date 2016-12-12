const request = require('superagent');
const sites = require('./sites');
var cookie = ''

module.exports = {
  async init() {
    const response = await request.get(sites.root + sites.index)
    cookie = JSON.stringify(response.header['set-cookie'][0].split(';')[0])
  },
  get cookie() {
    return cookie
  },
}

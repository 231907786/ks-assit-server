const login = require('./login')
const requestJSON = require('./requestInventoryToJSON');

module.exports = async ({username, password}) => {
  await login([username, password])
  return await requestJSON()
}

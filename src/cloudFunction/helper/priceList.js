// 服务器启动时维护一份价目表，每隔3小时更新一次
const av = require('leanengine');

const updateInterval = 3 * 60 * 60 * 1000
let updatedAt = 0
let priceList = {}

const updatePriceList = async() => {
  const queryProductPrice = new av.Query('ProductPrice')
  queryProductPrice.limit(1000)
  priceList = await queryProductPrice.find()
  priceList = priceList.reduce((acc, obj) => {
    if (!obj) {
      return acc
    }
    acc[obj.get('product_id')] = obj
    return acc
  }, {})
  updatedAt = Date.now()
}

updatePriceList()

const getPriceList = async() => {
  if (Date.now() - updatedAt > updateInterval) {
    await updatePriceList()
  }
  return priceList
}

module.exports = getPriceList

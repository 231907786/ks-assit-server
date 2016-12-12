const queryJSON = require('../backgroundTasks/queryInventory');
const av = require('leanengine');

av.Cloud.define('hello', async (request, response) => {
  // 请求库存
  const inventory = await queryJSON(request.params)

  // 请求价目表
  const queryProductPrice = new av.Query('ProductPrice')
  queryProductPrice.limit(1000)
  let priceList = await queryProductPrice.find()
  priceList = priceList.reduce((acc, obj) => {
    if (!obj) {
      return acc
    }
    acc[obj.get('product_id')] = obj
    return acc
  }, {})

  // 计算总金额和总pv
  const sum = inventory.reduce((acc, obj) => {
    const price = priceList[obj['product_id']]
    if (!price) return acc

    // 全价
    const quantity_100 = obj['100'] && obj['100'].quantity || 0
    if (quantity_100 > 0) {
      acc['100'].money += quantity_100 * (price.get('100') && price.get('100').price || 0)
      acc['100'].pv += quantity_100 * (price.get('100') && price.get('100').pv || 0)
    }

    // 七折
    const quantity_70 = obj['70'] && obj['70'].quantity || 0
    if (quantity_70 > 0) {
      acc['70'].money += quantity_70 * (price.get('70') && price.get('70').price || 0)
      acc['70'].pv += quantity_70 * (price.get('70') && price.get('70').pv || 0)
    }

    return acc
  }, {
    100: {money: 0, pv: 0},
    70: {money: 0, pv: 0},
  })
  response.success(sum)
});

module.exports = av.Cloud;

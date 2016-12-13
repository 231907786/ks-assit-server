const queryJSON = require('../backgroundTasks/queryInventory');
const av = require('leanengine');
const getPriceList = require('./helper/priceList');
const errorMap = require('../errorMap');

av.Cloud.define('inventory', async (request, response) => {
  try {
    // 请求库存
    const inventory = await queryJSON(request.params)

    // 拿到缓存的价目表
    const priceList = await getPriceList()

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
  } catch (err) {
    // 错误由云函数统一收集发送
    const message = errorMap[err.message] || '未知错误，请稍候再试'
    response.error({message})
  }
});

module.exports = av.Cloud;

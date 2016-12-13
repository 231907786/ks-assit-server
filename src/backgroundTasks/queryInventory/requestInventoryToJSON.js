const cheerio = require('cheerio');
const cookie = require('./cookie');
const request = require('superagent');
const sites = require('./sites');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const queryInventoryHTML = async (retry = 0) => {

  // 递归重试上限5次
  if (retry > 3) return retry

  const {text} = await request
    .post(sites.root + sites.inventory)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Cookie', cookie.cookie)
    .send({smtsearch: 'suibian'})

  const $ = cheerio.load(text)
  const str = $.html()
  if (str.length < 1e5) {
    await delay(1e3)
    return await queryInventoryHTML(retry + 1)
  }else {
    return $
  }
}


const extractData = $ => {
  let result = []
  const discountMap = {
    2: 100,
    3: 90,
    4: 80,
    5: 75,
    6: 70,
    7: 85,
  }
  $('table[cellpadding="4"] > tr').each(function(i) {
    if (i > 1) {
      let product = {}
      $(this).children('td').each(function(ii) {
        switch (ii) {
          case 0:
            product['product_id'] = $(this).text()
            break;
          case 1:
            product.name = $(this).text()
            break;
          default:
            const priceAndNum = getPriceAndNum($(this).text())
            const discount = discountMap[ii]
            if (priceAndNum && discount) {
              product[discount] = priceAndNum
            }
        }
      })
      result.push(product)
    }
  })
  return result

  function getPriceAndNum(str) {
    const arr = str.split(/\s/).filter(item => item !== '')
    switch (arr.length) {
      case 0:
        return ''
      case 3:
        return {
          price: arr[0],
          quantity: arr[1]
        }
      case 6:
        return {
          price: arr[3],
          quantity: arr[4]
        }
      default:
        console.error(`Function getPriceAndNum got unconsidered case: length = ${arr.length}`);
    }
  }
}

module.exports = async () => {
  const $ = await queryInventoryHTML()
  if ($) return extractData($)
  else throw new Error('inventory_2')
}

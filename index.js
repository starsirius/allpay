var md5 = require('MD5')
  , MERCHANT_ID = '2000132'
  , HASH_KEY = '5294y06JbISpM5x9'
  , HASH_IV = 'v77hoKGq4kWxNNIS'
  , AIO_CHECKOUT_URL = 'http://payment-stage.allpay.com.tw/Cashier/AioCheckOut'
  , AIO_ORDER_QUERY_URL = 'http://payment-stage.allpay.com.tw/Cashier/QueryTradeInfo';

function AllPay(options) {
  if (options == null) {
    options = {};
  }

  this.merchantId = options.merchantId || MERCHANT_ID;
  this.hashKey = options.hashKey || HASH_KEY;
  this.hashIV = options.hashIV || HASH_IV;
  this.aioCheckoutUrl = options.aioCheckoutUrl || AIO_CHECKOUT_URL;
  this.aioOrderQueryUrl = options.aioOrderQueryUrl || AIO_ORDER_QUERY_URL;
}

AllPay.prototype.genCheckMacValue = function(data) {
  var pairs = Object
    .keys(data)
    .sort()
    .map(function(v) { return v + "=" + (data[v] || ''); });

  pairs.unshift("HashKey=" + this.hashKey);
  pairs.push("HashIV=" + this.hashIV);

  queryString = pairs.join("&");
  uriEncoded = encodeURIComponent(queryString).replace(/%20/g, '+');

  return md5(uriEncoded.toLowerCase()).toUpperCase();
}

module.exports = AllPay;

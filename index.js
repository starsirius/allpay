var md5 = require('MD5')
  , HASH_KEY = '5294y06JbISpM5x9'
  , HASH_IV = 'v77hoKGq4kWxNNIS'
  , AIO_CHECKOUT_URL = 'http://payment-stage.allpay.com.tw/Cashier/AioCheckOut';

function AllPay(options) {
  if (options == null) {
    options = {};
  }

  this.hashKey = options.hashKey || HASH_KEY;
  this.hashIV = options.hashIV || HASH_IV;
  this.aioCheckoutUrl = options.aioCheckoutUrl || AIO_CHECKOUT_URL;
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

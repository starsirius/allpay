var md5 = require('MD5')
  , HASH_KEY = '5294y06JbISpM5x9'
  , HASH_IV = 'v77hoKGq4kWxNNIS'
  , AIO_CHECKOUT_URL = 'http://payment-stage.allpay.com.tw/Cashier/AioCheckOut';

module.exports = function(options) {
  var hashKey, hashIV, aioCheckoutUrl;

  if (options == null) {
    options = {};
  }

  hashKey = options.hashKey || HASH_KEY;
  hashIV = options.hashIV || HASH_IV;
  aioCheckoutUrl = options.aioCheckoutUrl || AIO_CHECKOUT_URL;

  return {
    genCheckMacValue: function(data) {
      pairs = Object
        .keys(data)
        .sort()
        .map(function(v) { return v + "=" + (data[v] || ''); });

      pairs.unshift("HashKey=" + hashKey);
      pairs.push("HashIV=" + hashIV);

      queryString = pairs.join("&");
      uriEncoded = encodeURIComponent(queryString).replace(/%20/g, '+');

      return md5(uriEncoded.toLowerCase()).toUpperCase();
    }
  };
};

var _ = require('underscore')
  , md5 = require('MD5');

function AllPay(options) {
  var instance = this
    , defaults = {
    merchantId: '2000132',
    hashKey: '5294y06JbISpM5x9',
    hashIV: 'v77hoKGq4kWxNNIS',
    aioCheckoutUrl: 'http://payment-stage.allpay.com.tw/Cashier/AioCheckOut',
    aioOrderQueryUrl: 'http://payment-stage.allpay.com.tw/Cashier/QueryTradeInfo'
  };

  if (options == null) {
    options = {};
  }

  _.each(_.extend(defaults, options), function(v, k) { instance[k] = v; });
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

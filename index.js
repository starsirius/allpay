var _ = require('underscore')
  , md5 = require('MD5')
  , PAYMENT_METHOD = {
    ALL: 'ALL',
    CREDIT: 'Credit',
    WEB_ATM: 'WebATM',
    ATM: 'ATM',
    CVS: 'CVS',
    BARCODE: 'BARCODE',
    ALIPAY: 'Alipay',
    TENPAY: 'Tenpay',
    TOP_UP_USED: 'TopUpUsed'
  };

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
};

AllPay.prototype.validate = function(data) {
  return data;
};

AllPay.prototype.checkoutFormHtml = function(data) {
  var cleaned;

  if ((cleaned = this.validate(data)) != false) { return; }

  return this.createFormHtml(
    _.extend(data, { CheckMacValue: this.genCheckMacValue(data) })
  );
};

AllPay.prototype.createFormHtml = function(data) {
  return '<form id="allpay-checkout" method="post" action="' + this.aioCheckoutUrl + '">' +
    _.map(data, function(v, k) {
      return '<input type="hidden" name="' + k + '" value="' + v + '">';
    }).join('') + '</form>';
};

module.exports = AllPay;

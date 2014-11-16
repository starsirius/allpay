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

AllPay.prototype.validateCheckout = function(data) {
  var errors = []
    , required = [
      'MerchantID',         // Merchant ID provided by AllPay
      'MerchantTradeNo',    // Unique order ID
      'MerchantTradeDate',  // Order timestamp in yyyy/MM/dd HH:mm:ss format
      'PaymentType',        // "aio"
      'TotalAmount',        // Order total amount
      'TradeDesc',          // Order desscription
      'ItemName',           // Items. Multiple items separated by "#"
      'ReturnURL',          // URL to receive payment results
      'ChoosePayment'       // AllPay payment type
    ]
    , optional = {}
    , omits = []
    , installment
    , periodic;

    optional[PAYMENT_METHOD.ALL] = [
      'PlatformID',
      'ClientBackURL',
      'ItemURL',
      'Remark',
      'ChooseSubPayment',
      'OrderResultURL',
      'NeedExtraPaidInfo',
      'DeviceSource',
      'IgnorePayment'
    ];
    optional[PAYMENT_METHOD.CREDIT] = [
      // CREDIT specific (Installment payments)
      'CreditInstallment',
      'InstallmentAmount',
      'Redeem',
      'UnionPay',
      // CREDIT specific (Periodic payments)
      'PeriodAmount',
      'PeriodType',
      'Frequency',
      'ExecTimes',
      'PeriodReturnURL'
    ];
    optional[PAYMENT_METHOD.WEB_ATM] = [];
    optional[PAYMENT_METHOD.ATM] = [
      'ExpireDate',
      'PaymentInfoURL',
      'ClientRedirectURL'
    ];
    optional[PAYMENT_METHOD.CVS] = optional[PAYMENT_METHOD.BARCODE] = [
      'Desc_1',
      'Desc_2',
      'Desc_3',
      'Desc_4',
      'PaymentInfoURL',
      'ClientRedirectURL'
    ];
    optional[PAYMENT_METHOD.ALIPAY] = [
      'AlipayItemName',
      'AlipayItemCounts',
      'AlipayItemPrice',
      'Email',
      'PhoneNo',
      'UserName'
    ];
    optional[PAYMENT_METHOD.TENPAY] = [
      'ExpireTime'
    ];
    optional[PAYMENT_METHOD.TOP_UP_USED] = [];

  if (data == null) { data = {}; }

  _.each(required, function(r) {
    if (data[r] == null || data[r] == '') { errors.push(r + ' is required'); }
  });

  if (data.MerchantID && data.MerchantID.length > 10) { errors.push('MerchantID exceeds max length 10'); }
  if (data.MerchantTradeNo && data.MerchantTradeNo.length > 20) { errors.push('MerchantTradeNo exceeds max length 20'); }
  // TODO: Check MerchantTradeDate format
  if (data.TradeDesc && data.TradeDesc.length > 200) { errors.push('TradeDesc exceeds max length 200'); }
  if (data.ItemName && data.ItemName.length > 200) { errors.push('ItemName exceeds max length 200'); }
  if (data.ReturnURL && data.ReturnURL.length > 200) { errors.push('ReturnURL exceeds max length 200'); }

  if (errors.length > 0) { return { error: true, errors: errors }; }

  switch (data['ChoosePayment']) {
    case PAYMENT_METHOD.ALL:
      filtered = _.omit(optional, PAYMENT_METHOD.CREDIT);
      filtered = _.omit(filtered, data['IgnorePayment'].split('#'));

      picks = _.union(required, _.flatten(_.values(filtered), true));

      if (data['ClientRedirectURL'] == '') { picks = _.without(picks, 'ClientRedirectURL'); }

      data = _.pick(data, picks); // Only pick what we want
      break;

    case PAYMENT_METHOD.CREDIT:
      installment = [
        'CreditInstallment',
        'InstallmentAmount',
        'Redeem',
        'UnionPay'
      ];
      periodic = [
        'PeriodAmount',
        'PeriodType',
        'Frequency',
        'ExecTimes',
        'PeriodReturnURL'
      ];
      if (_.any(_.map(installment, function(v) { return (v in data); })) &&
         _.any(_.map(periodic, function(v) { return (v in data); }))) {
        errors.push('Can not have both installment and periodic credit card options');
        return errors;
      }

      data = _.pick(data, _.union(
        required, optional[PAYMENT_METHOD.ALL], optional[PAYMENT_METHOD.CREDIT]));
      break;

    case PAYMENT_METHOD.WEB_ATM:
      data = _.pick(data, _.union(required, optional[PAYMENT_METHOD.ALL]));
      break;
    case PAYMENT_METHOD.ATM:
      data = _.pick(data, _.union(
        required, optional[PAYMENT_METHOD.ALL], optional[PAYMENT_METHOD.ATM]));
      data = _.omit(data, 'IgnorePayment');
      if (data['ClientRedirectURL'] == '') { data = _.omit(data, 'ClientRedirectURL'); }
      break;
    case PAYMENT_METHOD.CVS:
      data = _.pick(data, _.union(
        required, optional[PAYMENT_METHOD.ALL], optional[PAYMENT_METHOD.CVS]));
      data = _.omit(data, 'IgnorePayment');
      if (data['ClientRedirectURL'] == '') { data = _.omit(data, 'ClientRedirectURL'); }
      break;
    case PAYMENT_METHOD.BARCODE:
      data = _.pick(data, _.union(
        required, optional[PAYMENT_METHOD.ALL], optional[PAYMENT_METHOD.BARCODE]));
      data = _.omit(data, 'IgnorePayment');
      if (data['ClientRedirectURL'] == '') { data = _.omit(data, 'ClientRedirectURL'); }
      break;
    case PAYMENT_METHOD.ALIPAY:
      break;
    case PAYMENT_METHOD.TENPAY:
      break;
    case PAYMENT_METHOD.TOP_UP_USED:
      break;
    default:
      errors.push(
        'Payment ' + data['ChoosePayment'] + ' not supported. ' +
        'Currently support ' + PAYMENT_METHOD.values().join(', ') + '.'
      );
  }
  return data;
};

AllPay.prototype.checkoutFormHtml = function(data) {
  var cleaned;

  if ((cleaned = this.validateCheckout(data)) != false) { return; }

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

var _ = require('underscore')
  , AllPay = require('../index');

describe('#initialization', function() {
  it('has default attribute values for AllPay testing environment', function() {
    var allPay = new AllPay();

    allPay.merchantId.should.equal('2000132');
    allPay.hashKey.should.equal('5294y06JbISpM5x9');
    allPay.hashIV.should.equal('v77hoKGq4kWxNNIS');
    allPay.aioCheckoutUrl.should.equal('http://payment-stage.allpay.com.tw/Cashier/AioCheckOut');
    allPay.aioOrderQueryUrl.should.equal('http://payment-stage.allpay.com.tw/Cashier/QueryTradeInfo');
  });

  it('overrides default attribute values with options passed in', function() {
    var allPay = new AllPay({
      merchantId: 'random-merchant-id',
      hashKey: 'random-hash-key',
      hashIV: 'random-hash-iv',
      aioCheckoutUrl: 'http://random.aio/checkout/url',
      aioOrderQueryUrl: 'http://random.aio/order/query/url'
    });

    allPay.merchantId.should.equal('random-merchant-id');
    allPay.hashKey.should.equal('random-hash-key');
    allPay.hashIV.should.equal('random-hash-iv');
    allPay.aioCheckoutUrl.should.equal('http://random.aio/checkout/url');
    allPay.aioOrderQueryUrl.should.equal('http://random.aio/order/query/url');
  });
});

describe('#genCheckMacValue', function() {
  it('generates correct Check Mac Value', function() {
    var allPay = new AllPay({
      hashKey: 'xdfaefasdfasdfa32d',
      hashIV: 'sdfxfafaeafwexfe'
    }),
    data = {
      ItemName: 'sdfasdfa',
      MerchantID: '12345678',
      MerchantTradeDate: '2013/03/12 15:30:23',
      MerchantTradeNo: 'allpay_1234',
      PaymentType: 'allpay',
      ReturnURL: 'http:sdfasdfa',
      TotalAmount: '500',
      TradeDesc: 'dafsdfaff'
    }

    allPay.genCheckMacValue(data).should.equal('40D9A6C00A4A78A300ED458237071BDA');
  });
});

describe('#createFormHtml', function() {
  it('generates correct HTML form', function() {
    var allPay = new AllPay({
      aioCheckoutUrl: 'http://takoman.co'
    }),
    data = {
      MerchantID: '12345678',
      TotalAmount: '799',
      CheckMacValue: '40D9A6C00A4A78A300ED458237071BDA'
    },
    expected = '<form id="allpay-checkout" method="post" action="http://takoman.co">' +
                 '<input type="hidden" name="MerchantID" value="12345678">' +
                 '<input type="hidden" name="TotalAmount" value="799">' +
                 '<input type="hidden" name="CheckMacValue" value="40D9A6C00A4A78A300ED458237071BDA">' +
               '</form>';

    allPay.createFormHtml(data).should.equal(expected);
  });
});

describe('#validateCheckout', function() {
  var allPay, required;

  beforeEach(function() {
    allPay = new AllPay();
    required = {
      MerchantID: '1234567890',
      MerchantTradeNo: '1234567890',
      MerchantTradeDate: '2014/11/10 10:44:29',
      PaymentType: 'aio',
      TotalAmount: '3999',
      TradeDesc: '美國感恩節瘋狂購物',
      ItemName: '電視 x 20',
      ReturnURL: 'http://takoman.co',
      ChoosePayment: 'ALL'
    };
  });

  describe('required fields', function() {

    it('requires MerchantID', function() {
      var result = allPay.validateCheckout(_.omit(required, 'MerchantID'));
      result.error.should.be.true;
      result.errors.should.eql(['MerchantID is required']);
    });

    it('requires MerchantID to be no more than 10 chars', function() {
      required.MerchantID = '1234567890a';
      var result = allPay.validateCheckout(required);
      result.error.should.be.true;
      result.errors.should.eql(['MerchantID exceeds max length 10']);
    });

    it('requires MerchantTradeNo');
    it('requires MerchantTradeNo to be no more than 200 chars');

    it('requires PaymentType');
    it('requires PaymentType to be "aio"');

    it('requires TotalAmount');

    it('requires TradeDesc');
    it('requires TradeDesc to be no more than 200 chars');

    it('requires ItemName');
    it('requires ItemName to be no more than 200 chars');

    it('requires ReturnURL');
    it('requires ReturnURL to be no more than 200 chars');

    it('requires ChoosePayment');
    it('requires ChoosePayment to be one of the supported payment moethods');

  });

  describe('payment methods', function() {
    var allOptions, creditOptions, webAtmOptions, atmOptions, cvsOptions,
        barcodeOptions, alipayOptions, tenpayOptions, allOptional, allKeys;

    beforeEach(function() {
      allOptions = {
        PlatformID: '1234567890',
        ClientBackURL: 'http://takoman.co/client/back/url',
        ItemURL: 'http://takoman.co/item/url',
        Remark: 'Some notes',
        ChooseSubPayment: '',
        OrderResultURL: 'http://takoman.co/order/result/url',
        NeedExtraPaidInfo: 'Y',
        DeviceSource: 'P',
        IgnorePayment: ''
      };
      creditOptions = {
        // CREDIT specific (Non-periodic payments)
        CreditInstallment: '0',
        InstallmentAmount: '0',
        Redeem: 'N',
        UnionPay: '0',
        // CREDIT specific (Periodic payments)
        PeriodAmount: '2000',
        PeriodType: 'M',
        Frequency: '2',
        ExecTimes: '12',
        PeriodReturnURL: 'http://takoman.co/credit/period/return/url'
      };
      webAtmOptions= {};
      atmOptions = {
        ExpireDate: '7',
        PaymentInfoURL: 'http://takoman.co/atm/payment/info/url',
        ClientRedirectURL: 'http://takoman.co/atm/client/redirect/url'
      };
      cvsOptions = {
        Desc_1: 'description 1',
        Desc_2: 'description 2',
        Desc_3: 'description 3',
        Desc_4: 'description 4',
        PaymentInfoURL: 'http://takoman.co/cvs/payment/info/url',
        ClientRedirectURL: 'http://takoman.co/cvs/client/redirect/url'
      };
      barcodeOptions = {
        Desc_1: 'description 1',
        Desc_2: 'description 2',
        Desc_3: 'description 3',
        Desc_4: 'description 4',
        PaymentInfoURL: 'http://takoman.co/barcode/payment/info/url',
        ClientRedirectURL: 'http://takoman.co/barcode/client/redirect/url'
      };
      alipayOptions = {
        AlipayItemName: '醬油#米酒#冰咖啡',
        AlipayItemCounts: '3#4#5',
        AlipayItemPrice: '100#300#25',
        Email: 'customer@takoman.co',
        PhoneNo: '4128775750',
        UserName: '塔克超人'
      };
      tenpayOptions = {
        ExpireTime: '2014/12/10 00:00:01'
      };
      allOptional = _.extend({}, allOptions, creditOptions, webAtmOptions,
        atmOptions, cvsOptions, barcodeOptions, alipayOptions, tenpayOptions);
      allKeys = [
        'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
        'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
        'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
        'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
        'CreditInstallment', 'InstallmentAmount', 'Redeem', 'UnionPay', 'PeriodAmount',
        'PeriodType', 'Frequency', 'ExecTimes', 'PeriodReturnURL', 'ExpireDate',
        'PaymentInfoURL', 'ClientRedirectURL', 'Desc_1', 'Desc_2', 'Desc_3', 'Desc_4',
        'AlipayItemName', 'AlipayItemCounts', 'AlipayItemPrice', 'Email', 'PhoneNo',
        'UserName', 'ExpireTime'
      ];
    });

    describe('ALL', function() {

      it('keeps all the required fields', function() {
        var data, results;
        data = _.extend({}, required, allOptional);
        results = allPay.validateCheckout(data);

        results.should.containEql(required);
      });

      it('discards invalid options', function() {
        var data, optional, results;
        optional = _.extend(allOptions, { InvalidOption: 'This is wrong' });
        data = _.extend({}, required, optional);
        data.should.containEql({ InvalidOption: 'This is wrong' });
        results = allPay.validateCheckout(data);

        results.should.not.have.keys('InvalidOption');
      });

      it('keeps all options except options of credit card', function(){
        var data, results, expected;
        data = _.extend({}, required, allOptional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
          'ExpireDate', 'PaymentInfoURL', 'ClientRedirectURL', 'Desc_1', 'Desc_2',
          'Desc_3', 'Desc_4', 'AlipayItemName', 'AlipayItemCounts', 'AlipayItemPrice',
          'Email', 'PhoneNo', 'UserName', 'ExpireTime');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });

      it('discards options of ignored payment methods', function() {
        var data, results, expected;
        allOptional.IgnorePayment = 'CVS#Alipay#Tenpay#Invalid';
        data = _.extend({}, required, allOptional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
          'ExpireDate', 'PaymentInfoURL', 'ClientRedirectURL', 'Desc_1', 'Desc_2',
          'Desc_3', 'Desc_4');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });

      it('keeps overlapped fields if not all of the payment methods are ignored', function() {
        var data, results, expected;
        allOptions.IgnorePayment = 'ATM';
        allOptional = _.extend({}, allOptions, creditOptions, webAtmOptions,
          atmOptions, cvsOptions, barcodeOptions, alipayOptions, tenpayOptions);
        data = _.extend({}, required, allOptional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
          'PaymentInfoURL', 'ClientRedirectURL', 'Desc_1', 'Desc_2',
          'Desc_3', 'Desc_4', 'AlipayItemName', 'AlipayItemCounts', 'AlipayItemPrice',
          'Email', 'PhoneNo', 'UserName', 'ExpireTime');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });

      it('discards ClientRedirectURL option if it is blank', function() {
        var data, results, expected;
        allOptional.ClientRedirectURL = '';
        data = _.extend({}, required, allOptional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
          'ExpireDate', 'PaymentInfoURL', 'Desc_1', 'Desc_2',
          'Desc_3', 'Desc_4', 'AlipayItemName', 'AlipayItemCounts', 'AlipayItemPrice',
          'Email', 'PhoneNo', 'UserName', 'ExpireTime');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });

    });

    describe('Credit', function() {
      beforeEach(function() {
        required.ChoosePayment = 'Credit';
      });

      it('keeps all the required fields', function() {
        var data, results;

        creditOptions = {};
        data = _.extend({}, required, creditOptions);
        results = allPay.validateCheckout(data);

        results.should.containEql(required);
      });

      it('returns errors if passed in both installment and periodic options', function() {
        var data, results;
        data = _.extend({}, required, _.pick(creditOptions, 'CreditInstallment', 'PeriodAmount'));
        results = allPay.validateCheckout(data);

        results.should.containEql('Can not have both installment and periodic credit card options');
      });

      it('keeps only installment credit card and ALL options besides required fields', function() {
        var data, optional, results, expected;
        optional = _.omit(allOptional, [
          'PeriodAmount', 'PeriodType', 'Frequency', 'ExecTimes', 'PeriodReturnURL'
        ]);
        data = _.extend({}, required, optional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
          'CreditInstallment', 'InstallmentAmount', 'Redeem', 'UnionPay');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });

      it('keeps only periodic credit card and ALL options besides required fields', function() {
        var data, optional, results, expected;
        optional = _.omit(allOptional, [
          'CreditInstallment', 'InstallmentAmount', 'Redeem', 'UnionPay'
        ]);
        data = _.extend({}, required, optional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment',
          'PeriodAmount', 'PeriodType', 'Frequency', 'ExecTimes', 'PeriodReturnURL')
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });
    });

    describe('WebATM', function() {
      beforeEach(function() {
        required.ChoosePayment = 'WebATM';
      });

      it('keeps all the required fields', function() {
        var data, results;
        data = _.extend({}, required, allOptional);
        results = allPay.validateCheckout(data);

        results.should.containEql(required);
      });

      it('keeps only ALL options besides required fields', function() {
        var data, results, expected;
        data = _.extend({}, required, allOptional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 'IgnorePayment');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });
    });

    describe('ATM', function() {
      beforeEach(function() {
        required.ChoosePayment = 'ATM';
      });

      it('keeps all the required fields', function() {
        var data, results;
        data = _.extend({}, required, allOptional);
        results = allPay.validateCheckout(data);

        results.should.containEql(required);
      });

      it('keeps only ATM and ALL options besides required fields and discards IgnorePayment', function() {
        var data, results, expected;
        data = _.extend({}, required, allOptional);
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource',
          'ExpireDate', 'PaymentInfoURL', 'ClientRedirectURL');
        results = allPay.validateCheckout(data);

        results.should.eql(expected);
      });

      it('discards ClientRedirectURL option if it is blank', function() {
        var data, results, expected;
        data = _.extend({}, required, allOptional);
        data.ClientRedirectURL = '';
        expected = _.pick(data,
          'MerchantID', 'MerchantTradeNo', 'MerchantTradeDate', 'PaymentType',
          'TotalAmount', 'TradeDesc', 'ItemName', 'ReturnURL', 'ChoosePayment',
          'PlatformID', 'ClientBackURL', 'ItemURL', 'Remark', 'ChooseSubPayment',
          'OrderResultURL', 'NeedExtraPaidInfo', 'DeviceSource', 
          'ExpireDate', 'PaymentInfoURL');
        results = allPay.validateCheckout(data);

        results.should.not.have.keys('ClientRedirectURL');
        results.should.eql(expected);
      });
    });

    describe('CVS', function() {
      beforeEach(function() {
        required.ChoosePayment = 'CVS';
      });

      it('keeps all the required fields', function() {
        var data, results;
        data = _.extend({}, required, allOptional);
        results = allPay.validateCheckout(data);

        results.should.containEql(required);
      });

      it('keeps only Web ATM options besides required fields');
    });

    describe('BARCODE', function() {
      beforeEach(function() {
        required.ChoosePayment = 'BARCODE';
      });

      it('keeps all the required fields', function() {
        var data, results;
        data = _.extend({}, required, allOptional);
        results = allPay.validateCheckout(data);

        results.should.containEql(required);
      });

      it('keeps only Web ATM options besides required fields');
    });

    //describe('Alipay');
    //describe('Tenpay');
    //describe('TopUpUsed');

  });
});

var AllPay = require('../index');

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

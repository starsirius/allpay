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

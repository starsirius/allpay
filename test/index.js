var AllPay = require('../index');

describe('#genCheckMacValue', function() {
  it('generates correct Check Mac Value', function() {
    var allPay = AllPay({
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

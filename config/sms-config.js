module.exports = () => {
    const smsConfig = {
      // api: 'http://login.bulksmsgateway.in/sendmessage.php?user=subrata&password=12345',
      //api: 'http://www.elitbuzz-me.com/sms/smsapi?api_key=C2003530627b60d5827979.92878775&type=text&contacts={NUMBER}&senderid={Approved Sender ID}&msg={Message Content} ',
      api: 'http://www.elitbuzz-me.com/sms/smsapi?api_key=C2003530627b60d5827979.92878775&type=text&contacts=+971205520163200694&senderid=MAWFOOR&msg=Your Mawfoor Code is'
    };
   return smsConfig;
   };

  module.exports = {
    nodetime: {
      accountKey: 'd703bc30a3cfffdff11ab520ddf0d9022825876f',
      appName : 'All Your Photos'
    },
    sessionSecret : 'a2988-438674-f234a',
    mongoUrl : process.env.MONGOHQ_URL || 'mongodb://R:billion@ec2-54-228-162-49.eu-west-1.compute.amazonaws.com/allyourphotos', // 'mongodb://R:billion@alex.mongohq.com:10053/app6520692',
    baseUrl : "http://" + (process.env.HOST || "dev.allyourphotos.org:3000"),
    facebook: {
        appId: '509552485736388'
      , appSecret: 'f4f302039147fae5d118b42d2a6a0205'
    }
  , twitter: {
        consumerKey: 'LExZl9x9kUAHURF03bu3Yw'
      , consumerSecret: 'F9bGeYRb4BMVerSJjciyuurLKAn9NsID4TgVaP8J0w'
    }
  , github: {
        appId: ''
      , appSecret: ''
    }
  , instagram: {
        clientId: '18a1750a97dd4ecda61a49b08296639e'
      , clientSecret: 'b5801a956aa24e308a00f3e985dfe1e8'
    }
  , foursquare: {
        clientId: ''
      , clientSecret: ''
    }
  , google: {
        clientId: '224794776836-cp3a2v0elt955h9uqhgmskplhg85ljjm.apps.googleusercontent.com'
      , clientSecret: 'rxGFo1mBG_H3DX2ifDFawiMZ'
    }
  , flickr: {
    consumerKey : '246152862e1891230c664f9ef1c7e5f6',
    consumerSecret : 'b970658338c81152'
  }
  , aws: {
    key: process.env.AWS_ACCESS_KEY_ID || 'AKIAJRS4YILKC25PPTEA',
    secret: process.env.AWS_SECRET_ACCESS_KEY || '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',
    bucket: process.env.AWS_S3_BUCKET || 'allyourphotos-eu'
  }
  , dbox: { 
    "app_key": "430zvvgwfjxnj4v", 
    "app_secret": "un2e5d75rkfdeml", 
    root : 'dropbox', 
    scope : 'all'
  }
};

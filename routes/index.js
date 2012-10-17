/*
 * GET home page.
 */


 //TODO: move all routes here..

 
exports.index = function(req, res){

	var dbox  = require("dbox");
	var app   = dbox.app({ "app_key": "430zvvgwfjxnj4v", "app_secret": "un2e5d75rkfdeml" });

	app.requesttoken(function(status, request_token){
		console.log(request_token);
		res.render('index', { title: 'Express', token : request_token });
	});

};
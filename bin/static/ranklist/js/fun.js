function CheckBrowser() {
	/* 
	 * 智能机浏览器版本信息:
	 *
	 */
	var browser = {
		versions: function() {
			var u = navigator.userAgent,
				app = navigator.appVersion;
			return { //移动终端浏览器版本信息 
				trident: u.indexOf('Trident') > -1, //IE内核 
				presto: u.indexOf('Presto') > -1, //opera内核 
				webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核 
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核 
				mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端 
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端 
				android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器 
				iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器 
				iPad: u.indexOf('iPad') > -1, //是否iPad 
				webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部 
			};
		}(),
		language: (navigator.browserLanguage || navigator.language).toLowerCase()

		// document.writeln("语言版本: " + browser.language); 
		// document.writeln(" 是否为移动终端: " + browser.versions.mobile); 
		// document.writeln(" ios终端: " + browser.versions.ios); 
		// document.writeln(" android终端: " + browser.versions.android); 
		// document.writeln(" 是否为iPhone: " + browser.versions.iPhone); 
		// document.writeln(" 是否iPad: " + browser.versions.iPad); 
		// document.writeln(navigator.userAgent);

	}

	if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {
		//window.location = "qrcode.html";
		return 0;
	} else if (browser.versions.android) {
		//window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.withustudy.koudaizikao";
		return 1
	} else {
		//其他默认先去要应用宝
		//window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.withustudy.koudaizikao";
		return 1;
	}
}

function goDownApp(type) {
	switch (type) {
		case 0:
			window.location = "qrcode.html";
			break;
		case 1:
			window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.withustudy.koudaizikao";
			break;
		default:
			window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.withustudy.koudaizikao";
			break;
	}

}

function formatSeconds(value) {
	var theTime = parseInt(value); // 秒
	var theTime1 = 0; // 分
	var theTime2 = 0; // 小时
	if (theTime > 60) {
		theTime1 = parseInt(theTime / 60);
		theTime = parseInt(theTime % 60);
		if (theTime1 > 60) {
			theTime2 = parseInt(theTime1 / 60);
			theTime1 = parseInt(theTime1 % 60);
		}
	}
	var result = "" + parseInt(theTime) + "秒";
	if (theTime1 > 0) {
		result = "" + parseInt(theTime1) + "分" + result;
	}
	if (theTime2 > 0) {
		result = "" + parseInt(theTime2) + "小时" + result;
	}
	return result;
}
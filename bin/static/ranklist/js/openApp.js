var mobileAppInstall = (function() {
	var ua = navigator.userAgent,
		loadIframe,
		win = window;

	function getIntentIframe() {
		if (!loadIframe) {
			var iframe = document.createElement("iframe");
			iframe.style.cssText = "display:none;width:0px;height:0px;";
			document.body.appendChild(iframe);
			loadIframe = iframe;
		}
		return loadIframe;
	}

	function CheckBrowser() {
		/* 
		 * 智能机浏览器版本信息:
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
		}
		if (browser.versions.webApp) {
			return 2;
		} else
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

	function isWeiXin() {
		var ua = window.navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true;
		} else {
			return false;
		}
	}

	function goDownApp(type) {
		switch (type) {
			case 0:
				window.location = "http://share.kdzikao.com/static/share/html/qrcode.html";
				break;
			case 1:
				window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.withustudy.koudaizikao";
				break;
			default:
				window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.withustudy.koudaizikao";
				break;
		}

	}


	var appInstall = {
		timeout: 500,
		/**
		 * 尝试跳转appurl,如果跳转失败，进入h5url
		 * @param {Object} appurl 应用地址
		 * @param {Object} h5url  http地址
		 */
		open: function(appurl, h5url) {

			var t = Date.now();
			appInstall.openApp(appurl);
			setTimeout(function() {
				if (Date.now() - t < appInstall.timeout + 1000) {
					h5url && appInstall.goDown();
				}
			}, appInstall.timeout)
		},
		openApp: function(appurl) {
			//没有处理chrome浏览器
			getIntentIframe().src = appurl;

		},
		openH5: function(h5url) {
			win.location.href = h5url;
		},
		goDown: function() {
			var types = CheckBrowser();
			goDownApp(types);
		},
		gettype: function() {
			return CheckBrowser();
		},
		isWeixin: function() {
			return isWeiXin();
		}
	}
	return appInstall;
})();
function AnalyserUrl(url, IsPrint) {
	var theRequest = new Array(); // {};
	if (url.indexOf("?") != -1) {
		var str = url.substring(1);
		console.log(str);
		strs = str.split("&");
		//strs = str.split("$$$");  //王勇想法修改逻辑
		for (var i = 0; i < strs.length; i++) {
			//			theRequest[strs[i].split("=")[0]] = decodeURI((strs[i].split("=")[1]).split("&")[0]);
			theRequest[theRequest.length] = strs[i].split("=")[0];
			theRequest[theRequest.length] = strs[i].split("=")[1];
		}
	}

	if (IsPrint) {
		var mes = {};
		for (var i in theRequest)
			mes += i + ":" + theRequest[i] + "\n";

		console.log(mes);

	}

	return theRequest;
}
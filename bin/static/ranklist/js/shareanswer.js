//章节答题分享
function ChapterAnswer(url) {
	var IsPrint = arguments[1] ? arguments[1] : false;
	return AnalyserUrl(url, IsPrint);
}

//智能刷题分享
function IntelliAnswer(url) {
	var IsPrint = arguments[1] ? arguments[1] : false;
	return AnalyserUrl(url, IsPrint);
}

//模拟考试-结束
function Simulationtest(url) {
	var IsPrint = arguments[1] ? arguments[1] : false;
	return AnalyserUrl(url, IsPrint);
}

//解析URL
function AnalyserUrl(url, IsPrint) {
	var theRequest = {};
	if (url.indexOf("?") != -1) {
		var str = url.substring(1);
//		strs = str.split("&");
        strs = str.split("$$$");  //王勇想法修改逻辑
		for (var i = 0; i < strs.length; i++) {
			theRequest[strs[i].split("=")[0]] = decodeURI((strs[i].split("=")[1]).split("&")[0]);
		}
	}

	if (IsPrint) {
		var mes = "";
		for (var i in theRequest) mes += i + ":" + theRequest[i] + "\n";
		console.log("\n" + mes);
	}

	return theRequest;
}
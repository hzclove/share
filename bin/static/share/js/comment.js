var url = location.search;
//console.log(url);
var theRequest = AnalyserUrl(url, true);
var type = theRequest[0];
var id = theRequest[1];

var parentId = 0;

console.log(id);

//注释的为测试地址
var article_url ="http://share.kdzikao.com/news/ReturnComment/comment.page";
var article_Posturl ="http://share.kdzikao.com/news/InsertComment/comment.page"; 
var topic_url ="http://share.kdzikao.com/bbs/ReturnComment/comment.page";
var topic_Posturl ="http://share.kdzikao.com/bbs/InsertComment/comment.page";


var pageIndex = 0;

var topicIndex = 1;
var topicSize = 10;

var Article = {
	uid: "",
	articleId: id,
	parentId: 0,
	content: ""
};
var Topic = {
	userid: "",
	reply_id: id, //reply_type==0 帖子的ID
	//reply_type==1 reply_id
	reply_type: 0, //0 回复帖子     1 回复 回复
	content: ""
};

if (type == "topic_id") {
	addtopicComment();
} else if (type == "article_id") {
	addarticleCommnet()
}

function showarticleCommnet() {
	addarticleCommnet();
}

function addtopicComment() {
	$.ajax({
		type: 'get',
		url: topic_url,
		data: {
			topic_id: id,
			pagenum: topicIndex,
			pagecount: topicSize
		},
		dataType: "json",
		success: function(data) {
			if (data.result == "false") {
				if (topicIndex == 1) {
					$('.more').html('快来抢沙发！~');
				} else if (topicIndex > 1) {
					$('.more').html('没有更多评论了');
				}
				return;
			}
			for (var i = 0; i < data.posts.length; i++) {
				var oli = $('<li class="clearfix p-1"></li>');
				$('.commList ').append(oli);

				oimg = $('<img class="headimg" />');
				if(data.posts[i].user_headimg==""){
					oimg.attr('src', "/static/share/img/小袋.png");
				}else{
					oimg.attr('src', data.posts[i].user_headimg);
				}
				
				oimg.appendTo(oli);
				var nametit = $('<div class="nametit"></div>');
				nametit.appendTo(oli);

				var name = $('<span class="f16 color-blue"></span>');
				name.html(data.posts[i].user_name);
				name.appendTo(nametit);

				var floor = $('<span class="fr floor"></span>');
				floor.html(data.posts[i].post_floor + '楼');
				floor.appendTo(nametit);


				nametit.append($('<br/>'));

				var times = $('<span class="color-b9"></span>');
				times.html(stamp(data.posts[i].post_time));
				times.appendTo(nametit);

				var comm = $('<div class="f12 color3" style="word-break: break-all;word-wrap:break-word;"></div>');
				comm.html(data.posts[i].post_text);
				comm.appendTo(oli);
				if (data.posts[i].post_img_count > 0) {
					var commImgbox = $(' <ul id="container" class="clearfix " style="margin: 10px auto;"></ul>');
					commImgbox.appendTo(oli);
					for (var j = 0; j < data.posts[i].post_files.length; j++) {
						//              		console.log(data.posts[i].post_files[j]);
						var imgli = $('<li class="box"></li>');
						imgli.appendTo(commImgbox);

						var commImg = $('<img />');
						commImg.attr('src', data.posts[i].post_files[j]);
						commImg.attr('width', '100%');
						commImg.appendTo(imgli);
					}
				}
				//              <ul id="container" class="clearfix " style="margin: 10px auto;">

				if (data.posts[i].reply_id > 0) {
					var replaycomm = $('<div class="replaycomm mt-2 mb-1"></div>');
					replaycomm.html('回复 ' + data.posts[i].reply_username + ' : ' + data.posts[i].reply_content);
					replaycomm.appendTo(oli);

				}
				var huifu = $('<span class="fr huifu">回复</span>');
				huifu.appendTo(oli);
				var fa = $('<a class="floorid" style="display:none"></a>');
				fa.html(data.posts[i].post_floor);
				fa.appendTo(huifu);
				var fid = $('<a class="articleid" style="display:none"></a>');
				fid.html(data.posts[i].post_id);
				fid.appendTo(huifu);
				//				console.log(data);
			}
		},
		error: {}
	});
}

function addarticleCommnet() {
	$.ajax({
		type: 'get',
		url: article_url,
		data: {
			articleId: id,
			lastIndex: pageIndex
		},
		dataType: "json",
		success: function(data) {
			//		console.log(data);
			if (JSON.stringify(data) == '{}') {
				if (pageIndex == 0) {
					$('.more').html('快来抢沙发！~');
				} else if (pageIndex > 0) {
					$('.more').html('没有更多评论了');
				}
				return;
			}
			for (var i = 0; i < data.comments.length; i++) {
				console.log(data.comments[i]);

				var oli = $('<li class="clearfix p-1"></li>');
				$('.commList ').append(oli);

				oimg = $('<img class="headimg" />');
				if(data.comments[i].profileUrl==""){
					oimg.attr('src', "/static/share/img/小袋.png");
				}else{
					oimg.attr('src', data.comments[i].profileUrl);
				}
//				oimg.attr('src', data.comments[i].profileUrl);
				oimg.appendTo(oli);

				var nametit = $('<div class="nametit"></div>');
				nametit.appendTo(oli);

				var name = $('<span class="f16 color-blue"></span>');
				name.html(data.comments[i].nickname);
				name.appendTo(nametit);

				var floor = $('<span class="fr floor"></span>');
				floor.html(data.comments[i].floorId + '楼');
				floor.appendTo(nametit);


				nametit.append($('<br/>'));


				var times = $('<span class="color-b9"></span>');
				times.html(stamp(data.comments[i].commentTime));
				times.appendTo(nametit);

				var comm = $('<div class="f12 color3"  style="word-break: break-all;word-wrap:break-word;"></div>');
				comm.html(data.comments[i].content);
				comm.appendTo(oli);

				if (data.comments[i].parentId != undefined) {
					var replaycomm = $('<div class="replaycomm mt-2 mb-1"></div>');
					replaycomm.html('回复 ' + data.comments[i].replyName + ' : ' + data.comments[i].replyContent);
					replaycomm.appendTo(oli);
				}

				var huifu = $('<span class="fr huifu">回复</span>');
				huifu.appendTo(oli);
				var fa = $('<a class="floorid" style="display:none"></a>');
				fa.html(data.comments[i].floorId);
				fa.appendTo(huifu);
				var fid = $('<a class="articleid" style="display:none"></a>');
				fid.html(data.comments[i].commentId);
				fid.appendTo(huifu);

			}
		},
		error: function(data) {
			console.log('sss');
		}
	});
}

$("body").on("click", ".more", function() {
	if (type == "topic_id") {
		topicIndex++;
		addtopicComment();
	} else if (type == "article_id") {
		pageIndex = pageIndex + 10;
		addarticleCommnet();
	}
});

$("body").on("click", ".huifu", function() {
	placestr = "回复" + $(this).find('.floorid').html() + "楼：  ";
	parentId = $(this).find('.articleid').html();
	$('.fabiao').parent('div').find('textarea').attr('placeholder', placestr);
	Topic.reply_type = 1;
	Topic.reply_id = parentId;

	Article.parentId = parentId;
});

$("body").on("click", ".pinglun", function() {
	placestr = "我来说两句";
	parentId = 0;
	$('.fabiao').parent('div').find('textarea').attr('placeholder', placestr);
	Topic.reply_type = 0;
	Topic.reply_id = id;

	Article.parentId = 0;
});

$("body").on("click", ".fabiao", function() {
	if (checkCommNull()) {
		return;
	}
	if (type == "topic_id") {
		saveTopic();
		console.log(Topic);
		PostTopic();
	} else if (type == "article_id") {
		saveArticle();
		console.log(Article);
		PostArticle();
	}
	//	$('.fabiao').attr('disabled', 'disabled');

});

function saveTopic() {
	Topic.content = $('#commentTxt').val();
}

function PostTopic() {
	$.ajax({
		type: 'post',
		url: topic_Posturl,
		data: {
			userid: Topic.userid,
			reply_id: Topic.reply_id,
			reply_type: Topic.reply_type,
			content: Topic.content
		},
		dataType: "json",
		success: function(data) {
			console.log(data);
			showSuccess();
		},
		error: function(data) {}
	});
}

function saveArticle() {

	Article.content = $('#commentTxt').val();
}

function PostArticle() {
	$.ajax({
		type: 'post',
		url: article_Posturl,
		data: {
			uid: Article.uid,
			articleId: Article.articleId,
			parentId: Article.parentId,
			content: Article.content,
		},
		dataType: "json",
		success: function(data) {
			console.log(data);
			showSuccess();

		},
		error: function(data) {}
	});
}

function showSuccess() {
	$('.showSuccess').show();
	var time = setTimeout(function() {

		$('.showSuccess').hide();
	}, 1500);
	$('#commentTxt').val('');
}

function checkCommNull() {
	if ($('#commentTxt').val() == '') {
		$('.showSuccess').html('评论内容不能为空！');
		showSuccess();
		return true;
	} else {
		$('.showSuccess').html('发表成功');
	}
	return false;
}

function stamp(str) {
	returnstr = "";
	var commdate = getLocalTime(str);
	var mydate = new Date();
//	console.log(timestr);
	if (commdate.getFullYear() > mydate.getFullYear()) {
		return commdate.getFullYear() - mydate.getFullYear() + "年前";
	} else if ((commdate.getMonth() + 1) > (mydate.getMonth() + 1)) {
		return (commdate.getMonth() + 1) - (mydate.getMonth() + 1) + "月前";
	} else if (commdate.getDay() > mydate.getDay()) {
		return commdate.getDay() - mydate.getDay() + "天前";
	} else if (commdate.getHours() > mydate.getHours()) {
		return commdate.getHours() - mydate.getHours() + "小时前";
	} else if (commdate.getMinutes() > mydate.getMinutes()) {
		return commdate.getMinutes() - mydate.getMinutes() + "分钟前";
	}
	//	if(timestr.substr(0,4)>mydate.getFullYear()){
	//		returnstr=timestr.substr(0,4)-mydate.getFullYear()+"年前";
	//	}
	//	if(timestr.substr(5,2)>(mydate.getMonth()+1)){
	//		returnstr=timestr.substr(5,2)-(mydate.getMonth()+1)+"月前";
	//	}
//	console.log(mydate);
	return "刚刚";
}

//function getLocalTime(nS) {
//	return new Date(parseInt(nS)).toLocaleString().substr(0, 17)
//}

function getLocalTime(nS) {
	return new Date(parseInt(nS));
	//	return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}
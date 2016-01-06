/**
 * Created by 茜 on 2015/5/6.
 */
window.onload = function() {
    console.log("文档加载完毕");
    imgLocation("container", "box");

    //     window.onscroll=function(){
    //         var imgData={"data":[{"src":"16.jpg"},{"src":"17.jpg"},{"src":"18.jpg"},
    //             {"src":"22.jpg"},{"src":"21.jpg"},{"src":"20.jpg"},{"src":"19.jpg"}]};
    //         if(checkFlag()){
    //             var cparent=document.getElementById("container");
    //             try {
    //                 for (var i = 0; i < imgData.data.length; i++) {
    //                     var ccontent = document.createElement("div");
    //                     ccontent.className = "box";
    //                     cparent.appendChild(ccontent);
    //                     var boximg = document.createElement("div");
    //                     boximg.className = "box_img";
    //                     ccontent.appendChild(boximg);
    //                     var img = document.createElement("img");
    //                     img.src = "img/" + imgData.data[i].src;
    //                     boximg.appendChild(img);
    //                 }
    //             }catch(err)
    //             {
    //                 alert(err);
    //             }
    //             imgLocation("container","box");
    //         }

    //     }



}

function checkFlag() {
    var cparent = document.getElementById("container");
    var ccontent = getchildElement(cparent, "box");
    var lastContentHeight = ccontent[ccontent.length - 1].offsetTop;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var pageHeight = document.documentElement.clientHeight || document.body.clientHeight;
    if (lastContentHeight < scrollTop + pageHeight) {
        return true;
    }
}

function imgLocation(parent, content) {

    console.log("开始加载资源");
    //将parent下所有的content取出
    var cparent = document.getElementById(parent);
    var ccontent = getchildElement(cparent, content);
    if(ccontent.length==1){
    	ccontent[0].style.width="100%";
    	return;
    }
    if(ccontent.length==2){
    	ccontent[0].style.width="50%";
    	ccontent[1].style.width="50%";
    	return;
    }
    var imgWidth = ccontent[0].offsetWidth;
    var num = Math.floor(document.documentElement.clientWidth / imgWidth);
    cparent.style.cssText = "width" + imgWidth * num + "px;margin:10px auto";

    var BoxHeightArr = [];
    for (var i = 0; i < ccontent.length; i++) {
        if (i < num) {
            BoxHeightArr[i] = ccontent[i].offsetHeight;
        } else {
            var minHeight = Math.min.apply(null, BoxHeightArr);
            var minIndex = getminheightLocation(BoxHeightArr, minHeight);
            ccontent[i].style.position = "absolute";
            ccontent[i].style.top = minHeight + "px";
            ccontent[i].style.left = ccontent[minIndex].offsetLeft + "px";
            BoxHeightArr[minIndex] = BoxHeightArr[minIndex] + ccontent[i].offsetHeight;
            cparent.style.height = BoxHeightArr[minIndex]+50+"px";
        }

        //淡出效果
        // $("ccontent[i]").fadeIn(10000);
    }

    // setInterval(function(){//setTimeout
    //   starta();
    // },500);

    // setInterval(function(){//setTimeout
    //   stopa();
    // },1500);

}

function getminheightLocation(BoxHeightArr, minHeight) {
    for (var i in BoxHeightArr) {
        if (BoxHeightArr[i] == minHeight) {
            return i;
        }
    }
}

function getchildElement(parent, content) {
    var contentArr = [];
    var allcontent = parent.getElementsByTagName("*");
    for (var i = 0; i < allcontent.length; i++) {
        if (allcontent[i].className == content) {
            contentArr.push(allcontent[i]);
        }
    }
    return contentArr;
}


function starta() {
    rotation = ['flipped-vertical-bottom', 'flipped-vertical-top', 'flipped-horizontal-left', 'flipped-horizontal-right'];
    //随机开始一个已经停止的动画
    var lstart = $('.box_img img').length;
    if (lstart > 0) {
        var random = Math.floor(Math.random() * (lstart));
        var item = $('.box_img img');
        ran = Math.floor(Math.random() * (3 - 0 + 1));
        animation = rotation[ran];
        item.eq(random).addClass('animated ' + animation);
    }

}

function stopa() {
    //随机结束一个已经开始的动画
    var lstop = $('.animated').length;
    if (lstop) {
        var random = Math.floor(Math.random() * (lstop));
        var item = $('.animated');
        var divstop = item[random].id;
        clearClass(item.eq(random));
    }
}

function clearClass(obj) {
    if (obj.hasClass('animated') == true) obj.removeClass('animated');
    if (obj.hasClass('flipped-horizontal-righ') == true) obj.removeClass('flipped-horizontal-righ');
    if (obj.hasClass('flipped-horizontal-left') == true) obj.removeClass('flipped-horizontal-left');
    if (obj.hasClass('flipped-horizontal-top') == true) obj.removeClass('flipped-horizontal-top');
    if (obj.hasClass('flipped-horizontal-bottom') == true) obj.removeClass('flipped-horizontal-bottom');
}

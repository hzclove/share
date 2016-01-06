#!/usr/bin/python
# -*- coding: utf8 -*-


import os
import time,datetime
import MySQLdb
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import json
import urllib2, urllib
from tornado.concurrent import run_on_executor
from concurrent.futures import ThreadPoolExecutor
import sys
reload(sys)
sys.setdefaultencoding('utf8')

from tornado.options import define, options
define("port", default=8200, help="run on the given port", type=int)

ExecutorNum = 100
bbs_db = ['10.51.111.18', 3306, 'bbs', 'work', 'work', 'utf8mb4']
study_db = ['10.44.151.140', 3306, 'study', 'work', 'work', 'utf8mb4']
course_db = ['10.51.111.18', 3306, 'course', 'work', 'work', 'utf8']

#根据user_id获取user_name
def fetch_user_name(user_id):
    global study_db
    if not 'user_id':
        return ''
    try:
        db_conn = MySQLdb.connect(host=study_db[0], port=study_db[1], db=study_db[2], user=study_db[3], passwd=study_db[4], charset=study_db[5])
        db_conn.unicode_literal.charset = 'utf8'
        db_conn.string_decoder.charset = 'utf8'
        db_cursor = db_conn.cursor()
    except MySQLdb.Error, e:
        print 'mysql exception %d: %s' %(e.args[0], e.args[1])
        return ''
    user_name = ''
    try:
        if db_cursor.execute('select nickname from account where uid="%s"' %(user_id)) == 0:
            raise MySQLdb.Error(-1, 'user_id %s is not exist in account' %(user_id))
        user_name = db_cursor.fetchall()[0][0].encode('utf8')
    except MySQLdb.Error, e:
        print 'mysql exception %d: %s' %(e.args[0], e.args[1])
    db_conn.commit()
    db_cursor.close()
    db_conn.close()
    return user_name


class BBSShareHandler(tornado.web.RequestHandler):
    '''社区帖子分享页面 /bbs/share.page?topic_id='''
    global ExecutorNum, bbs_db
    executor = ThreadPoolExecutor(ExecutorNum)

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        print 'uri: ' + self.request.uri
        topic_id = str(self.get_argument('topic_id'))
        topic_info = yield self.__get_topic_info__(topic_id)
        self.render('share.html', pub_date=topic_info[0], author=topic_info[1], title=topic_info[2], content_list=topic_info[3])

    @run_on_executor
    def __get_topic_info__(self, topic_id):
        topic_info = ['', '', '', ''] #date,author,title,content
        try:
            db_conn = MySQLdb.connect(host=bbs_db[0], port=bbs_db[1], db=bbs_db[2], user=bbs_db[3], passwd=bbs_db[4], charset=bbs_db[5])
            db_conn.unicode_literal.charset = 'utf8'
            db_conn.string_decoder.charset = 'utf8'
            db_cursor = db_conn.cursor()
        except MySQLdb.Error, e:
            print 'mysql exception %d: %s' %(e.args[0], e.args[1])
            return topic_info
        try:
            if db_cursor.execute('select pub_time,user_id,title,content,images from topics where topic_id=%s' %(topic_id)) == 0:
                raise MySQLdb.Error(-1, 'topic_id is not exist in bbs')
            record = db_cursor.fetchall()[0]
            pub_time = 0 if not record[0] else record[0]
            user_id = '' if not record[1] else record[1].encode('utf8').strip()
            title = '' if not record[2] else record[2].encode('utf8').strip()
            content = '' if not record[3] else record[3].encode('utf8').strip()
            images = '' if not record[4] else record[4].encode('utf8').strip()
            topic_info[0] = time.strftime("%Y年%m月%d日",time.localtime(pub_time))
            topic_info[1] = fetch_user_name(user_id)
            topic_info[2] = title
            #社区的图片是放在正文底部的, 需要解析和替换为html标签
            content_list = []
            for pt in content.split('\n'):
                pt = pt.strip()
                if not pt:
                    continue
                content_list.append((pt, 0))
            if images:
                content_list.append(([('' if im.startswith('http://') else 'http://') + im for im in images.strip().split(',')], 2))
            topic_info[3] = content_list
        except MySQLdb.Error, e:
            print 'mysql exception %d: %s' %(e.args[0], e.args[1])
        db_conn.commit()
        db_cursor.close()
        db_conn.close()
        return topic_info


class NEWSShareHandler(tornado.web.RequestHandler):
    '''资讯帖子分享页面 /news/share.page?article_id='''
    global ExecutorNum, study_db
    executor = ThreadPoolExecutor(ExecutorNum)

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        print 'uri: ' + self.request.uri
        article_id = str(self.get_argument('article_id'))
        article_info = yield self.__get_article_info__(article_id)
        #content_list是个list, 每个元素的格式为(data, flag), 其中flag=0表示data为文本, flag=1表示data为图片链接的集合
        self.render('share.html', pub_date=article_info[0], author=article_info[1], title=article_info[2], content_list=article_info[3])

    @run_on_executor
    def __get_article_info__(self, article_id):
        article_info = ['', '', '', ''] #date,author,title,content
        try:
            db_conn = MySQLdb.connect(host=study_db[0], port=study_db[1], db=study_db[2], user=study_db[3], passwd=study_db[4], charset=study_db[5])
            db_conn.unicode_literal.charset = 'utf8'
            db_conn.string_decoder.charset = 'utf8'
            db_cursor = db_conn.cursor()
        except MySQLdb.Error, e:
            print 'mysql exception %d: %s' %(e.args[0], e.args[1])
            return article_info
        try:
            #获取咨询date,author,title,content
            if db_cursor.execute('select unix_timestamp(createdTime),author,instruction,content from news_basic,news_detail \
                where (news_basic.articleId=news_detail.id and articleId=%s)' %(article_id)) == 0:
                raise MySQLdb.Error(-1, 'article_id is not exist in news')
            record = db_cursor.fetchall()[0]
            pub_time = 0 if not record[0] else record[0]
            author = '' if not record[1] else record[1].encode('utf8').strip()
            title = '' if not record[2] else record[2].encode('utf8').strip()
            content = '' if not record[3] else record[3].encode('utf8').strip()
            article_info[0] = time.strftime("%Y年%m月%d日",time.localtime(pub_time))
            article_info[1] = author
            article_info[2] = title
            #资讯的图片是穿插在正文中的, 需要解析和替换为html标签
            content_list = []
            for pt in content.split('\n'):
                pt = pt.strip()
                if not pt:
                    continue
                pic_list = []
                while True:
                    start, end = pt.find('<$'), pt.find('$>')
                    if start < 0 or end < 0:
                        if pic_list:
                            content_list.append((pic_list, 1))
                            pic_list = []
                        content_list.append((pt, 0))
                        break
                    if start > 0:
                        if pic_list:
                            content_list.append((pic_list, 1))
                            pic_list = []
                        content_list.append((pt[:start], 0))                    
                    pic_url = pt[start+2:end].strip()
                    if pic_url:
                        pic_url = ('' if pic_url.startswith('http://') else 'http://') + pic_url
                        pic_list.append(pic_url)
                    pt = pt[end+2:]
            article_info[3] = content_list
        except MySQLdb.Error, e:
            print 'mysql exception %d: %s' %(e.args[0], e.args[1])
        db_conn.commit()
        db_cursor.close()
        db_conn.close()
        return article_info


class APPShareHandler(tornado.web.RequestHandler):
    '''app下载页面分享 /app/share.page'''
    global ExecutorNum
    executor = ThreadPoolExecutor(ExecutorNum)
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        print 'uri: ' + self.request.uri
        advertise = str(self.get_argument('advertise',''))
        yield self.__add_channel__(advertise)
        self.redirect(self.request.uri.replace('/app/share.page', '/static/share/html/share-downApp.html'))

    @run_on_executor
    def __add_channel__(self,advertise):
        global study_db
        try:
            db_conn=MySQLdb.connect(host=study_db[0], port=study_db[1], db=study_db[2], user=study_db[3], passwd=study_db[4], charset=study_db[5])
            db_conn.unicode_literal.charset = 'utf8'
            db_conn.string_decoder.charset = 'utf8'
            db_cursor=db_conn.cursor()
        except MySQLdb.Error, e:
            return {'result': 'false', 'msg': e.args[1]}
        try:
            timeArray=time.localtime(time.mktime(datetime.datetime.now().timetuple()))
            otherStyleTime = time.strftime("%Y-%m-%d %X", timeArray)
            db_cursor.execute('insert into Channel values(null,"%s","%s")'\
                % (MySQLdb.escape_string(advertise),MySQLdb.escape_string(otherStyleTime)))
            result_info={'result':'true','msg':'insert data success'}
        except MySQLdb.Error, e:
            result_info = {'result': 'false', 'msg': e.args[1]}
        db_conn.commit()
        db_cursor.close()
        db_conn.close()
        return result_info

class COURSEShareHandler(tornado.web.RequestHandler):
    '''course分享页面 /course/share.page?course_id='''
    global ExecutorNum
    executor = ThreadPoolExecutor(ExecutorNum)
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        course_id = self.get_argument('course_id', '').strip()
        course_info = yield self.__get_course_info__(course_id)
        #对课程分享页进行渲染
        self.render('CourseShare.html', title=course_info[0], images=course_info[1])

    @run_on_executor
    def __get_course_info__(self, course_id):
        global course_db
        course_info = ['', []] #title,images
        #链接数据库
        try:
            course_conn=MySQLdb.connect(host=course_db[0], port=course_db[1], db=course_db[2], user=course_db[3], passwd=course_db[4], charset=course_db[5])
            course_conn.unicode_literal.charset = 'utf8'
            course_conn.string_decoder.charset = 'utf8'
            course_cursor=course_conn.cursor()
        except MySQLdb.Error, e:
            print 'mysql exception %d: %s' %(e.args[0], e.args[1])
            return course_info
        #查询课程名，以及课程介绍图片链接
        try:
            course_cursor.execute('select course_name, intro from course_info where course_id="%s"' % (course_id))
            record = course_cursor.fetchall()[0]
            title = '' if not record[0] else record[0]
            images ='' if not record[1] else record[1]
            course_info[0] = title
        #对图片链接进行分割，列表形式存储
            image_list = list(images.split(';'))
            course_info[1] = image_list
        except MySQLdb.Error, e:
            print 'mysql exception %d: %s' %(e.args[0], e.args[1])
        course_conn.commit()
        course_cursor.close()
        course_conn.close()           
        return course_info

class ExtensionAddHandler(tornado.web.RequestHandler):
    '''推广渠道统计接口 prompt/add.page'''
    global ExecutorNum
    executor = ThreadPoolExecutor(ExecutorNum)
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def post(self):
        print 'uri: ' + self.request.uri
        print self.request.headers["User-Agent"]
        addressUrl = str(self.get_argument('address'))
        extensionType = str(self.get_argument('type'))
        result_info = yield self.__add_extension__(addressUrl,extensionType)
        self.write(json.dumps(result_info))
        self.finish()

    @run_on_executor
    def __add_extension__(self,addressUrl,extensionType):
        global study_db
        try:
            db_conn = MySQLdb.connect(host=study_db[0], port=study_db[1], db=study_db[2], user=study_db[3], passwd=study_db[4], charset=study_db[5])
            db_conn.unicode_literal.charset = 'utf8'
            db_conn.string_decoder.charset = 'utf8'
            db_cursor = db_conn.cursor()
        except MySQLdb.Error, e:
            return {'result': 'false', 'msg': e.args[1]}        
        try:
            db_cursor.execute('insert into ExtensionUrl values (null,"%s","%s",unix_timestamp())'\
                % (MySQLdb.escape_string(addressUrl),MySQLdb.escape_string(extensionType)))
            result_info={'result':'true','msg':'insert data success'}
        except MySQLdb.Error, e:
            result_info = {'result': 'false', 'msg': e.args[1]}
        db_conn.commit()
        db_cursor.close()
        db_conn.close()
        return result_info


class BrushSummaryPageHandler(tornado.web.RequestHandler):
    ''' 刷题结果页的分享页面, 目前是直接跳转到对应的H5页面
        ChapterAnswer 章节答题一节总汇页面
        IntelliAnswer 智能刷题一节总汇页面
        Simulationtest 模拟考试结束页面
        RankingList 章节答题排行榜页面
        SimulationList 模考排行榜页面
    '''
    def get(self, input):
        print 'uri: ' + self.request.uri
        self.redirect(self.request.uri.replace('/%s/share.page' %(input), '/static/ranklist/html/%s.html' %(input)))


class BrushWelcomeHandler(tornado.web.RequestHandler):
    ''' 网页刷题的分享页面, 目前是直接跳转到对应的H5页面, 由H5页面发起给broker的请求 /brush/share.page?subjectid='''
    def get(self):
    	sub_id = str(self.get_argument('subjectid',''))
        self.redirect('/static/brush/html/start.html?subjectid=%s' %(sub_id))

class BrushDoingHandler(tornado.web.RequestHandler):
    def get(self):
        sub_id = str(self.get_argument('subjectId',''))
        request = urllib2.Request("http://m.kdzikao.com/exercise/webBrush")
        request.add_header('Content-Type', 'application/json')
        try:
            response = urllib2.urlopen(request, json.dumps({'subjectId':sub_id})).read()
        except urllib2.URLError, e:
            print 'urllib2.URLError: %s subjectid:%s' % (e.reason, sub_id)
            #todo
        self.write(response)
        self.finish()


class NewsCommentHandler(tornado.web.RequestHandler):
    '''资讯分享帖子的获取评论/news/ReturnComment/comment.page?articleId=&lastIndex=
       资讯分享帖子评论/news/InsertComment/comment.page     post请求
    '''
    global ExecutorNum
    executor = ThreadPoolExecutor(ExecutorNum)

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self, input):
        article_id = self.get_argument('articleId', '0')
        lastIndex = self.get_argument('lastIndex', '0')
        if input == 'ReturnComment':
            result_info = yield self._news_return_comment_(article_id, lastIndex) 
        else:
            result_info = {'result': 'false', 'msg': 'invalid method %s' %(input)}
        self.write(result_info)
        self.finish()

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def post(self, input):
        user_id = self.get_argument('uid', '')
        parent_id = self.get_argument('parentId', '0')
        article_id = self.get_argument('articleId', '0')
        content = self.get_argument('content', '')
        if input == 'InsertComment':
            result_info = yield self._news_insert_comment_(user_id, parent_id, article_id, content)
        else:
            result_info = {'result': 'false', 'msg': 'invalid method %s' %(input)}
        self.write(result_info)
        self.finish()



    @run_on_executor
    def _news_return_comment_(self, article_id, lastIndex):
        url = "http://m.kdzikao.com/news/get_comment_news?articleId=%s&lastIndex=%s" % (article_id, lastIndex)
        request = urllib2.Request(url)
        request.add_header('Content-Type', 'application/json')
        try:
            response = urllib2.urlopen(request).read()
        except urllib2.URLError, e:
            print 'urllib2.URLError: %s article_id:%s' % (e.reason, article_id)
        return response

    @run_on_executor
    def _news_insert_comment_(self, user_id, parent_id, article_id, content):
        url = "http://m.kdzikao.com/news/post_comment_news"
        request = urllib2.Request(url)
        request.add_header('Content-Type', 'application/json')
        try:
            response = urllib2.urlopen(request, json.dumps({'uid': user_id, 'parentId': parent_id, 'articleId': article_id, \
                'content': content})).read()
        except urllib2.URLError, e:
            print 'urllib2.URLError: %s article_id:%s' % (e.reason, article_id)
        return response

class BBSCommentHandler(tornado.web.RequestHandler):
    '''社区获取分享帖子评论信息 /bbs/ReturnComment/comment.page?userid=&topic_id=&pagenum=&pagecount=
       评论社区分享的帖子 /bbs/InsertComment/comment.page  post请求
    '''
    global ExecutorNum
    executor = ThreadPoolExecutor(ExecutorNum)

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self, input):
    	user_id = self.get_argument('userid', '')
    	topic_id = self.get_argument('topic_id', '')
    	pagenum = self.get_argument('pagenum', '')
    	pagecount = self.get_argument('pagecount', '')
    	if input == 'ReturnComment':
    		result_info = yield self._bbs_return_comment_(user_id, topic_id, pagenum, pagecount)
    	else:
    		result_info = {'result': 'false', 'msg': 'invalid method %s' %(input)}
    	self.write(result_info)
    	self.finish()

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def post(self, input):
        user_id = str(self.get_argument('userid', ''))
        reply_id = self.get_argument('reply_id', '')
        reply_type = self.get_argument('reply_type', '')
        content = str(self.get_argument('content', ''))
        filenames = self.get_argument('filenames', '')
        if input == 'InsertComment':
            result_info = yield self._bbs_insert_comment_(user_id, reply_id, reply_type, content, filenames)
        else:
            result_info = {'result': 'false', 'msg': 'invalid method %s' %(input)}
        self.write(result_info)
        self.finish()


    @run_on_executor
    def _bbs_return_comment_(self, user_id, topic_id, pagenum, pagecount):
        url = 'http://bbs.kdzikao.com/forumTopicReplyApi/list/bbs.page?userid=%s&topic_id=%s&pagenum=%s&pagecount=%s' % \
            (user_id, topic_id, pagenum, pagecount)
        request = urllib2.Request(url)
        request.add_header('Content-Type', 'application/json')
        try:
            response = urllib2.urlopen(request).read()
        except urllib2.URLError, e:
           print 'urllib2.URLError: %s userid:%s' % (e.reason, user_id)
        return response

    @run_on_executor
    def _bbs_insert_comment_(self, user_id, reply_id, reply_type, content, filenames):
        url = 'http://bbs.kdzikao.com/forumTopicReplyApi/add/bbs.page?userid=%s&reply_id=%s&reply_type=%s&content=%s&filenames=%s' \
            % (user_id, reply_id, reply_type, urllib.quote(content), filenames)
        request = urllib2.Request(url)
        request.add_header('Content-Type', 'application/json')
        try:
            response = urllib2.urlopen(request).read()
            result_info = json.loads(response)
        except urllib2.URLError, e:
           print 'urllib2.URLError: %s userid:%s' % (e.reason, user_id)
        return response


if __name__ == '__main__':
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[
            (r'/bbs/share.page', BBSShareHandler),
            (r'/news/share.page', NEWSShareHandler),
            (r'/app/share.page', APPShareHandler),
            (r'/course/share.page', COURSEShareHandler),
            (r'/prompt/add.page', ExtensionAddHandler),
            (r'/(ChapterAnswer|IntelliAnswer|Simulationtest|RankingList|SimulationList)/share.page', BrushSummaryPageHandler),
            (r'/brush/share.page', BrushWelcomeHandler),
            (r'/brush/doing.page', BrushDoingHandler),
            (r'/news/(ReturnComment|InsertComment)/comment.page', NewsCommentHandler),
            (r'/bbs/(ReturnComment|InsertComment)/comment.page', BBSCommentHandler),
        ],
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static")
    )

    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

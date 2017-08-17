/**
 *	DommyJS通用框架
 *	需要jQuery环境，需要加载blueimp-md5.js，需配合DommyPHP框架使用    /DommyPHP/resource/js/DommyJS.js
 *	v 2.0
 **/



 /**** 核心对象 Dommy ****/

(function(window, undefined){
	var d = {};

	d.version = '2.0.1';

	//设置
	d.option = {
		debug : true,	//debug开关
		viewport : [640,1366],	//PC/Pad/Mobile分界点
		hash : {	//hash路由器预设
			sep : '/',		//hash分隔符
			dft : 'index',	//默认的url hash，当hash路径为空时自动跳转到此
			role : {		//路由规则类默认参数
				name : 'index',

			}
		},	
		outdata : {		//后台默认输出数据格式
			_STATU_ : 'SUCCESS',
			_TITLE_ : 'Undefined Operation',
			_INFO_ : 'Undefined Operation',
			_ERRORS_ : [],
			_ERRORCODE_ : 0,
			_TPL_ : '',
			_DATA_ : null,
			_CALLBACK_ : '',
			_HTML_ : ''
		},
		/*host : {		//host信息
			protocol : 'http',
			domain : 'qrcygl.com',
			resource : 'res'
		},*/
		events : [		//定义的事件类型
			'load','ready','error','unload','resize','scroll','focus','blur','focusin','focusout',
			'change','select','submit','keydown','keypress','keyup','toggle','hover',
			'click','dblclick','contextmenu','mouseenter','mouseleave','mouseover','mouseout','mousedown','mouseup',
			'touchstart','touchmove','touchend'
		],
		until : 100,	//条件回调方法中检查条件是否成立的时间间隔
		ajax : {		//ajax预设
			cache : false,
			async : true,
			processData : true,		//是否自动转换传入的data数据形式
			dataType : 'json',
			type : 'GET',	// POST/GET
			data : {}
		},
		notice : {
			interval : 60*1000		//通知中心，检查通知的频率，毫秒
		},
		ui : {		//ui预设
			interval : 10,		//jQuery.fx.interval默认值
			dura : {xxs : 10, xs : 50, s : 100, m : 200, l : 300, xl : 500, xxl : 800, xxxl : 2000 },	//动画时长
			easings : [/*'linear','swing',*/'Quad','Cubic','Quart','Quint','Expo','Sine','Circ','Elastic','Back','Bounce'],
			easingtype : ['In','Out','InOut'],
			easingdefault : [2,1],
			easing : function(){
				var _es = d.option.ui.easings,
					_et = d.option.ui.easingtype,
					_ed = d.option.ui.easingdefault;
				return 'ease'+_et[_ed[1]]+_es[_ed[0]];
			},
			mask : {

			},
			pop : {
				caller : null,
				evt : null,
				off : null,
				w : 160,
				h : 320
			},
			dialog : {
				types : {
					info : {icon:'info-circle', bgc:'cyan', ctrl:['ok'], ani:'bounceIn'},
					question : {icon:'question-circle', bgc:'blue', ctrl:['yes','no'], ani:'bounceIn'},
					warning : {icon:'warning', bgc:'yellow', ctrl:['ok'], ani:'bounceIn'},
					error : {icon:'times-circle', bgc:'red', ctrl:['ok'], ani:'shake'},
					success : {icon:'check-circle', bgc:'fruit', ctrl:['ok'], ani:'bounce'}
				},
				btns : {
					ok : ['确定','cyan','check'],
					yes : ['确定','cyan','check'],
					no : ['取消','red','remove']
				},
				option : {
					w : 728,
					h : 320,
					type : 'info',	// info/question/notice/error/success
					title : 'DommyJS对话框',
					info : '对话框详情'
				}
			}
		},
		com : {}
	};
	//写入用户设置
	d.setOption = function(opt){
		if(d.is(opt,'Object')){
			d.option = d.extend(d.option, opt);
			//处理com组件预设参数
			var cf = d.option.com;
			var cfg = null;
			for(var i in cf){
				if(d.is(d.com[i],'Function') && d.is(cf[i],'Object') && !d.is.empty(cf[i])){
					cfg = d.com[i].config;
					if(!d.is(cfg,'Object')){
						cfg = {};
					}
					d.com[i].config = d.extend(cfg, cf[i]);
				}
			}
		}
	}


	//is
	d.is = function(obj, type){ 
		return (type === 'Null' && obj === null) || 
			(type === 'Undefined' && obj === void 0 ) || 
			(type === 'Number' && isFinite(obj)) || 
			Object.prototype.toString.call(obj).slice(8,-1) === type; 
	};
	$.each(['Undefined','Null','Object','Array','Function','Boolean','String','Number'],function(i,v){
		d.is[v] = function(obj){
			return d.is(obj, v);
		}
	});
	d.is.$ = function(obj){return obj instanceof jQuery;}
	d.is.dom = (typeof HTMLElement === 'object') ? 
		function(obj){return obj instanceof HTMLElement;} : 
		function(obj){return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';};
	d.is.oa = function(obj){return d.is(obj,'Object') || d.is(obj,'Array');}
	d.is.empty = function(obj){
		if(d.is(obj,'Undefined') || d.is(obj,'Null')){return true;}
		if(d.is(obj,'Array') && obj.length<=0){return true;}
		if(d.is(obj,'Object')){return jQuery.isEmptyObject(obj);}
		return false;
	}


	//调用jquery构造器
	d.$ = function(obj){
		if(d.is.empty(obj)){return false;}
		if(d.is.$(obj)){return obj;}
		if(d.is.dom(obj)){return $(obj);}
		if(d.is(obj,'String')){
			if(obj.indexOf('#')!=0 && obj.indexOf('.')!=0){
				if(['html','head','body','window','document'].indexOf(obj)<0){
					return $('#'+obj);
				}
			}
			return $(obj);
		}
		if(d.is(obj,'Array') || d.is(obj,'Object')){
			var os = [],
				o = null;
			for(var i in obj){
				o = d.$(obj[i]);
				if(o!=false){os[i] = o;}
			}
			return d.is.empty(os) ? false : os;
		}
		return false;
	}


	//browser
	d.browser = {
		supportHashchange : function(){return typeof window.onhashchange != 'undefined';},
		isPC : function(){return $(window).width()>=d.option.viewport[1];},
		isPad : function(){return $(window).width()>d.option.viewport[0] && $(window).width()<d.option.viewport[1];},
		isMobile : function(){return $(window).width()<=d.option.viewport[0];}
	};


	//page	seo数据
	d.page = {
		otitle : null,
		title : function(tit){
			if(d.is(tit,'Undefined')){
				return $('title').html();
			}else{
				if(tit=='_original_'){
					return $('title').html(d.page.otitle);
				}else{
					if(d.page.otitle==null){d.page.otitle = $('title').html();}
					return $('title').html(tit);
				}
				
			}
		}
	};


	//host/url/nav
	d.host = function(){return window.location.href.split('://')[0]+'://'+window.location.href.split('://')[1].split('/')[0];}
	d.url = function(u){return typeof u == 'undefined' ? d.host() : (u.indexOf('://')<0 ? d.host()+'/'+u : u);}
	d.nav = {
		menus : []
	};
	d.hash = {	//hash路由器
		//role 路由规则类
		role : function(opt){
			
		},
		//当前页面路由表
		roles : {
			index : function(){alert('这是默认规则');}
		},
		addrole : function(hash, func){

		},
		//解析hash
		parse : function(callback){
			var hash = window.location.hash;
			if(hash==''){
				d.hash.go(d.option.hash.dft);
			}else{
				var hasharr = hash.split(d.option.hash.sep);

			}
			
		},
		//go
		go : function(hash){
			if(d.is(hash,'String') && hash!=''){
				if(hash.indexOf('#')<0){
					window.location.href = '#'+d.option.hash.sep+hash;
				}else{
					window.location.href = hash;
				}
			}
		},
		//hashchange
		change : function(){return d.hash.parse();},
		//开始监听
		start : function(callback){
			if(d.browser.supportHashchange()){
				window.onhashchange = window.DommyJS.hash.change;
				//解析初始hash
				d.hash.parse(callback);
			}else{
				alert("no hashchange support!");
			}
		}
	};


	//ajax加载数据，处理返回数据
	d.ajax = function(url,callback,data,options){
		url = d.ajax.url(url);
		var cb = function(dt){return d.ajax.parse(dt,callback);}
		return window.DommyJS.AJAX.Load(url,cb,data,options);
	}
	d.ajax.url = function(u){
		u = d.url(u);
		return u.indexOf('?')<0 ? u+='?format=json' : u+='&format=json';
	}
	d.ajax.parse = function(data,callback){
		var od = d.option.outdata;	//默认DommyPHP框架返回的json数据格式
		var pd = null;
		if(d.is(data,'Object') && !d.is(data._STATU_,'Undefined')){
			pd = d.extend(od,data);
		}else{
			pd = od;
			pd._DATA_ = data;
		}
		if(pd._STATU_=='ERROR'){
			window.DommyJS.ui.dialog.open({
				type : 'error',
				title : pd._TITLE_,
				info : 'ErrorCode&nbsp;&nbsp;&nbsp;<span class="-fw -black">'+parseInt(pd._ERRORCODE_)+'</span><br><br>'+pd._INFO_
			});
		}else{
			if(d.is(callback,'Function')){
				callback.call(d,pd);
			}else{
				window.DommyJS.ui.dialog.open({
					type : 'success',
					title : pd._TITLE_=='' ? '操作成功' : pd._TITLE_,
					info : pd._INFO_=='' ? d.dump(pd._DATA_) : pd._INFO_
				});
			}
		}
	}
	d.ajax.parseHtml = function(data){	//根据ajax返回的json解析出要显示的html
		if(d.is.empty(data._HTML_) || data._HTML_==''){
			if(d.is.empty(data._DATA_) || data._DATA_==''){
				return '';
			}else{
				return d.is(data._DATA_,'String') ? data._DATA_ : d.dump(data._DATA_);
			}
		}else{
			return d.is(data._HTML_,'String') ? data._HTML_ : d.dump(data._HTML_);
		}
	}
	d.ajax.parseComOption = function(data){		//根据ajax返回的json解析出要加载的com组件初始参数
		if(d.is(data._DATA_,'Object') && !d.is(data._DATA_.comtype,'Undefined')){
			return data._DATA_;
		}else{
			window.DommyJS.ui.dialog.open({
				type : 'error',
				title : '无法加载组件',
				info : '后台获取的组件初始化参数错误'
			});
		}
	}
	d.ajax.parseSelectOption = function(data){
		if(d.is(data._DATA_,'Object') && d.is(data._DATA_.selOpts,'Array')){
			return data._DATA_.selOpts;
		}
		return [];
	}
	d.ajax.parseFileItems = function(data){
		var fi = {
			path : '',
			folders : [],
			files : []
		};
		if(d.is(data._DATA_,'Object') && !d.is.empty(data._DATA_)){
			fi = d.extend(fi,data._DATA_);
		}
		return fi;
	}
	//ajax上传，带进度
	d.ajax.upload = function(url, form, success, progressfunc){
		url = d.ajax.url(url);
		form = d.$(form);
		var formData = new FormData(form[0]);

		//进度条事件处理
		var uploadprogress = function(evt){
			//evt.loaded
			//evt.total
			if(d.is(progressfunc,'Function')){
				progressfunc(evt);
			}
		}

		$.ajax({
			url : url,
			type : 'POST',
			dataType : 'json',
			data : formData, 
        	xhr : function(){	//为上传操作添加progress进度事件监听
				var upxhr = $.ajaxSettings.xhr();
				if(upxhr.upload){
					upxhr.upload.addEventListener('progress', uploadprogress, false);
				}
				return upxhr;
        	},
        	contentType : false,
        	processData : false,
        	/*xhrFields : {
        		onsendstart : function(){
        			this.upload.addEventListener('progress',co.uploadProgress,false);
        		}
        	},*/
        	success : function(dt){return d.ajax.parse(dt,success);}
		});
	}


	//通知中心
	d.notice = {
		idx : -1,
		list : [	//通知列表
			//{id:'', source:'url', target:'jquery obj', exec:'click method'}
		],
		checking : null,	//setTimeout对象

		//注册到通知中心
		reg : function(opt){
			if(!d.is(opt,'Object') || d.is(opt.source,'Undefined') || d.is(opt.target,'Undefined')){
				d.err('无法注册到通知中心，参数错误！[ '+d.dump(opt)+' ]');
				return false;
			}else{
				d.notice.idx++;
				opt.id = 'notice_'+d.notice.idx;
				opt.target = d.$(opt.target);
				if(!d.is(opt.exec,'Function')){
					opt.exec = d.notice.exec;
				}
				d.notice.list.push(opt);
				//注册后立即检查一下
				d.notice.checkByIdx(d.notice.list.length-1);
				return d.notice.list.length-1;
			}
		},
		//注销通知，按idx
		unregByIdx : function(idx){
			if(!d.is(d.notice.list[idx],'Null')){
				var tg = d.notice.list[idx].target;
				tg.removeClass('-notice-on').addClass('-notice-off');
				d.notice.list[idx] = null;
			}
		},
		//注销通知，按target
		unregByTarget : function(target){
			var tg = d.$(target);
			if(!d.is.$(tg)){
				return false;
			}
			var ns = d.notice.list;
			var nt = -1;
			for(var i=0;i<ns.length;i++){
				if(!d.is(ns[i],'Null') && ns[i].target.attr('id')==tg.attr('id')){
					nt = i;
					break;
				}
			}
			d.notice.list[nt] = null;
		},
		//启动通知检查
		start : function(){
			//if(d.notice.list.length>0){
				d.notice.check();
			//}
		},
		//停止通知检查
		stop : function(){
			if(d.notice.checking!=null){
				try {
					clearTimeout(d.notice.checking);
				}catch(err){}
			}
			d.notice.checking = null;
		},
		//检查通知
		check : function(){
			if(d.notice.list.length>0){
				var ns = d.notice.list;
				var nt = null;
				for(var i=0;i<ns.length;i++){
					/*nt = ns[i];
					if(!d.is(nt,'Null')){
						$.ajax({
							url : d.ajax.url(nt.source),
							dataType : 'json',
							success : function(dt){
								d.notice.show(dt,nt);
							}
						});
					}*/
					d.notice.checkByIdx(i);
				}
			}
			d.notice.stop();
			d.notice.checking = setTimeout(window.DommyJS.notice.check, d.option.notice.interval);
		},
		//检查某一个通知
		checkByIdx : function(idx){
			var nt = d.notice.list[idx];
			if(!d.is(nt,'Null')){
				$.ajax({
					url : d.ajax.url(nt.source),
					dataType : 'json',
					success : function(dt){
						d.notice.show(dt,nt);
					}
				});
			}
		},
		//显示通知
		show : function(data, nt){
			var tg = nt.target;
			var n = 0;
			if(d.is(data,'Object') && d.is(data._DATA_,'Number')){
				n = parseInt(data._DATA_);
			}
			if(n<=0){
				tg.removeClass('-notice-on').addClass('-notice-off');
			}else{
				tg.removeClass('-notice-off').addClass('-notice-on');
			}
			tg.html(n);
		}
	};


	//条件回调
	d.until = function(condition, callback){
		var _cidx = -1;
		if(typeof condition == 'number' && callback==undefined){
			_cidx = condition;
			var _l = d.until._list_[_cidx];
			condition = _l.condition;
			callback = _l.callback;
		}else{
			if(typeof condition == 'function' && typeof callback == 'function'){
				_cidx = d.until._list_.length;
				d.until._list_.push({
					condition : condition,
					callback : callback
				});
			}
		}
		if(_cidx!=-1){
			if(condition()==true){
				return callback();
			}else{
				return setTimeout('window.DommyJS.until('+_cidx+')',d.option.until);
			}
		}
	}
	d.until._list_ = [];


	//全局回调
	d.callback = function(func, args){
		if(d.is(func,'Undefined')){
			return false;
		}else{
			func = d.callback._list_[func];
			if(d.is(func,'Function')){
				args = d.is(args,'Array') ? args : [];
				return func.apply(window.DommyJS,args);
			}else{
				return false;
			}
		}
	}
	//添加一个回调函数
	d.callback.add = function(funcname, func){
		if(d.is(func,'Function')){
			var f = d.callback._list_[funcname];
			if(d.is(f,'Undefined')){
				d.callback._list_[funcname] = func;
			}
		}
	}
	d.callback._list_ = [];


	//函数队列，顺序执行
	d.queue = {
		list : {},
		push : function(qname, func){
			if(d.is(func,'Function')){
				if(!d.is(d.queue.list[qname],'Array')){
					d.queue.list[qname] = [];
				}
				d.queue.list[qname].push(function(lastresult){
					var result = func.call(d,lastresult);
					return d.queue.next(qname, result);
				});
			}
			return d.queue;
		},
		next : function(qname, result){
			if(d.queue.list[qname].length<=0){
				return result;
			}else{
				return d.queue.list[qname].shift().call(d, result);
			}
		},
		run : function(qname, startdata){return d.queue.next(qname, startdata);},
		del : function(qname){delete d.queue.list[qname];}
	};


	//功能函数
	d.extend = function(_old, _new){return $.extend(true,{},_old,_new);}
	d.dump = function(obj){return JSON.stringify(obj);}
	d.md5 = function(s){return md5(s);}	//需要加载blueimp-md5



	//通用函数
	d.fn = {
		
		
	}


	//debug
	d.log = function(log){
		log = 'DJ>>> '+log;
		if(d.option.debug){
			return console.log(log);
		}
	}
	d.logerr = function(ec){
		d.ajax('api/errcode/'+ec,function(dt){
			d.log(dt._DATA_);
		});
	}


	//核心对象初始化
	d.init = function(opt, callback){
		if(d.is(callback,'Undefined')){
			if(d.is(opt,'Function')){
				d.init.reg(opt);
			}else if(d.is(opt,'Object')){
				//d.option = d.extend(d.option, opt);
				d.setOption(opt);
			}
		}else{
			if(d.is(opt,'Object')){
				//d.option = d.extend(d.option, opt);
				d.setOption(opt);
			}
			if(d.is(callback,'Function')){
				d.init.reg(callback);
			}
		}
		return d.init.run();
	}
	//向函数队列init中追加函数，在执行框架初始化时，顺序执行已注册的初始化函数
	d.init.reg = function(func){
		if(d.is(func,'Function')){
			d.queue.push('init',func);
		}
		return d.init;
	}
	//顺序执行函数列队init
	d.init.run = function(){return d.queue.run('init',d);}
	//注册需要顺序执行的init函数
	//$$启动
	d.init.reg(function(){
		if(d.option.debug){
			console.log('-= DommyJS v '+d.version+' Starting now! Enjoy... =-');
		}
		return d;
	});
	//通知中心启动
	d.init.reg(d.notice.start);




	/**** prototype extend ****/

	//jQuery
	jQuery.fn.extend({
		hasAttr : function(attr){return typeof($(this).attr(attr)) != 'undefined';},
		attrEx : function(attr, dft){return typeof($(this).attr(attr)) == 'undefined' ? dft : $(this).attr(attr);},
		toViewportCenter : function(){
			var vp = {w:$(window).width(), h:$(window).height()},
				ss = {w:$(this).width(), h:$(this).height()};
			return $(this).css({
				left : (vp.w-ss.w)/2,
				top : (vp.h-ss.h)/2
			});
		},
		
		/** 调用css3动画，需要加载animate.min.css **/
		/*参数  $(selector).ani('effect1 effect2', callback)
		可选动画样式  
		bounce, flash, pulse, rubberBand, shake, swing, tada, wobble, bounceIn, bounceInDown, bounceInLeft, bounceInRight,
		bounceInUp, bounceOut, bounceOutDown, bounceOutLeft, bounceOutRight, bounceOutUp, fadeIn, fadeInDown, fadeInDownBig,
		fadeInLeft, fadeInLeftBig, fadeInRight, fadeInRightBig, fadeInUp, fadeInUpBig, fadeOut, fadeOutDown, fadeOutDownBig,
		fadeOutLeft, fadeOutLeftBig, fadeOutRight, fadeOutRightBig, fadeOutUp, fadeOutUpBig, flip, flipInX, flipInY, flipOutX,
		flipOutY, lightSpeedIn, lightSpeedOut, rotateIn, rotateInDownLeft, rotateInDownRight, rotateInUpLeft, rotateInUpRight,
		rotateOut, rotateOutDownLeft, rotateOutDownRight, rotateOutUpLeft, rotateOutUpRight, hinge, rollIn, rollOut, zoomIn,
		zoomInDown, zoomInLeft, zoomInRight, zoomInUp, zoomOut, zoomOutDown, zoomOutLeft, zoomOutRight, zoomOutUp */
		ani : function(effects, callback){
			var _self = $(this);
			return $(this).addClass('animated '+effects).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
				setTimeout(function(){
					_self.removeClass('animated '+effects);
				},1000);
				if(typeof callback == 'function'){
					callback.call(_self);
				}
			});
		}
	});

	//object
	String.prototype.ucfirst = function(){	//首字母大写
		var str = this.toLowerCase();
		str = str.replace(/\b\w+\b/g, function(word){
  			return word.substring(0,1).toUpperCase()+word.substring(1);
		});
		return str;
	}

	






	
	window.Dommy = window.DommyJS = window.DJ = window.$$ = d;

})(window);



/**** ajax ****/
(function(window, d, undefined){
	var a =  {
		requests : [],			//AJAX加载队列  [{'dtype':'json','data':data},{},...]
		isLoading : false,		//正在加载的标记
		waiting : null,			//等待加载下一条的setTimeout对象
		loadTo : -1,			//加载到队列中的序号，数组序号
		signer : {		//ajax加载标识DOM
			loading : null,
			notice : null,
			isOn : false
		}
	};

	//info
	a.info = function(){return (a.loadTo+1)+'/'+a.requests.length;}

	//DOM动作
	a.signer.on = function(callback){
		if(a.signer.isOn==false){
			//a.signer.loading = $('<div id="DJ_AJAX_LOADING" class="-dj-ajax -dj-ajax-loading -bg-cyan"></div>').appendTo('body');
			a.signer.loading = d.ui.loading.create();
			a.signer.notice = $('<span id="DJ_AJAX_NOTICE" class="-dj-ajax -dj-ajax-notice -bg-gray-3 -gray-5">加载请求 '+a.info()+' ...</span>').appendTo('body');
			//a.signer.notice/*.stop(true,false)*/.animate({opacity:1},d.option.ui.dura.l,d.option.ui.easing());
			//a.signer.notice.ani('fadeIn');
			a.signer.isOn = true;
			if(callback){callback();}
		}else{
			a.signer.notice.html('加载请求 '+a.info()+' ...');
			if(callback){callback();}
		}
	};
	a.signer.off = function(issuccess, callback){
		var _snr = a.signer;
		if(_snr.isOn==true){
			if(issuccess===true){
				_snr.notice.html('请求 '+a.info()+' 成功');
				if(a.loadTo>=a.requests.length-1){
					//_snr.notice.stop(true,false).animate({opacity:0},d.option.ui.dura.l,d.option.ui.easing(),function(){
					//_snr.notice.ani('fadeOut',function(){
						_snr.notice.remove();
					//});
					a.signer.isOn = false;
					//_snr.loading.remove();
					d.ui.loading.remove();
					if(callback){callback();}
				}else{
					if(callback){callback();}
				}
			}else if(issuccess===false){	//发生错误
				var _loadnext = '$$.AJAX.loadRequests()';
				if(a.requests.length<=a.loadTo+1){
					_loadnext = '$$.AJAX.signer.off(\'cancel\',$$.AJAX.cancelLoad)';
				}
				_snr.loading.removeClass('-bg-cyan').addClass('-bg-red');
				_snr.notice.removeClass('-bg-gray-3 -gray-5').addClass('-bg-red -white').html('请求 '+a.info()+' 出错！<span onclick="$$.AJAX.showErrorRequestData('+a.loadTo+')" style="text-decoration:underline; cursor:pointer;">错误信息</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span onclick="$$.AJAX.showErrorRequestData('+a.loadTo+',true)" style="text-decoration:underline; cursor:pointer;">数据源</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span onclick="'+_loadnext+'" style="text-decoration:underline; cursor:pointer;">跳过</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span onclick="$$.AJAX.signer.off(\'cancel\',$$.AJAX.cancelLoad)" style="text-decoration:underline; cursor:pointer;">取消</span>');
			}else if(issuccess=='cancel'){
				a.loadTo = a.requests.length-1;
				a.signer.off(true,callback);
			}
		}else{
			if(callback){callback();}
		}
	}

	//初始化每次AJAX加载任务的参数
	a.setPara = function(url,callback,data,options){
		var _opt = options==undefined ? d.option.ajax : d.extend(d.option.ajax,options);
		var para = {
			'url' : url,
			'callback' : callback,
			'isLoaded' : false,
			'isSuccess' : false,
			'data' : data==undefined ? {} : data,
			'options' : _opt
		};
		if(para.options.dataType==undefined){
			para.options.dataType = 'json';
		}
		return para;
	};
		
	//加载AJAX请求成功并获得返回数据后，将返回数据保存到request序列中，或者请求失败后，将错误代码存到request序列中
	a.saveRequest = function(idx,issuccess,data){
		a.requests[idx].isLoaded = true;
		a.requests[idx].isSuccess = issuccess;
		a.requests[idx].responseData = data;
	};
	a.getRequestData = function(idx){
		if(a.requests[idx] && a.requests[idx]!=null){
			return a.requests[idx];
		}
		return null;
	};
	a.showErrorRequestData = function(idx, openurl){
		openurl = openurl==undefined ? false : openurl;
		var _rd = a.getRequestData(idx);
		if(_rd!=null){
			var _u = _rd.url;
			if(openurl==true){
				window.open(_u);
			}else{
				alert('['+_rd.url+'] '+_rd.responseData);
			}
		}else{
			alert('AJAX组件发生未知错误！');
		}
	}

	//按顺序加载队列中的AJAX请求
	a.loadRequests = function(){
		var _a = a;
		if(a.waiting!=null){
			try{
				clearTimeout(a.waiting);
				a.waiting = null;
			}catch(err){};
		}
		
		if(/*_a.requests.length<=0 || */_a.requests.length<=_a.loadTo+1){		//队列中无任务或已加载至队列末尾
			a.isLoading = false;
			a.cancelLoad();
		}else{
			a.loadTo++;
			a.loadRequest(a.loadTo);
		}
	};

	//加载某条AJAX请求
	a.loadRequest = function(_loadTo){
		var _a = a;
		var _rqs = a.requests;
		_loadTo = _loadTo==undefined ? a.loadTo : _loadTo;
		if(_loadTo>=0 || _loadTo<_rqs.length){
			var _rq = _rqs[_loadTo];
			a.signer.on(function(){
				var _opt = _rq.options;
				_opt.url = _rq.url;
				_opt.data = _rq.data;
				_opt.success = function(data){
					a.saveRequest(_loadTo,true,data);
					var callback = _rq.callback;

					/**** 全局解析返回数据，查看是否包含错误信息 ****/
					/*if(data.QR_ERROR && data.QR_ERROR=='error'){
						var _cb = null;
						if(data.QR_ERROR_CALLBACK!='' && _d.cf[data.QR_ERROR_CALLBACK] && typeof _d.cf[data.QR_ERROR_CALLBACK] == 'function'){
							_cb = _d.cf[data.QR_ERROR_CALLBACK];
						}
						_d.error(data.QR_ERROR_TITLE,data.QR_ERROR_INFO,_cb);
					}else{
						if(callback){callback(data)};
					}*/
					if(callback){callback(data)};
					/**** 全局解析返回数据，查看是否包含错误信息 ****/

					a.signer.off(true,function(){
						a.waiting = setTimeout(function(){a.loadRequests()},10);
					});
				};
				_opt.error = function(XMLHttpRequest, textStatus, errorThrown){
					a.saveRequest(_loadTo,false,'xhr.statu:'+XMLHttpRequest.statu+'; xhr.readyState:'+XMLHttpRequest.readyState+'; textStatu:'+textStatus);
					a.signer.off(false,function(){
						
					});
				};
				$.ajax(_opt);
			});
		}
	};
		
	//取消所有AJAX调用
	a.cancelLoad = function(){
		if(a.waiting!=null){
			try{
				clearTimeout(a.waiting);
				a.waiting = null;
			}catch(err){};
		}
		//清空AJAX加载队列
		a.requests = null;
		a.requests = [];
		a.isLoading = false;
		a.loadTo = -1;
	};
		
	//外部调用接口
	a.Load = function(url,callback,data,options){
		//将新的AJAX调用添加到队列中
		var para = a.setPara(url,callback,data,options);
		//console.log(para);
		a.requests.push(para);
		//alert('lll')
		//如果队列没有运行则运行之
		if(!a.isLoading){
			a.loadRequests();
			a.isLoading = true;
		}
	};

	a.do = function(_url,_success,_error,_opt){
		var _data = _opt==undefined || _opt.data==undefined ? {} : _opt.data;
		a.Load(_url,_success,_data,_opt);
	}

	d.AJAX = a;
	//d.ajax = a.do;
})(window, window.DommyJS);



/**** ui ****/
(function(window, d, undefined){
	var ui = {};

	//font-awesome类
	ui.fontAwesome = {
		cls : function(icon){
			//return 'icon-'+icon;
			return 'fa fa-'+icon;
		},
		elm : function(icon, attrs){
			var attr = {
				'class' : ui.fontAwesome.cls(icon)
			};
			if(d.is(attrs,'Object') && !d.is.empty(attrs)){
				if(d.is(attrs.css,'String') && attrs.css!=''){
					attr['class'] += ' '+attrs.css;
					delete attrs.css;
				}
				attr = d.extend(attr,attrs);
			}
			var h = '<i';
			for(var i in attr){
				h += ' '+i+'="'+attr[i]+'"';
			}
			h += '></i>';
			return h;
		}
	}

	//ajaxsign
	ui.loading = {
		elm : null,
		create : function(callback){
			if(d.is(ui.loading.elm,'Null')){
				
				if(d.browser.isMobile()){
					ui.loading.elm = $('<div id="DJ_AJAX_LOADING" class="-dj-ajax -dj-ajax-loading-m -bg-black"><img src="'+d.url('Public/DP/icon/loading.svg')+'"></div>').appendTo('body');
				}else{
					ui.loading.elm = $('<div id="DJ_AJAX_LOADING" class="-dj-ajax -dj-ajax-loading -bg-cyan"></div>').appendTo('body');
				}
			}
			return ui.loading.elm;
		},
		remove : function(){
			if(!d.is(ui.loading.elm,'Null')){
				ui.loading.elm.remove();
				ui.loading.elm = null;
			}
		}
	}

	//btn
	ui.btn = {
		idx : -1,
		evts : [],
		create : function(title, bgc, icon, clk){
			ui.btn.idx ++;
			var h = '<span id="DJ_BTN_'+ui.btn.idx+'"';
			bgc = !d.is(bgc,'String') || bgc=='' ? 'cyan' : bgc;
			h += ' class="-btn -btn-'+bgc+'"';
			if(d.is(clk,'Function')){
				ui.btn.evts[ui.btn.idx] = clk;
				h += ' onclick="window.DommyJS.ui.btn.click('+ui.btn.idx+')">';
			}else if(d.is(clk,'String')){
				h += ' onclick="'+clk+'">';
			}else{
				h += '>';
			}
			icon = !d.is(icon,'String') || icon=='' ? '' : icon;
			if(icon!=''){
				h += '<i class="'+ui.fontAwesome.cls(icon)+'"></i>';
			}
			h += title+'</span>';
			return h;
		},
		click : function(idx){
			var func = ui.btn.evts[idx];
			if(d.is(func,'Function')){
				return func.call($('#DJ_BTN_'+idx));
			}
		}
	};

	//mask 
	ui.mask = {
		elm : null,
		create : function(callback){
			ui.mask.elm = $('<div id="DJ_MASK" class="-dj-mask -bg-black"></div>').appendTo('body');
			ui.mask.elm.ani('fadeIn',callback);
		},
		remove : function(callback){
			ui.mask.elm.ani('fadeOut',callback);
		},
		on : function(callback){
			if(!d.is(ui.mask.elm,'Null')){
				if(d.is(callback,'Function')){
					callback.call(ui.mask.elm);
				}
			}else{
				ui.mask.create(callback);
			}
		},
		off : function(callback){
			if(!d.is(ui.mask.elm,'Null')){
				ui.mask.remove(function(){
					ui.mask.elm.remove();
					ui.mask.elm = null;
					if(d.is(callback,'Function')){
						callback.call(d);
					}
				});
			}else{
				if(d.is(callback,'Function')){
					callback.call(d);
				}
			}
		}
	};

	//pop弹出层
	ui.pop = {
		elm : null,
		bodyclk : null,	//缓存的body元素click动作
		opt : {
			//caller : null,
			//evt : null,		//当未指定caller时，记录鼠标事件
			//off : null,		//预指定弹出层关闭后动作
			//w : 160,
			//h : 320
		},
		on : function(callback, popopt){
			if(!d.is(ui.pop.elm,'Null')){	//如果弹出层已打开
				ui.pop.off();
			}
			if(ui.pop.setOpt(popopt)!==false){
				var pos = d.browser.isMobile() ? ui.pop.fixMobilePos() : ui.pop.fixPos();
				if(d.is(ui.pop.elm,'Null')){
					$('<div id="DJ_POP" class="-dj-pop"></div>').appendTo('body');
					ui.pop.elm = $('#DJ_POP');
				}
				ui.pop.elm.removeClass('-shadow-s-top -shadow-s-bottom').addClass('-shadow-s-'+pos.sh).css({
					left : pos.l,
					top : pos.t,
					width : pos.w,
					height : pos.h
				});
				if(d.browser.isMobile()){
					/*ui.pop.elm.css({
						position : 'fixed',
						top : $(window).height()
					}).animate({
						top : pos.t
					},d.option.ui.dura.l,d.option.ui.easing());*/
					ui.pop.elm.css({
						position : 'fixed',
						top : pos.t,
						'animation-duration' : '0.8s'
					}).ani('bounceInUp');
					ui.mask.on(function(){
						ui.pop.setMobileEvent();
					})
				}else{
					ui.pop.setEvent();
				}
				
				if(d.is(callback,'Function')){
					return callback.call(ui.pop);
				}else{
					return ui.pop;
				}
			}
		},
		off : function(){
			if(d.is.$(ui.mask.elm)){
				ui.mask.off();
			}
			if(d.is.$(ui.pop.elm)){
				if(d.is(ui.pop.opt.off,'Function')){
					ui.pop.opt.off.call(ui.pop);
				}
				ui.pop.elm.remove();
				ui.pop.elm = null;
				ui.pop.opt = {};
			}
		},
		setOpt : function(popopt){
			if(d.is(popopt, 'Object') && !d.is.empty(popopt)){
				popopt = d.extend(d.option.ui.pop,popopt);
				if(d.is(popopt.caller,'Null') && d.is(popopt.evt,'Null')){
					//不能既不指定caller又不指定evt
					d.err('无法弹出层，参数不完整');
					return false;
				}
				ui.pop.opt = popopt;
				if(!d.is(ui.pop.opt.caller,'Null')){
					ui.pop.opt.caller = d.$(ui.pop.opt.caller);
				}
			}else{
				d.err('无法弹出层，参数不完整');
				return false;
			}
		},
		fixPos : function(){	//根据ui.pop.caller元素，计算弹出层的位置
			var opt = ui.pop.opt;
			var pos = {};
			if(d.is(opt.caller,'Null')){
				pos = {
					l : opt.evt.clientX,
					t : opt.evt.clientY,
					w : opt.w,
					h : opt.h,
					sh : 'bottom'
				}
			}else{
				pos = {
					l : opt.caller.offset().left,
					t : opt.caller.offset().top+opt.caller.height(),
					w : opt.caller.width(),
					h : opt.h,
					sh : 'bottom'
				}
			}
			if(pos.l+pos.w>$(window).width()){
				if(d.is(opt.caller,'Null')){
					pos.l = opt.evt.clientX-pos.w;
				}else{
					pos.l = opt.caller.offset().left-(pos.w-opt.caller.width());
				}
			}
			if(pos.t+pos.h>$(window).height()){
				if(d.is(opt.caller,'Null')){
					pos.t = opt.evt.clientY-pos.h;
				}else{
					pos.t = opt.caller.offset().top-pos.h;
				}
				pos.sh = 'top';
			}
			return pos;
		},
		fixMobilePos : function(){	//移动端弹出层
			if(d.browser.isMobile()){
				var opt = ui.pop.opt;
				var pos = {
					w : $(window).width(),
					h : opt.h,
					l : 0,
					t : $(window).height()-opt.h,
					sh : 'top'
				};
				if(pos.h>$(window).height()-96){
					pos.h = $(window).height()-96;
					pos.t = 96;
				}
				return pos;
			}
		},
		setEvent : function(){
			if(d.is(ui.pop.opt.caller,'Null')){

			}else{
				/*ui.pop.opt.caller.blur(function(){
					ui.pop.off();
				});*/
				$('body').one('click',function(){
					ui.pop.off();
				});
			}
		},
		setMobileEvent : function(){
			if(d.is(ui.pop.opt.caller,'Null')){

			}else{
				/*ui.pop.opt.caller.blur(function(){
					ui.pop.off();
				});*/
				ui.mask.elm.one('click',function(){
					//ui.mask.off(function(){
						ui.pop.off();
					//});
				});
			}
		}
	}

	//dialog
	ui.dialog = {
		idx : -1,
		elm : null,
		ok_callback : function(){ui.dialog.close();},
		yes_callback : null,
		no_callback : null,
		callback : function(tp){
			var func = null;
			if(d.is(ui.dialog[tp+'_callback'],'Function')){
				//ui.dialog[tp+'_callback'].call(ui.dialog.elm);
				func = ui.dialog[tp+'_callback'];
			}
			ui.dialog.close(function(){
				if(d.is(func,'Function')){
					func.call(d);
				}
			});
		},
		ctrl : function(ctrl){
			var ct = '',
				ci = null,
				cts = d.option.ui.dialog.btns;
			if(ctrl.length>0){
				for(var i=0;i<ctrl.length;i++){
					ci = cts[ctrl[i]];
					if(d.is(ci,'Array')){
						ci.push('$$.ui.dialog.callback(\''+ctrl[i]+'\')');
						ct += ui.btn.create(ci[0],ci[1],ci[2],ci[3]);
					}
				}
			}
			return ct;
		},
		create : function(opt, callback){
			ui.mask.on();
			ui.dialog.idx ++;
			opt = opt==undefined ? d.option.ui.dialog.option : d.extend(d.option.ui.dialog.option, opt);
			var tp = d.option.ui.dialog.types[opt.type];
			var h = '<div id="DJ_DIALOG_'+ui.dialog.idx+'" class="-dj-dialog -bg-white -shadow-bottom" style="width:'+opt.w+'px; height:'+opt.h+'px;"><i class="'+ui.fontAwesome.cls(tp.icon)+' -'+tp.bgc+'"></i><h3>'+opt.title+'</h3><div class="-dj-dialog-info">'+opt.info+'</div><div class="-btn-panel -dj-dialog-ctrl -bg-gray-1">'+ui.dialog.ctrl(tp.ctrl)+'</div>';
			ui.dialog.elm = $(h).appendTo('body');
			ui.dialog.elm.css({width:opt.w, height:opt.h}).toViewportCenter();
			ui.dialog.layout();
			ui.dialog.elm.ani(tp.ani,callback);
		},
		layout : function(){
			if(!d.is(ui.dialog.elm,'Null')){
				var elm = ui.dialog.elm;
				var i = $('i',elm), t = $('h3',elm), c = $('.-dj-dialog-ctrl',elm);
				
				if(d.browser.isMobile()){
					elm.css({
						width : $(window).width(),
						height : $(window).height(),
						left : 0,
						top : 0
					});
					var h = elm.height();
					var hi = i.outerHeight(true),
						ht = t.outerHeight(true),
						hc = c.outerHeight(true);
					$('.-dj-dialog-info').css({height: h-hi-ht-hc});
				}else{
					var h = elm.height(), htop = elm.offset().top;
					var ht = t.outerHeight(true),
						hc = c.outerHeight(true);
					$('.-dj-dialog-info').css({height: h-ht-hc});
					elm.css({top: htop*0.7});
				}
			}
		},
		open : function(opt, callback){
			opt = opt==undefined ? d.option.ui.dialog.option : d.extend(d.option.ui.dialog.option, opt);
			ui.dialog.yes_callback = d.is(opt.yes,'Function') ? opt.yes : null;
			ui.dialog.no_callback = d.is(opt.no,'Function') ? opt.no : null;
			if(d.is(ui.dialog.elm,'Null')){
				ui.dialog.create(opt, callback);
			}else{
				var elm = ui.dialog.elm,
					tp = d.option.ui.dialog.types[opt.type];
				$('i',elm).removeClass().addClass(ui.fontAwesome.cls(tp.icon)+' -bg-'+tp.bgc);
				$('h3',elm).html(opt.title);
				$('.-dj-dialog-info',elm).html(opt.info);
				$('.-dj-dialog-ctrl',elm).html(ui.dialog.ctrl(tp.ctrl));
				elm.css({width:opt.w, height:opt.h}).toViewportCenter();
			}
		},
		close : function(callback){
			if(!d.is(ui.dialog.elm,'Null')){
				ui.dialog.elm.remove();
				ui.dialog.reset();
				ui.mask.off(callback);
			}
		},
		reset : function(){
			ui.dialog.elm = null;
			ui.dialog.yes_callback = null;
			ui.dialog.no_callback = null;
		}
	};

	//eventhandler
	ui.evt = {
		handler : {},
		triggers : {},
		defaultTarget : function(evt){
			/*'load','ready','error','unload','resize','scroll','focus','blur','focusin','focusout',
			'change','select','submit','keydown','keypress','keyup','toggle','hover',
			'click','dblclick','contextmenu','mouseenter','mouseleave','mouseover','mouseout','mousedown','mouseup',
			'touchstart','touchmove','touchend'*/
			if(evt=='resize'){
				return $(window);
			}else if(['load','ready','contextmenu'].indexOf(evt)>=0){
				return $(document);
			}else{
				return $('body');
			}
		},
		reg : function(evt, func){
			if(d.option.events.indexOf(evt)>=0){
				if(d.is(ui.evt.handler[evt],'Undefined')){
					ui.evt.handler[evt] = [];
					ui.evt.triggers[evt] = function(event){
						ui.evt.trigger(evt,event);
						//阻止冒泡
						return false;
					}
				}
				if(d.is(func,'Function')){
					ui.evt.handler[evt].push(func);
				}
			}
		},
		attach : function(){
			var evts = d.option.events, evn = '', evt = null;
			for(var i=0;i<evts.length;i++){
				evn = evts[i];
				evt = ui.evt.handler[evn];
				if(!d.is(evt,'Undefined') && !d.is.empty(evt)){
					ui.evt.defaultTarget(evn).on(evn, ui.evt.triggers[evn]);
				}
			}
		},
		trigger : function(evt, event){
			var funcs = ui.evt.handler[evt];
			for(var j=0;j<funcs.length;j++){
				funcs[j](event);
			}
		},
		detach : function(){
			var evts = d.option.events, evn = '', evt = null;
			for(var i=0;i<evts.length;i++){
				evn = evts[i];
				evt = ui.evt.handler[evn];
				if(!d.is(evt,'Undefined') && !d.is.empty(evt)){
					ui.evt.defaultTarget(evn).off(evn);
				}
			}
		}
	};
	//提前注册的全局事件处理
	//屏蔽右键
	ui.evt.reg('contextmenu',function(event){console.log(event);});
	//touch
	//ui.evt.reg('touchstart',function(event){console.log(event);});
	//注册到DommyJS启动函数序列
	d.init.reg(function(){ui.evt.attach();});

	//不用点击，展开select
	ui.openselect = function(elem) {
		elem = d.$(elem);
		if (document.createEvent) {
			var e = document.createEvent("MouseEvents");
			e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem[0].dispatchEvent(e);
	 	} else if (element.fireEvent) {
			elem[0].fireEvent("onmousedown");
		}
	};

	//随机色
	ui.rndColor = function(){
		var cs = [
			'red','orange','yellow','lightyellow','fruit','green','cyan',
			'darkcyan','darkercyan','blue','skyblue','lightblue','darkblue',
			'grayblue','darkgrayblue','darkergrayblue','pink','purple'
		];
		var idx = parseInt(Math.random()*cs.length,10);
		return cs[idx];
	}


	d.ui = ui;
	d.btn = ui.btn.create;
	d.mask = ui.mask;
	d.alert = function(info, title){return ui.dialog.open({type:'info',title:(d.is(title,'String') ? title : '弹出信息'),info:info});}
	d.confirm = function(info, callback){
		return ui.dialog.open({
			type : 'question',
			title : '请确认',
			info : info,
			yes : callback
		});
	}
	d.err = function(info){return ui.dialog.open({type:'error',title:'发生错误',info:info});}

})(window, window.DommyJS);



/**** com组件基类，不可直接实例化 ****/
(function(window, d, undefined){
	var  com = {
		idx : -1,		//全局组件计数器
		items : [],		//全局组件集合
		attrpre : 'data-dj-com-',
		domcache : null,	//com组件dom元素缓存区，jq对象

		ajax : d.ajax,	//组件调用后台数据的方法

		//检查组件集合，如果均为null，则重置组件集合和com.idx
		checkItems : function(){
			var cis = com.items;
			var isempty = true;
			for(var i=0;i<cis.length;i++){
				if(com.iscom(cis[i])){
					isempty = false;
					break;
				}
			}
			if(isempty==true){
				com.items = [];
				com.idx = -1;
			}
		},
		//查找组件集合中某个类型的组件
		findItemByType : function(comtype){
			var coms = [];
			for(var i=0;i<com.items.length;i++){
				if(com.iscom(com.items[i]) && com.items[i].comType == comtype){
					coms.push(com.items[i]);
				}
			}
			return coms;
		},
		//根据unique参数查找组件
		findItemByUnique : function(uniquecode, comtype){
			var coms = [];
			if(d.is(uniquecode,'String') && uniquecode.length==32){
				for(var i=0;i<com.items.length;i++){
					if(com.iscom(com.items[i]) && com.items[i].comType == comtype && com.items[i].unique == uniquecode){
						coms.push(com.items[i]);
					}
				}
			}
			return coms;
		},
		//判断目标组件是否存在
		exists : function(comtype){
			return d.is(comtype,'String') && comtype!='' && d.is(com[comtype],'Function');
		},
		//判断对象是否为ui组件
		iscom : function(co){
			if(!d.is(co,'Object') || d.is.empty(co) || !d.is.$(co.body) || co==null){
				return false;
			}else{
				if(co.body.hasAttr(com.attrpre+'idx')){
					return true;
				}else{
					return false;
				}
			}
		},
		//按组件序号选择组件实例
		item : function(idx){
			if(!d.is(idx,'Number')){
				return null;
			}else{
				idx = parseInt(idx);
				if(idx>=com.items.length){
					return null;
				}else{
					return com.items[idx];
				}
			}
		},
		//销毁组件实例，应在调用组件实例的remove方法后，再调用此方法
		remove : function(idx){
			var co = com.item(idx);
			if(co!=null){
				//组件集合中销毁
				com.items[co.idx] = null;
				co = null;
				com.checkItems();
			}
		},
		//字符串解析为条件语句，配合 com._is 方法
		strToCondition : function(s, _com){
			if(s.indexOf('()')>=0 || s.indexOf('=')>0 || s.indexOf('<')>0 || s.indexOf('>')>0){
				return [s];
			}
			s = s.replace(/\(/g,'');
			s = s.replace(/\)/g,'');
			var v = 'true';
			if(s.indexOf('!')>=0){
				s = s.replace(/\!/g,'');
				v = 'false';
			}
			if(!d.is(_com.runtime[s],'Undefined') && d.is(_com.runtime[s],'Boolean')){
				return [s,'_com.runtime.'+s+' == '+v];
			}else if(d.is(_com['_is'+s.ucfirst()],'Function')){
				return [s,'_com._is'+s.ucfirst()+'() == '+v];
			}else{
				return [s,'false'];
			}
		},
		//初始化参数转换为组件unique编码
		optToUnique : function(opt){
			opt = !d.is(opt,'Object') ? {} : opt;
			return d.md5(JSON.stringify(opt)).toLowerCase();
		},



		/**** 全局创建ui组件实例，入口，必须通过此方法实例化组件！！ ****/
		create : function(comtype, opt){
			if(com.exists(comtype) && (d.is(opt,'Object') || d.is(opt,'Undefined'))){
				var uniquecode = com.optToUnique(opt);
				opt = d.is(opt,'Undefined') ? {} : opt;
				//检查com.unique参数，防止组件实例被重复创建
				var coms = com.findItemByUnique(uniquecode, comtype);
				if(coms.length>0){	//存在已创建的实例
					return coms[0].pop();
				}else{
					opt.unique = uniquecode;
					com.idx++;
					com.items[com.idx] = new com[comtype](opt);
					return com.items[com.idx].init();
				}
			}
		}
	};

	//从组件内部的DOM获取所属组件实例，附加到jQuery上
	jQuery.fn.extend({
		getCom : function(){
			var me = $(this);
			var attr = com.attrpre+'idx';
			if(me.hasAttr(attr)){
				return com.item(me.attr(attr));
			}else{
				var p = me.parent();
				var idx = -1;
				while(p[0].nodeName.toLowerCase()!='body'){
					if(p.hasAttr(attr)){
						idx = p.attr(attr);
						break;
					}
				}
				if(idx==-1){
					return null;
				}else{
					return com.item(idx);
				}
			}
		}
	});

	//基类，不可直接实例化，ui组件类均继承此类
	com._base_ = function(opt){
		this.idx = com.idx;
		this.comType = 'base';
		this._setComType();

		this.container = null;	//包含此组件的容器，jq对象
		this.body = null;		//此组件的最外层容器，jq对象
		this.content = null;	//包含此组件业务数据的容器，jq对象
		this.dom = {};		//组件界面DOM，储存jq对象
		this._option = {	//静态参数，通过组件的 option() 接口方法读取和设置
			minsize : [0,0],
			contentopt : {	//内容参数
				type : 'content', 	//content/com
				content : '',
				source : '',
				comtype : '',
				comopt : {}
			}
		};
		this._method = {	//静态方法，通过组件的 run() 接口方法调用
			afterCreate : function(){	//组件初始化完成后执行

				//return this;
				//d.log('组件'+this.id+'创建完成');
			}
		};
		this._notice = [];	//通知列表，需要注册到框架通知中心，接口方法 notice()
		this._cache = {};	//组件实例缓存，通过 cache() 接口方法读取和设置

		this.runtime = {	//运行时参数，通过组件的 set() 接口方法改变参数值，每次set都会触发相应eventHandler

			//业务数据，实现此组件功能的主要数据，如窗口组件的内容，表格组件的数据表数组
			data : null,

			//子组件
			sub : [
				/*{
					type : '子组件类型',
					container : '子组件容器dom，应包含在this.dom[]数组中',
					opt : {子组件启动参数},
					com : 子组件的实例对象
				},*/
				//...
			],
			//actsub : -1,	//当前激活的子组件

			//父组件
			parent : {
				idx : -1,		//父组件在com.items全局数组中的idx
				subidx : -1 	//此组件在父组件runtime.sub中的idx
			},

			//界面参数
			inter : false,	//组件是否包含在某个DOM元素中，false表示组件body直接包含在$(body)中
			size : [0,0],	//此组件body的默认尺寸[w,h]

			//状态
			_created : false,
			_loaded : false
		};

		//指定组件容器
		opt = !d.is(opt,'Object') || d.is.empty(opt) ? {} : opt;
		if(!d.is(opt.container,'Undefined')){
			this._setContainer(opt.container);
			delete opt.container;
		}else{
			this._setContainer();
		}
		
		//如果是根据某个DOM元素创建组件，此处定义com.body
		if(!d.is(opt.body,'Undefined')){
			this.body = d.$(opt.body);
			delete opt.body;
		}

	}
	//内部方法
	com._base_.prototype._setComType = function(){
		this.id = this.comType+'_'+com.idx;
		this.hid = 'DJ_COM_'+this.id;
	}
	com._base_.prototype._optToUnique = function(opt){	//将组件初始化参数转化为字符串，保存到com.unique，防止重复调用
		opt = d.is(opt,'Undefined') ? Date.parse(new Date()) : opt;		//当以空参数实例化组件时，通过时间戳来区别组件实例，因为空参数实例化多用于子类继承时调用
		opt = !d.is(opt,'Object') ? {} : opt;
		if(d.is(opt,'Object') && !d.is(opt.unique,'Undefined')){
			this.unique = opt.unique;
		}else{
			var s = JSON.stringify(opt);
			this.unique = d.md5(s);
		}
		//console.log(this.unique);
	}
	com._base_.prototype._fixOptBeforeInit = function(opt){	//需要在子类中覆盖此方法
		
		return !d.is(opt,'Object') || d.is.empty(opt) ? {} : opt;
	}
	com._base_.prototype._setOpt = function(opt){	//写入初始化/自定义参数
		opt = this._fixOptBeforeInit(opt);
		if(!d.is(opt.container,'Undefined')){
			this._setContainer(opt.container);
			delete opt.container;
		}
		var _me = this;
		if(!d.is.empty(opt)){
			if(d.is(opt.option,'Object')){
				this._option = d.extend(_me._option,opt.option);
				delete opt.option;
			}
			if(d.is(opt.method,'Object')){
				this._method = d.extend(_me._method,opt.method);
				delete opt.method;
			}
			if(d.is(opt.notice,'Object')){
				this._notice = d.extend(_me._notice,opt.notice);
				delete opt.notice;
			}
			if(d.is(opt.cache,'Object')){
				this._cache = d.extend(_me._cache,opt.cache);
				delete opt.cache;
			}
			if(!d.is.empty(opt)){
				this.runtime = d.extend(_me.runtime,opt);
			}
		}
		return this;
	}
	com._base_.prototype._setContainer = function(ctn){
		if(d.is(ctn,'Undefined') || d.is(ctn,'Null') || ctn=='body' || ctn==''){
			this.container = $('body');
			this.runtime.inter = false;
		}else{
			if(d.$(ctn)==false){
				this.container = $('body');
				this.runtime.inter = false;
			}else{
				this.container = d.$(ctn);
				this.runtime.inter = true;
			}
		}
	}
	com._base_.prototype._createDom = function(callback){	//组件DOM结构创建，子类必须实现此方法
		if(this.body!=null){	//根据DOM元素创建组件
			//...
		}else{	//直接创建组件，并附加到container元素中

		}
		return this._callback(callback);
	}
	com._base_.prototype._attrToDom = function(callback){	//将一些必需的参数，附加到 com.container/com.body 元素上
		var attrs = {};
		attrs[com.attrpre+'idx'] = this.idx;
		attrs[com.attrpre+'id'] = this.id;
		attrs[com.attrpre+'type'] = this.comType;
		this.body.attr(attrs);
		//附加到container
		attrs = {};
		attrs[com.attrpre+'hascom'] = 'yes';
		attrs[com.attrpre+'comidx'] = this.idx;
		this.container.removeClass('-ctn').attr(attrs);
		//css
		if(this._is('inter')){
			this.body.removeClass('-dj-com').addClass('-dj-com-inter');
		}else{
			this.body.removeClass('-dj-com-inter').addClass('-dj-com');
		}
		return this._callback(callback);
	}
	com._base_.prototype._fixParent = function(callback){	//如果存在父组件，则关联父组件
		if(this.runtime.parent.idx>=0){
			this.trigger('parent');
		}
		return this._callback(callback);
	}
	com._base_.prototype._contentType = function(contentopt){
		if(d.is(contentopt,'Object')){
			if(d.is(contentopt.type,'String')){
				var ctp = contentopt.type=='' ? '_content' : '_'+contentopt.type;
				if(d.is(contentopt.content,'String') && contentopt.content!=''){
					return 'content'+ctp;
				}
				if(d.is(contentopt.source,'String') && contentopt.source!=''){
					return 'source'+ctp;
				}
				if(d.is(contentopt.comtype,'String') && contentopt.comtype!=''){
					return 'static'+ctp;
				}
			}
		}
		return 'nocontent';
	}
	com._base_.prototype._createSubComList = function(callback){	//根据初始参数创建subcom列表，需要子类实现
		this._removeSubCom();
		return this._callback(callback);
	}
	com._base_.prototype._removeSubCom = function(idx){
		if(d.is(idx,'Number')){
			idx = parseInt(idx);
			if(idx>=0 && idx<this.runtime.sub.length){
				var sc = this.runtime.sub[idx];
				com.item(sc).remove();
				this.runtime.sub[idx] = null;
			}
		}else if(d.is(idx,'Undefined')){
			var s = this.runtime.sub;
			for(var i=0;i<s.length;i++){
				if(s[i]!=null){
					com.item(s[i]).remove();
					this.runtime.sub[i] = null;
				}
			}
		}
	}
	com._base_.prototype._loadSubCom = function(idx, comtype, comopt){
		if(d.is(idx,'Number') && parseInt(idx)>=0 && parseInt(idx)<this.runtime.sub.length && d.is(comtype,'String') && com.exists(comtype) && d.is(comopt,'Object') && !d.is(comopt.container,'Undefined')){
			comopt.parent = {
				idx : this.idx,
				subidx : idx
			}
			com[comtype].create(comopt);
		}
		//console.log(this.runtime.sub);
		//console.log(com.items);
	}
	com._base_.prototype._initSubCom = function(callback){	//子组件初始化，可由子类覆盖

		return this._createSubComList(callback);
	}
	com._base_.prototype._loadContent = function(container, contentopt, subidx){	//向目标容器加载内容，组件通用方法
		if(!d.is(container,'Undefined') && d.is(contentopt,'Object')){
			var ctn = d.is.$(container) ? container : d.$(container);
			var opt = this._option.contentopt;
			opt = d.extend(opt, contentopt);
			var ct = this._contentType(opt);
			if(ct!='nocontent'){
				this._fixCtnBeforeLoadContent(ctn);
				if(ct=='content_content'){
					ctn.addClass('-cnt').html(opt.content);
				}else if(ct=='source_content'){
					com.ajax(opt.source, function(dt){
						var h = com.ajax.parseHtml(dt);
						ctn.addClass('-cnt').html(h);
					});
				}else if(ct.indexOf('com')>=0){
					//ctn.html('');
					subidx = !d.is(subidx,'Number') || parseInt(subidx)<0 ? 0 : parseInt(subidx);
					var comtype = '', comopt = {};
					if(ct=='static_com'){
						comtype = opt.comtype;
						comopt = opt.comopt;
						comopt.container = ctn.attr('id');
						this._loadSubCom(subidx, comtype, comopt);
					}else if(ct=='source_com'){
						var co = this;
						com.ajax(opt.source, function(dt){
							comopt = com.ajax.parseComOption(dt);
							comtype = comopt.comtype;
							delete comopt.comtype;
							comopt.container = ctn.attr('id');
							co._loadSubCom(subidx, comtype, comopt);
						});
					}
				}
			}
		}
	}
	com._base_.prototype._fixCtnBeforeLoadContent = function(ctn){	//向目标容器ctn加载内容之前，处理ctn中原有内容，然后清空
		if(!d.is.$(ctn)){
			ctn = d.$(ctn);
		}
		if(ctn.hasAttr(com.attrpre+'hascom') && ctn.attr(com.attrpre+'hascom')=='yes'){		//ctn中原有内容是com组件
			var cidx = ctn.attr(com.attrpre+'comidx');
			var co = com.item(cidx);
			//检查com组件dom缓存区是否存在
			if(!d.is.$(com.domcache)){
				$('<div id="DJ_COM_DOMCACHE" class="-dj-com-domcache"></div>').appendTo('body');
				com.domcache = $('#DJ_COM_DOMCACHE');
			}
			//将ctn中原有的com组件内容转移到组件dom缓存区
			com.domcache.append(co.body);
			//移除ctn中原有内容
			ctn.removeAttr(com.attrpre+'hascom').removeAttr(com.attrpre+'comidx').html('');
		}else{
			ctn.html('');
		}
	}
	com._base_.prototype._callback = function(callback){
		if(d.is(callback,'Function')){
			var rst = callback.apply(this);
			return d.is(rst,'Undefined') ? this : rst;
		}
		return this;
	}
	com._base_.prototype._self = function(){
		var idx = this.idx;
		return com.item(idx);
	}
	com._base_.prototype._is = function(condition){		//条件判断缩写，*._is('func1 && (func2 || func3)')，func需定义 _isFunc()方法，此方法返回boolean
		if(!d.is(condition,'String') || condition==''){
			return false;
		}
		var _com = this;
		var cdts = [], cdtsa = [];
		var ns = condition.split(' && ');
		var tc = [], nss = null;
		for(var i=0;i<ns.length;i++){
			if(ns[i].indexOf(' || ')<0){
				cdts.push(ns[i]);
			}else{
				nss = ns[i].split(' || ');
				for(var j=0;j<nss.length;j++){
					if(cdts.indexOf(nss[j])<0){
						cdts.push(nss[j]);
					}
				}
			}
		}
		//console.log(cdts);
		for(var i=0;i<cdts.length;i++){
			tc = com.strToCondition(cdts[i], _com);
			if(tc.length>1){
				cdtsa[tc[0]] = tc[1];
			}
		}
		var cdt = condition;
		for(var i in cdtsa){
			cdt = cdt.replace(new RegExp(i,"gm"),cdtsa[i]);
		}
		if(cdt.indexOf('!')>=0){
			cdt = cdt.replace(/\!/g,'');
		}
		//console.log(cdt);
		cdt = eval(cdt);
		return d.is(cdt,'Boolean') ? cdt : false;
	}
	com._base_.prototype._isMobile = function(){return d.browser.isMobile();}
	com._base_.prototype._isPad = function(){return d.browser.isPad();}
	com._base_.prototype._isPc = function(){return d.browser.isPC();}
	com._base_.prototype._isResizeable = function(){return !d.browser.isMobile() && !this.runtime.inter;}

	//on方法，由 trigger() 接口方法调用
	com._base_.prototype.onDefault = function(key,val){
		//d.log(this.id+'.runtime.'+key+' has been changed into [ '+val+' ]');
	}
	com._base_.prototype.onCreated = function(){
		if(this._is('_loaded')){	//重新加载

		}else{	//初始加载
			this.load();
		}
	}
	com._base_.prototype.onParent = function(){
		var sidx = this.idx,
			pidx = this.runtime.parent.idx,
			psidx = this.runtime.parent.subidx;
		var p = com.item(pidx);
		if(p.runtime.sub.indexOf(sidx)<0){
			/*if(psidx<0){
				com.item(pidx)._addSubCom(sidx);
				this.runtime.parent.subidx = com.item(pidx).runtime.sub.length-1;
			}else{*/
			var subcomidx = com.item(pidx).runtime.sub[psidx];
			if(!d.is(subcomidx,'Undefined') && !d.is(subcomidx,'Null')){
				var subcom = com.item(subcomidx);
				subcom.remove();
			}
			com.item(pidx).runtime.sub[psidx] = sidx;
			//}
		}
	}
	com._base_.prototype.onSize = function(){
		var rs = this.runtime.size;
		this.resizeTo(rs[0],rs[1]);
	}
	com._base_.prototype.onBeforeremove = function(){	//组件销毁前动作，子类实现

	}

	//接口方法
	com._base_.prototype.$ = function(selector){	//获取组件内DOM元素
		if(!d.is(this.dom[selector],'Undefined')){
			return this.dom[selector];
		}else{
			var bd = this.body;
			return $(selector,bd);
		}
	}
	com._base_.prototype.set = function(key, val){
		this.runtime[key] = val;
		return this.trigger.apply(this,arguments);
	}
	com._base_.prototype.trigger = function(key){
		if(key.indexOf('_')==0){
			key = key.replace('_','');
		}
		var m = this['on'+key.toLowerCase().ucfirst()];
		if(d.is(m,'Function')){
			m.apply(this,arguments);
		}
		this.onDefault.apply(this,arguments);
		return this;
	}
	com._base_.prototype.option = function(key, val){
		if(d.is(key,'String') && key!=''){
			if(d.is(val,'Undefined')){
				return this._option[key];
			}else{
				var oval = this._option[key];
				if(d.is(oval,'Object')){
					this._option[key] = d.extend(oval,val);
				}else{
					this._option[key] = val;
				}
				return this._option[key];
			}
		}else if(d.is(key,'Object') && !d.is.empty(key)){
			var rst = {};
			for(var i in key){
				rst[i] = this.option(i,key[i]);
			}
			return rst;
		}else{
			return false;
		}
	}
	com._base_.prototype.run = function(m){
		var func = this._method[m];
		func = !d.is(func,'Function') ? this[m] : func;
		if(d.is(func,'Function')){
			var p = [];
			for(var i=1; i<arguments.length; i++){
				p.push(arguments[i]);
			}
			var rst = func.apply(this,p);
			return d.is(rst,'Undefined') ? this : rst;
		}else{
			d.log(this.comType+'组件实例[ '+this.id+' ]通过run()接口调用方法[ '+m+' ]失败！方法可能未定义！');
		}
		return this;
	}
	com._base_.prototype.notice = function(dotype, target, source){	//组件通知处理，0参数：获取com._notice
		var aln = arguments.length;
		if(aln<=0){		//获取通知列表
			return this._notice;
		}else{
			var nl = this._notice;
			switch(dotype){
				case 'unregall' : 	//注销全部通知
					for(var i=0;i<nl.length;i++){
						d.notice.unregByIdx(nl[i].idx);
					}
					this._notice = [];
					break;
				case "reg" :
					this._notice.push({
						source : source,
						target : target,
						idx : d.notice.reg({
							source : source,
							target : target
						})
					});
					break;
			}
		}
	}
	com._base_.prototype.cache = function(key, val){
		if(d.is(key,'String') && key!=''){
			if(d.is(val,'Undefined')){
				return this._cache[key];
			}else{
				var oval = this._cache[key];
				if(d.is(oval,'Object')){
					this._cache[key] = d.extend(oval,val);
				}else{
					this._cache[key] = val;
				}
				return this._cache[key];
			}
		}else if(d.is(key,'Object') && !d.is.empty(key)){
			var rst = {};
			for(var i in key){
				rst[i] = this.cache(i,key[i]);
			}
			return rst;
		}else{
			return false;
		}
	}
	com._base_.prototype.parentCom = function(opt){
		var pidx = -1;
		if(d.is(opt,'Object') && d.is(opt.parent,'Object') && d.is(opt.parent.idx,'Number')){
			pidx = opt.parent.idx;
		}else{
			pidx = this.runtime.parent.idx;
		}
		if(pidx>=0){
			return com.item(pidx);
		}else{
			return null;
		}
	}
	com._base_.prototype.layout = function(){	//组件界面尺寸调整，子类必需实现此接口
		var s = this.runtime.size;

		this.layoutSubCom();
		return this;
	}
	com._base_.prototype.layoutSubCom = function(){
		var sc = this.runtime.sub;
		for(var i=0;i<sc.length;i++){
			if(d.is(sc[i],'Number') && parseInt(sc[i])>=0){
				com.item(parseInt(sc[i])).layout();
			}
		}
	}
	com._base_.prototype.resizeTo = function(w, h, callback){
		if(this._is('resizeable')){
			var ow = this.body.width(), oh = this.body.height(),
				ot = this.body.offset().top, ol = this.body.offset().left,
				ww = $(window).width(), wh = $(window).height();
			var tw = w<this._option.minsize[0] ? ow : (w>ww ? ww : w), th = h<this._option.minsize[1] ? oh : (h>wh ? wh : h);
			var tt = ot-(h-oh)/2, tl = ol-(w-ow)/2;
			tt = tt+th>wh ? wh-th : (tt<0 ? 0 : tt);
			tl = tl+tw>ww ? ww-tw : (tl<0 ? 0 : tl);
			var tcss = {};
			if(tw!=ow){tcss.width = tw; tcss.left = tl; this.runtime.size[0] = tw;}
			if(th!=oh){tcss.height = th; tcss.top = tt; this.runtime.size[1] = th;}
			//console.log(d.dump(tcss));
			var _com = this;
			this.body/*.stop(true,false)*/.animate(tcss,d.option.ui.dura.l,d.option.ui.easing(),function(){
				_com.layout();
				return _com._callback(callback);
			});
		}else{
			return this._callback(callback)
		}
	}
	com._base_.prototype.load = function(callback){	//组件启动，加载业务内容，需要在子类中实现此接口

		return this._callback(callback);
	}
	com._base_.prototype.reload = function(opt, callback){	//组件重新加载，子类实现

		return this._callback(callback);
	}
	com._base_.prototype.clear = function(callback){	//清空组件内容，子类需覆盖
		this._createSubComList();
		this.content.html('');
		return this._callback(callback);
	}
	com._base_.prototype.remove = function(){	//组件自销毁方法，子类可覆盖
		this.trigger('beforeremove');
		this._removeSubCom();
		this.notice('unregall');	//注销通知
		if(d.is.$(this.body)){
			this.body.remove();
		}
		var idx = this.idx;
		com.remove(idx);
	}
	com._base_.prototype.pop = function(){	//重复创建组件时，组件置于前端，并闪烁提示，可在子类中覆盖
		//检查组件dom是否存在
		var hid = this.hid, ctn = this.container;
		if($('#'+hid,ctn).length<=0){	//组件dom已经不存在了
			return this.recreate();
		}else{	//组件dom存在
			return this.attention();
		}
	}
	com._base_.prototype.attention = function(){	//组件闪烁
		this.body.ani('flash');
		return this;
	}
	

	com._base_.prototype.init = function(opt, callback){
		if(this.runtime._created){	//重新初始化
			if(d.is(opt,'Object') && !d.is.empty(opt)){
				this._setOpt(opt);
			}
		}else{	//初始化
			//创建DOM
			return this._createDom(function(){
				//附加信息到DOM
				return this._attrToDom(function(){
					//子组件初始化
					return this._initSubCom(function(){
						//如果存在父组件，则关联之
						return this._fixParent(function(){
							//执行afterCreate
							this.run('afterCreate');
							//结束创建
							return this.set('_created',true);
						});
					});
				});
			});
		}
	}
	com._base_.prototype.recreate = function(){		//重新创建组件dom内容，从com.domcache缓存中恢复
		//创建DOM
		var hid = this.hid;
		this.container.append($('#'+hid,com.domcache));
		//将必要attr写入container
		this._attrToDom();
	}

	
	d.com = com;
})(window, window.DommyJS);

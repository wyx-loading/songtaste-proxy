var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'), 
    iconv = require('iconv-lite'), 
    harmon = require('harmon'), 
    fs = require('fs');


var selects = [];

var bodyselect = {};

bodyselect.query = 'body';
bodyselect.func = function(node) {
	var stm = node.createStream({outer : false});
	var all = '';

	stm.on('data', function(data) {
		data = iconv.decode(data, 'gbk').toString('utf8');
		all += data;
	});

	stm.on('end', function() {
		all = all.replace(/<!--([\s\S]*?)-->/g, "$1");
		all = all.replace(/^\/\/(.*$)/mg, "$1");

        // all = all.replace("<!-- <div id=\"playicon", "<div id=\"playicon");
        // all = all.replace("<link rel=\"stylesheet\" href=\"http://www.songtaste.com/plugin/fancybox/jquery.fancybox-1.3.4.css\" type=\"text/css\" /> -->", "<link rel=\"stylesheet\" href=\"http://www.songtaste.com/plugin/fancybox/jquery.fancybox-1.3.4.css\" type=\"text/css\" />");

		process.stdout.write('deal body\n');
		var resStr = iconv.encode(all, 'gbk');
		stm.end(resStr);
	});
}

selects.push(bodyselect);

// var tjselect = {};

// tjselect.query = '.tj_scleft';
// tjselect.func = function(node) {
// 	var stm = node.createStream({outer : false});
// 	var all2 = '';

// 	stm.on('data', function(data) {
// 		data = iconv.decode(data, 'gbk').toString('utf8');
// 		all2 += data;
// 	});

// 	stm.on('end', function() {
// 		all2 = all2.replace(/<!--([\s\S]*?)-->/g, "$1");
// 		all2 = all2.replace(/^\/\/(.*$)/mg, "$1");

// 		process.stdout.write('deal .tj_scleft\n');
// 		var resStr = iconv.encode(all, 'gbk');
// 		stm.end(resStr);
// 	});
// }
// 
// selects.push(tjselect);

var imgSelector = {};
imgSelector.query = '.song_left > img';
imgSelector.func = function(node) {
	var stm = node.createStream({ outer : true });
    stm.on('data', function(data) {
    });

    stm.on('end', function() {
   	  process.stdout.write('remove .song_left > img\n');
      stm.end('');
    });    
}
selects.push(imgSelector);

//
// Basic Connect App
//
var app = connect();

var proxy = httpProxy.createProxyServer({
   target: 'http://songtaste.com'
})


app.use(harmon([], selects));

app.use(
  function (req, res) {
    proxy.web(req, res);
  }
);

http.createServer(app).listen(8093);

var pid = process.pid;
console.log(pid);
var pidFile = 'pid.txt';
var existsSync = fs.existsSync || path.existsSync;
existsSync(pidFile) && fs.unlinkSync(pidFile);
fs.writeFile(pidFile, '' + pid, function(err) {
  if(err) console.log(err);
});
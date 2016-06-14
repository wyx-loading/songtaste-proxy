var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'), 
    iconv = require('iconv-lite'), 
    fs = require('fs');


var selects = [];
var simpleselect = {};

//<img id="logo" src="/images/logo.svg" alt="node.js">
simpleselect.query = '.song_left';
simpleselect.func = function (node) {
    
    //Create a read/write stream wit the outer option 
    //so we get the full tag and we can replace it
    var stm = node.createStream({ outer : true });

    //variable to hold all the info from the data events
    var all = '';

    //collect all the data in the stream
    stm.on('data', function(data) {
       all += data;
    });

    //When the read side of the stream has ended..
    stm.on('end', function() {

      all = iconv.encode(all, 'utf8');
      all = all.toString();
      process.stdout.write(all);

      fs.writeFile("C:\\Users\\wuyuxiang\\Desktop\\harmon-master\\myTest\\before", all, function(err) {
          if (err) throw err;
      });

      all = all.replace("<!-- <div id=\"playicon", "<div id=\"playicon");
      all = all.replace("<link rel=\"stylesheet\" href=\"http://www.songtaste.com/plugin/fancybox/jquery.fancybox-1.3.4.css\" type=\"text/css\" /> -->", "<link rel=\"stylesheet\" href=\"http://www.songtaste.com/plugin/fancybox/jquery.fancybox-1.3.4.css\" type=\"text/css\" />");

      fs.writeFile("C:\\Users\\wuyuxiang\\Desktop\\harmon-master\\myTest\\after", all, function(err) {
          if (err) throw err;
      });

      
      //Now on the write side of the stream write some data using .end()
      //N.B. if end isn't called it will just hang.  
      stm.end(all, 'utf8');
    
    });    
}

selects.push(simpleselect);

//
// Basic Connect App
//
var app = connect();

var proxy = httpProxy.createProxyServer({
   target: 'http://songtaste.com'
})


app.use(require('../')([], selects));

app.use(
  function (req, res) {
    proxy.web(req, res);
  }
);

http.createServer(app).listen(8091);

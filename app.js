var http = require('http');
var URL = require('url');
var uglify = require('uglify-js');
var fs = require('fs');

var clientjs;
var html = {
    index: 'There is a problem on our end.'
};

var loadClientjs = function(){
    return uglify.minify(['client/app.js',
			  'client/misc.js']);
};

var loadHtml = function(fileName){
    return fs.readFileSync(fileName, { encoding: 'utf8'});
};

var loadClientStuff = function(){
    clientjs = loadClientjs();
    html.index = loadHtml('client/index.html');
};

loadClientStuff();

http.createServer(function(req, res) {
    var url = URL.parse(req.url);
    switch(url.pathname){
	case '/': {
	    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	    res.end(html.index);
	    break;
	}
	case '/r/a.js': {
	    res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
	    res.end(clientjs.code);
	    break;
	}
	case '/reload': {
	    loadClientStuff();
	    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
	    res.end('Reloaded at ' + new Date());
	}
	default: {
	    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
	    res.end('The path "' + url.pathname + '", leads nowhere.');
	}
    }
}).listen(8080);

console.log('Server is running.');

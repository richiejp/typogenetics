var http = require('http');
var URL = require('url');
var uglify = require('uglify-js');
var fs = require('fs');

var clientjs = uglify.minify(['client/app.js',
			      'client/misc.js']);
var html = {
    index: fs.readFileSync('client/index.html', { encoding: 'utf8'})
};

http.createServer(function(req, res) {
    var url = URL.parse(req.url);
    switch(url.pathname){
	case '/': {
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.end(html.index);
	    break;
	}
	case '/r/a.js': {
	    res.writeHead(200, {'Content-Type': 'application/javascript'});
	    res.end(clientjs.code);
	    break;
	}
	default: {
	    res.writeHead(404, {'Content-Type': 'text/plain'});
	    res.end('The path "' + url.pathname + '", leads nowhere.');
	}
    }
}).listen(8080);

console.log('Server is running.');

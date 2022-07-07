
const cors_proxy = require('cors-anywhere');

const host = 'localhost';
const port = 8080;

cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    // requireHeader: ['referer'],
    // removeHeaders: ['cookie', 'cookie2']
    addHeaders: ["User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"]
}).listen(port, host, function() {
   process.env.DEBUG && console.log('cors_proxy','Running CORS Anywhere on ' + host + ':' + port);
});
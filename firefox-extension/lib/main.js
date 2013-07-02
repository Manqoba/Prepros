exports.main = function() {

    Array.prototype.contains = function(item) {
        var i = this.length;
        while (i--) {
            if (this[i] === item) {
                return true;
            }
        }
        return false;
    };

    function parseUrl(string){

        'use strict';
        
        var parser = document.createElement('a');
        
        parser.href = string;
        
        return parser;
    }

    var socketRunning = false,
	    liveUrls = [];

    function startSocket(){
        
        'use strict';
        
	    var socket = new WebSocket('ws://localhost:5656');

	    socket.addEventListener('message', function(evt){
            
            liveUrls = [];

            JSON.parse(evt.data).urls.forEach(function(url) {
                
                liveUrls.push(url);
                
                require('sdk/tabs').forEach(function(tab){
                
                    if(liveUrls.contains(parseUrl(tab.url).protocol + '//' + parseUrl(tab.url).host)) {

                        tab.reload();

                    }
                });
                
            });

        });
        
        socket.addEventListener('open', function(){
            
            socketRunning = true;
        });
        
        socket.addEventListener('close', function(){
            
            socketRunning = false;
        });
    }
    
    require('sdk/tabs').on('ready', function(tab) {
    
        'use strict';
        
        if(!socketRunning) {
                
            startSocket();
        }
        
        var parsedUrl = parseUrl(tab.url).protocol + '//' + parseUrl(tab.url).host;
        
        if(tab.url.match(/^file:\/\/\//gi) || liveUrls.contains(parsedUrl)) {
        
        
            tab.attach({
                contentScript: "(function(){var script = document.createElement('script');" +
                                "document.querySelector('body').appendChild(script);" +
                                "script.src='http://localhost:5656/lr/livereload.js?snipver=1&host=localhost&port=25690';" +
                                "})();"
            });
        
        }
    });
}
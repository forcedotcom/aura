({
    init: function(cmp) {
        function receiveMessage(e) {
            // respond to message via port to use MessageChannel
            e.ports[0].postMessage('Message from iframe: ' + e.data);
        }
        window.addEventListener('message', receiveMessage);

        // set flag here to avoid race conditions waiting for iframe onload event
        cmp.set("v.loaded", true);
    }
})

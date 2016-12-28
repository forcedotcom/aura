({
    init: function(cmp) {
        function receiveMessage(e) {
            e.source.postMessage({ msg: "Message from iframe: " + e.data.msg }, '*');
        }
        window.addEventListener('message', receiveMessage);
    }
})

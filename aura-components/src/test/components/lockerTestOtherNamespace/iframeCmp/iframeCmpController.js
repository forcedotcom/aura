({
    init: function(cmp) {
        function receiveMessage(e) {
            var msg = e.data.msg;
            if(msg === "pingParent"){
                window.parent.postMessage({ msg: e.data.msg, parentWindow: window.parent.toString(), topWindow: window.top.toString()}, '*');
            }else{
                e.source.postMessage({ msg: "Message from iframe: " + e.data.msg }, '*');
            }
        }
        window.addEventListener('message', receiveMessage);
    }
})

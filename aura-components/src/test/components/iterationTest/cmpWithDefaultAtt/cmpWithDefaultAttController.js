({
    init: function(cmp) {
        var messages = cmp.get("v.messages");
        var color = cmp.get("v.color");
        messages.push(color + " #" + messages.length)
        cmp.set("v.messages", messages);
    }
})
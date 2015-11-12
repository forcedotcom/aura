({
	helperMethod: function() { 
        alert("{ document: " + document.toString() + " }");
	},
    
    log: function(component, message) {
        var content = component.find("content");
        var messageDiv = document.createElement("div");
        messageDiv.appendChild(document.createTextNode(message));
        content.getElement().appendChild(messageDiv);
    }
})
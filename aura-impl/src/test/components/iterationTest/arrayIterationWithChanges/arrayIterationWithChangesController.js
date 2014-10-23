({
    init: function(cmp) {
        var colors = cmp.get('v.colors');
        var items = [];
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            items.push({text: color, color: color});
        }
        cmp.set('v.items', items);
    },
    addBefore: function(cmp, event) {
        var items = cmp.get('v.items');
        items = [{
                text: "ultra-violet 1", color: "black"
            },{
                text: "ultra-violet 2", color:"black"
            }].concat(items);
        
        var text="";
    	for(var i = 0;i<items.length;i++) {
    		text=text+" "+items[i].text;
    	}
        $A.log("addBefore, new items:",text);
        
        cmp.set('v.items', items);
    },
    addInside: function(cmp, event) {
        var items = cmp.get('v.items');
        var index = 0;
        while (items[index].text !== "yellow") {
            index++;
        }
        items.splice(index, 0, {text: "g-y 2", color: "greenyellow"});
        items.splice(index, 0, {text: "g-y 1", color: "greenyellow"});
        
        var text="";
    	for(var i = 0;i<items.length;i++) {
    		text=text+" "+items[i].text;
    	}
        $A.log("add inside, new items:",text);
        
        cmp.set('v.items', items);
    },
    
    addAfter: function(cmp, event) {
        var items = cmp.get('v.items');
        items = items.concat([{
                text: "infra-red 1", color: "black"
            },{
                text: "infra-red 2", color: "black"
            }]);
        
        var text="";
    	for(var i = 0;i<items.length;i++) {
    		text=text+" "+items[i].text;
    	}
        $A.log("add after, new items:",text);
        
        cmp.set('v.items', items);
    }

})
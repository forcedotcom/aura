({
    init: function(cmp, event, helper) {
        var colors = cmp.get('v.colors');

        var items = [];
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            items.push({text: color, color: color});
        }
        if(items.length > 0) {
        	var newCmpList = helper.newComponentList(cmp, items);
        	cmp.find('output').set('v.body', newCmpList);
        } else {
        	$A.log("colors are empty, do not change v.body:",cmp.get('v.body'));
        }
    },
    addBefore: function(cmp, event, helper) {
        var newCmpList = helper.newComponentList(cmp, [{
            text: 'ultra-violet 1', color: 'black'
        },{
            text: 'ultra-violet 2', color: 'black'
        }]);

        var body = cmp.find('output').get('v.body');
        body = newCmpList.concat(body);
        cmp.find('output').set('v.body', body);
    },
    addInside: function(cmp, event, helper) {
        var newCmpList = helper.newComponentList(cmp, [{
            text: 'g-y 1', color: 'greenyellow'
        },{
            text: 'g-y 2', color: 'greenyellow'
        }]);

        var body = cmp.find('output').get('v.body');

        var index = 0;
        while (body[index].getLocalId() !== 'yellow') {
            index++;
        }

        body.splice(index, 0, newCmpList[0]);
        body.splice(index+1, 0, newCmpList[1]);

        cmp.find('output').set('v.body', body);
    },
    addAfter: function(cmp, event, helper) {
        var newCmpList = helper.newComponentList(cmp, [{
            text: 'infra-red 1', color: 'black'
        },{
            text: 'infra-red 2', color: 'black'
        }]);

        var body = cmp.find('output').get('v.body');
        body = body.concat(newCmpList);
        cmp.find('output').set('v.body', body);
    }
})
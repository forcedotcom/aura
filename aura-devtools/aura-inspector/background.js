var AuraInspector = {
    
    frameStartTime : 0,
    
    tabs : {},
    
    ports : {},

    subscriptions : {},

    connect : function(port){
        var tab = port.sender.tab;
        if(port.name){
            AuraInspector.ports[port.name] = port;
        }else if(tab){
            var tabId = tab.id;
            var tabInfo = AuraInspector.tabs[tabId];
            if(!tabInfo){
                tabInfo = {sources : {}};
                AuraInspector.tabs[tabId] = tabInfo;
            }
            tabInfo.port = port;
        }
        port.onMessage.addListener(AuraInspector.handleMessage);
            
    },
    
    handleMessage : function(message){
        if(message.subscribe){
            var port = message.port;
            for(var i=0;i<message.subscribe.length;i++){
                var type = message.subscribe[i];
                var sub = AuraInspector.subscriptions[type];
                if(!sub){
                    sub = [];
                    AuraInspector.subscriptions[type] = sub;
                }
                sub.push(port);
            }
        }else{
            var str = "";
            for (x in message) {
                str += x+" = "+message[x]+"\n";
            }
            var action = AuraInspector.actions[message.action];
            if(action){
                action(message.params);
            }
            var subscriptions = AuraInspector.subscriptions[message.action];
            if(subscriptions){
                for(var j=0;j<subscriptions.length;j++){
                    var port = AuraInspector.ports[subscriptions[j]];
                    port.postMessage(message);
                }
            }
        }
    },
    
    actions : {
        requestComponentTree : function(params){
            chrome.tabs.getSelected(undefined, function(tab){
                var port = AuraInspector.tabs[tab.id].port;
                if (port) {
                    port.postMessage({action : "getComponentTree"});
                } else {
                    alert("Failed to access tab="+tab.id);
                }
            });
        },

        highlightElements : function(globalId){
            chrome.tabs.getSelected(undefined, function(tab){
                var port = AuraInspector.tabs[tab.id].port;
                if (port) {
                    port.postMessage({action : "highlightElements", params : globalId});
                } else {
                    alert("Failed to access tab="+tab.id);
                }
            });
        }
    }
};

chrome.extension.onConnect.addListener(AuraInspector.connect);

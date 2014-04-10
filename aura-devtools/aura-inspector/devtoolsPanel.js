var AuraInspectorDevtoolsPanel = {
    port : null,

    connect : function(){
        AuraInspectorDevtoolsPanel.port = chrome.extension.connect({name : "AuraInspectorDevtoolsPanel"});
        AuraInspectorDevtoolsPanel.port.onMessage.addListener(AuraInspectorDevtoolsPanel.handleMessage);
        AuraInspectorDevtoolsPanel.port.postMessage({subscribe : ["publishComponentTree"], port : AuraInspectorDevtoolsPanel.port.name});
    },

    disconnect : function(port) {
        // doh! what should we do?
        AuraInspectorContentScript.port = null;
        setTimeout(AuraInspectorContentScript.connect, 1500);
    },
    
    handleMessage : function(message){
        AuraInspectorDevtoolsPanel.actions[message.action](message.params);
    },
    
    actions : {
        getComponentTree : function(){
            AuraInspectorDevtoolsPanel.port.postMessage({action : "requestComponentTree"});
        },

        publishComponentTree : function(params){
            var treeElement = document.getElementById("tree");
            treeElement.innerHTML = "";
            var tree = JSON.parse(params);
            treeElement.appendChild(AuraInspectorDevtoolsPanel.createFolder({value:tree, expanded : true}));
            //document.body.innerHTML = "tree : " + tree.toString();
        },

        highlightElements : function(globalId){
            AuraInspectorDevtoolsPanel.port.postMessage({action : "highlightElements", params : globalId});
        }
    },

    isArray : function(obj){
        return obj && obj.constructor === Array;
    },

    isObject : function(obj){
        return !!obj && Object.prototype.toString.apply(obj) === '[object Object]';
    },

    isString : function(obj){
        return obj !== null && obj !== undefined && typeof obj === 'string';
    },

    nodeId : 0,

    createFolder : function(config){
        config = config || {};
        var root = document.createElement("li");

        root.onmouseout = function(){
            AuraInspectorDevtoolsPanel.actions.highlightElements();
        };
        

        var value = config.value;
        var text = config.label || "" ;
        if(text.indexOf ("_") === 0){
            text = text.substring(1);
        }

        text = '<span class="label">'+text+'</span>';

        var hasBody = false;
        if(AuraInspectorDevtoolsPanel.isArray(value)){
            text = text + " ["+value.length+"]";

            if(value.length == 0){
                hasBody = false;
                value = undefined;
            }else{
                hasBody = true;
            }
        }else if (AuraInspectorDevtoolsPanel.isObject(value)){
            hasBody = true;

            if(value._descriptor){
                if(text && text.length > 0){
                    text = text + " : "
                }
                text += value._descriptor;
            }
        }

        if(hasBody){
            var label = document.createElement("label");
            label.for = "folder"+(AuraInspectorDevtoolsPanel.nodeId++);

            if(config.value && config.value.globalId){

                var globalId = config.value.globalId;
                label.onmouseover = function(){
                    AuraInspectorDevtoolsPanel.actions.highlightElements(globalId);
                };
            }

        
            label.innerHTML = text;
            root.appendChild(label);

            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = label.for;


            if(config.expanded){
                checkbox.checked = "checked";
            }
            if(config.disabled){
                checkbox.disabled = "disabled";
            }
            root.appendChild(checkbox);

            var contents = document.createElement("ol");

            function createContents(){
                if(AuraInspectorDevtoolsPanel.isObject(value)){
                    for(var key in value){
                        contents.appendChild(AuraInspectorDevtoolsPanel.createFolder({label : key, value : value[key]}));
                    }
                }else if(AuraInspectorDevtoolsPanel.isArray(value)){
                    for(var i=0;i<value.length;i++){
                        contents.appendChild(AuraInspectorDevtoolsPanel.createFolder({label : "["+i+"]" , value : value[i]}));
                    }
                }
            }

            if(!config.expanded){
                checkbox.onchange = function(){
                    if(this.checked && !this.done){
                        this.done = true;
                        createContents();
                        delete this.onchange;
                    }
                }
            }else{
                createContents();
            }
            root.appendChild(contents);
        }else{
            if(value !== undefined){
                text += " : ";
                if(AuraInspectorDevtoolsPanel.isString(value)){
                        text += '"';
                }
                text += value;
                if(AuraInspectorDevtoolsPanel.isString(value)){
                        text += '"';
                }
            }
            root.innerHTML = text;
        }

        return root;
    }
};

AuraInspectorDevtoolsPanel.connect();
window.refresh = function(){
    AuraInspectorDevtoolsPanel.actions.getComponentTree();
};

window.refresh();

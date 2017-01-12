// xUnit.js.Extensions 
 
Function.RegisterNamespace("xUnit.js.Extensions.Attributes");

xUnit.js.Extensions.Attributes.MockDomAttribute=function(){
    // ctor
    function MockDomAttribute(){
        this.base("MockDom");
        if(!Object.IsType(Function,this.Target))throw new Error("xUnit.js.Extensions.Attributes.MockDomAttribute.ctor: unable to locate attribute target.");
        if(Object.IsType(Function,this.Target.GetDecoration)){
            var targetMethod=this.Target.GetDecoration().GetMethod();
            if(targetMethod.GetModel){
                var model=targetMethod.GetModel();
                if(Object.Implements(xUnit.js.Model.IMockable,model)){
                    model.AddMock(xUnit.js.Extensions.Mocks.Dom.GetDom());
                }
            }
        }
    }
    MockDomAttribute.apply(this,arguments);
}

xUnit.js.Extensions.Attributes.MockDomAttribute.Inherit(System.Script.Attributes.Attribute);
 
 
Function.RegisterNamespace("xUnit.js.Extensions.Mocks");

xUnit.js.Extensions.Mocks.Dom=new function(){
    // Public methods
    this.GetDocument=function(document){
        if(!document)document=xUnit.js.Extensions.Stubs.Dom.GetDocument();
        return Mocks.GetMock(Object.Global(),"document",document);
    };

    this.GetDom=function(window){
        if(!window)window=xUnit.js.Extensions.Stubs.Dom.GetWindow();
        function Mockery(during){
            var initialState=collectState();
            var keys=Object.GetKeys(window);
            var mockeries={
                "window":Object.Global()
            };

            for(var i=0;i<keys.length;i++){
                mockeries[keys[i]]=window[keys[i]];
            }
            
            Mocks.GetMocks(Object.Global(),mockeries)(during);
        
            var currentState=collectState();
            for(var i=0;i<currentState.length;i++){
                if(!Array.Contains(initialState,currentState[i])){
                    window[currentState[i]]=Object.Global()[currentState[i]];
                    delete Object.Global()[currentState[i]];
                }
            }
        }
        Mockery.IsMock=true;
        return Mockery;
    };

    this.GetWindow=function(window){
        if(!window)window=xUnit.js.Extensions.Stubs.Dom.GetWindow();
        return Mocks.GetMock(Object.Global(),"window",window);
    };

    this.GetXhr=function(){
        return Mocks.GetMock(Object.Global(),"XMLHttpRequest",xUnit.js.Extensions.Stubs.Dom.GetXhr());
    };

    // Private Methods
    function collectState(){
        var bothersomeMembers=["setTimeout","clearTimeout"];
        return Object.GetKeys(Object.Global()).concat(bothersomeMembers);    
    }
}; 
 
Function.RegisterNamespace("xUnit.js.Extensions.Stubs");

xUnit.js.Extensions.Stubs.Dom=new function(){
    // Public Methods
    var _stubDom=this;

    this.GetDocument=function(properties,childNodes){
        var document=_stubDom.GetNode(Object.Copy({
            createComment:Stubs.GetMethod(function(data){
                return _stubDom.GetNode({nodeValue:data||'',textContent:data||''},null,null,"#comment",8);
            }),
            createDocumentFragment:Stubs.GetMethod(function(){
                return _stubDom.GetNode(null,null,null,"#document-fragment",11);
            }),
            createElement:Stubs.GetMethod(function(tagName){
                return _stubDom.GetNode(null,null,null,tagName);
            }),
            getElementById:Stubs.GetMethod(function(id){
                return getNodesByMatch(this,function(node){return node.id==id},1)[0]||null;
            }),
            implementation:Stubs.GetObject({
                createDocument:function(namespaceURI,qualifiedNameStr,documentType){
                    return _stubDom.GetDocument();
                },
                createHTMLDocument:function(title){
                    return _stubDom.GetDocument({title:title||''});
                }
            }),
            title:''
        },properties||{}),null,childNodes,"#document",9);
        document.body=getNodesByMatch(document,function(node){return node.tagName=="BODY"},1)[0]||_stubDom.GetNode(null,null,null,"BODY");
        addEventHandling(document);
        return document;
    };

    this.GetLocation=function(url){
        var location=Stubs.GetObject({
            assign:function(url){
                setLocation(this,url);
            },
            reload:function(forcedReload){},
            replace:function(url){
                setLocation(this,url);
            }
        },{
            hash:'',
            host:'',
            hostname:'',
            href:'',
            pathname:'',
            port:'',
            protocol:'',
            search:''
        });
        setLocation(location,url);
        return location;
    };

    this.GetNode=function(properties,attributes,childNodes,nodeName,nodeType){
        var _attributes=Object.Copy({},attributes||{});
        var _childNodes=Array.Copy(childNodes||[]);
        if(!nodeName)nodeName="div";
        if(!String.StartsWith('#',nodeName))nodeName=nodeName.toUpperCase();
        
        var node=Stubs.GetObject({
            appendChild:function(child){
                assignReferences(this.childNodes[this.childNodes.length-1],undefined,child);
                assignReferences(child, this.childNodes[this.childNodes.length-1],null,this);
                this.childNodes.push(child);
                resetChildPointers(this);
                return child;
            },
            blur:{},
            cloneNode:function(deep){
                return _stubDom.GetNode(Object.Copy({},this,{baseURI:1,nodeValue:null,ownerDocument:null,textContent:''}),_attributes,deep?this.childNodes:null,this.nodeName,this.nodeType);
            },
            focus: {},
            getAttribute:function(name){return _attributes[name]||null;},
            getElementsByClassName:function(names){
                names=names.split(/\s+/);
                return getNodesByMatch(this.childNodes,function(node){
                    var classes=node.className.split(/\s+/);
                    for(var i=0;i<names.length;i++){
                        if(!names[i]){
                            names.splice(i--,1);
                            continue;
                        }
                        for(var j=0;j<classes.length;j++){
                            if(!classes[j]){
                                classes.splice(j--,1);
                                continue;
                            }
                            if(names[i]==classes[j])return true;
                        }
                    }
                    return false;
                });
            },
            getElementsByTagName:function(tagName){
                return getNodesByMatch(this.childNodes,function(node){return node.tagName==tagName});
            },
            hasChildNodes:function(){return this.childNodes.length>0;},
            insertBefore:function(newElement,referenceElement){
                if(!referenceElement)return this.appendChild(newElement);
                for(var i=0;i<this.childNodes.length;i++){
                    if(this.childNodes[i]==referenceElement){
                        assignReferences(newElement,referenceElement.previousSibling, referenceElement, this);
                        assignReferences(referenceElement,newElement);
                        this.childNodes.splice(i,0,newElement);
                        resetChildPointers(this);
                        return newElement;
                    }
                }
                throw new Error("xUnit.js.Extensions.Stubs.Dom.GetNode.insertBefore: 'referenceElement' was not found in the childNodes collection.");
            },
            removeChild:function(child){
                for(var i=0;i<this.childNodes.length;i++){
                    if(this.childNodes[i]==child) {
                        assignReferences(this.childNodes[i-1],undefined,this.childNodes[i+1]||null);
                        assignReferences(this.childNodes[i+1],this.childNodes[i-1]||null);
                        assignReferences(child,null,null,null);
                        this.childNodes.splice(i,1);
                        resetChildPointers(this);
                        return child;
                    }
                }
                throw new Error("xUnit.js.Extensions.Stubs.Dom.GetNode.removeChild: 'child' was not found in the childNodes collection.");
            },
            replaceChild: function (newChild,oldChild) {
                for(var i=0;i<this.childNodes.length;i++){
                    if(this.childNodes[i]==oldChild){
                        assignReferences(this.childNodes[i-1],undefined,newChild);
                        assignReferences(this.childNodes[i+1],newChild);
                        assignReferences(newChild,this.childNodes[i-1]||null,this.childNodes[i+1]||null,this);
                        assignReferences(oldChild,null,null,null);
                        this.childNodes[i]=newChild;
                        resetChildPointers(this);
                        return oldChild;
                    }
                }
                throw new Error("xUnit.js.Extensions.Stubs.Dom.GetNode.replaceChild: 'oldChild' was not found in the childNodes collection.");
            },
            setAttribute:function(name,value){_attributes[name]=value;}
        },Object.Copy({
            baseURI:'',
            childNodes:_childNodes,
            children:_childNodes,
            className:'',
            firstChild:null,
            id:'',
            lastChild:null,
            nextSibling:null,
            nodeName:nodeName,
            nodeType:nodeType||1,
            nodeValue:null,
            ownerDocument:null,
            parentElement: null,
            parentNode:null,
            previousSibling:null,
            tagName:nodeName,
            textContent:''
        }, properties||{}));
        for(var i=0;i<_childNodes.length;i++){
            assignReferences(_childNodes[i],_childNodes[i-1]||null,_childNodes[i+1]||null,node);
        }
        resetChildPointers(node);
        addEventHandling(node);
        return node;
    };

    this.GetWindow=function(url,name){
        var window=Stubs.GetObject({
            alert:function(message){},
            open:function(url,name,features){
                var newWindow=_stubDom.GetWindow(url,name);
                return 
            },
            setInterval:function(handler,interval){
                handler();
            },
            setTimeout:function(handler,timeout){
                handler();
            }
        },{
            document:_stubDom.GetDocument(),
            history:{},
            location:_stubDom.GetLocation(url),
            name:name||'',
            navigator:{"userAgent":''},
            XMLHttpRequest:_stubDom.GetXhr()
        });
        addEventHandling(window);
        return window;
    };

    this.GetXhr=function(response,headers,status,statusText){
        if(!response)response='';
        headers=Object.Copy({},headers||{});
        return Stubs.GetObject({
            abort:{},
            getAllResponseHeaders:function(){return headers;},
            getResponseHeader:function(header){return headers[header]||null;},
            open:function(method,url,async,user,password){
                this.readyState=1;
                if(Object.IsType(Function,this.onreadystatechange)){
                    this.onreadystatechange();
                }
            },
            overrideMimeType:{parameters:["mimeType"]},
            send:function(data){
                for(var i=2;i<=4;i++){
                    this.readyState=i;
                    if(Object.IsType(Function,this.onreadystatechange)){
                        this.onreadystatechange();
                    }
                }
            },
            setRequestHeader:function(header,value){headers[header]=value;}
        }, {
            readyState:0,
            response:response,
            responseText:response,
            responseType:'',
            responseXML:response,
            status:status||200,
            statusText:statusText||"200 OK"
        });
    };

    // Private Methods
    function assignReferences(target,previous,next,parent){
        if(target){
            if(previous!==undefined)target.previousSibling=previous||null;
            if(next!==undefined)target.nextSibling=next||null;
            if(parent!==undefined)target.parentNode=target.parentElement=parent||null;
            target.ownerDocument=target.parentNode&&target.parentNode.ownerDocument||null;
        }
    }

    function addEventHandling(stub){
        return new function(){
            var _events={};
            stub.addEventListener=Stubs.GetMethod(function(type,listener,capture){
                if(!_events[type])_events[type]={flow:[],capture:[]};
                var target=_events[type][capture?"capture":"flow"];
                for(var i=0;i<target.length;i++){
                    if(target[i]===listener)return;
                }
                target.push(listener);
            });
            stub.removeEventListener=Stubs.GetMethod(function(type,listener,capture){
                if(!_events[type])return;
                var target=_events[type][capture?"capture":"flow"];
                for(var i=0;i<target.length;i++){
                    if(target[i]===listener){
                        target.splice(i,1);
                    }
                }
            });
            return stub;
        }
    }

    function getNodesByMatch(node,matchPredicate,limit,matches){
        if(!matches)matches=[];
        for(var i=0;i<node.childNodes.length;i++){
            getNodesByMatch(node.childNodes[i],matchPredicate,limit,matches);
            if(matchPredicate(node.childNodes[i])){
                matches.push(node.childNodes[i]);
                if(!isNaN(limit)&&matches.length>=limit)return;
            }
        }
        return matches;
    }

    function resetChildPointers(target){
        if(target){
            target.firstChild=target.childNodes[0]||null;
            target.lastChild=target.childNodes[target.childNodes.length-1]||null;
        }
    }

    function setLocation(location,url){
        url=(url||"about:blank")+'';
        var hash=url.split('#');
        var search=hash[0].split('?');
        var parts=search[0].split('/');
        var host=(parts[2]||'').split(':');
        location.hash=hash[1]?'#'+hash[1]:'';
        location.host=parts[2]||'';
        location.hostname=host[0];
        location.href=url;
        location.pathname=[''].concat(parts.slice(3)).join('/');
        location.port=host[1]||'';
        location.protocol=parts[0]||'';
        location.search=search[1]||'';
    }
} 
 
// Global Convenience Mapping
Function.RegisterNamespace("Mocks");
Function.RegisterNamespace("Stubs");

MockDom=xUnit.js.Extensions.Attributes.MockDomAttribute;

Mocks.Dom=xUnit.js.Extensions.Mocks.Dom;
Stubs.Dom=xUnit.js.Extensions.Stubs.Dom; 

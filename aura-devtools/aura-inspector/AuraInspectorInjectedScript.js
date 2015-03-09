//*** Used by Aura Inspector
(function(){
    var actions = {
        "AuraDevToolService.RequestComponentTree" : function (event) {
            var globalId = event.data && event.data["globalId"];
            var component = globalId ? $A.getCmp(globalId) : $A.getRoot();
            var treeJSON = component.toJSON();

            if(globalId) {
                event.source.postMessage({
                    action: "AuraDevToolService.RequestComponentViewResponse",
                    responseText: treeJSON
                }, "*");    
            } else {
                event.source.postMessage({
                    action: "AuraDevToolService.RequestComponentTreeResponse",
                    responseText: treeJSON
                }, "*");   
            }
        },
        "AuraDevToolService.HighlightElement": function(event) {
            // Ensure the classes are present that HighlightElement depends on.
            if(!actions["AuraDevToolService.AddStyleRules"].addedStyleRules) {
                actions["AuraDevToolService.AddStyleRules"](event);
                actions["AuraDevToolService.AddStyleRules"].addedStyleRules = true;
            }

            var className = "auraDevToolServiceHighlight3";
            var previous = document.getElementsByClassName(className);
            for(var d=previous.length-1,current;d>=0;d--){
                current = previous[d];
                current.classList.remove(className);
                current.classList.remove("auraDevToolServiceHighlight4");
            }

            // Apply the classes to the elements
            var globalId = event.data["globalId"];
            if(globalId) {
                var cmp = $A.getCmp(globalId);
                if(cmp && cmp.isValid()) {
                    var elements = cmp.getElements();
                    // todo: add classes to elements
                    for(var c=0,length=elements.length;c<length;c++) {
                        if(elements[c].nodeType === 1){
                            elements[c].classList.add(className);
                        }
                    }
                }
            }
        },
        "AuraDevToolService.RemoveHighlightElement": function(event) {
            var removeClassName = "auraDevToolServiceHighlight3";
            var addClassName = "auraDevToolServiceHighlight4";
            var previous = document.getElementsByClassName(removeClassName);
            for(var d=previous.length-1;d>=0;d--){
                previous[d].classList.add(addClassName);
                //previous[d].classList.remove(removeClassName);
            }

        },
        "AuraDevToolService.AddStyleRules": function(event) {
            var styleRuleId = "AuraDevToolService.AddStyleRules";

            // Already added
            if(document.getElementById(styleRuleId)) { return; }

            var rules = [
                ".auraDevToolServiceHighlight2 {",
                "   border: 1px solid red;",
                "}",
                ".auraDevToolServiceHighlight3:before{",
                "   position:absolute;display:block;width:100%;height:100%;z-index: 10000;",
                "   background-color:#006699;opacity:.3;content:' ';border : 2px dashed white;",
                "}",
                ".auraDevToolServiceHighlight4.auraDevToolServiceHighlight3:before {",
                "   opacity: 0;",
                "   transition: opacity 2s;",
                "}"
            ].join('');

            var style = document.createElement("style");
                style.id = styleRuleId;
                style.textContent = rules;
                style.innerText = rules;

            var head = document.head;
                head.appendChild(style);


            document.body.addEventListener("transitionend", function removeClassHandler(event) {
            var removeClassName = "auraDevToolServiceHighlight3";
            var addClassName = "auraDevToolServiceHighlight4";
                //console.log("Remove it", event.target);
                var element = event.target;
                element.classList.remove(removeClassName);
                element.classList.remove(addClassName);
            });
        }
    };

    // How we get rid of the event listeners and the stupid port div below.
    window.addEventListener("message", function(event) {
        // Guard a few things like window source and data being empty

        var action = event.data.action;
        if(actions.hasOwnProperty(action)) {
            actions[action](event);
        }

    });

    if(typeof $A != "undefined" && $A.getContext().mode === "DEV") {
        $A.PerfDevToolsEnabled = true;
        __auraPerfDevTools();
        var tempHook = $A.$initPriv$;
        $A.$initPriv$ = function() {
            $A.PerfDevTools.init();
            tempHook.apply(this, arguments);
        };
    }

    function __auraPerfDevTools() {
        var OPTIONS = {
                componentCreation  : true,
                componentRendering : true,
                timelineMarks      : false,
                transactions       : true,
            },
            CMP_CREATE_MARK   = 'componentCreation',
            START_SUFIX       = 'Start',
            END_SUFIX         = 'End',
            CMP_CREATE_END    = CMP_CREATE_MARK + END_SUFIX,
            SAMPLING_INTERVAL = 0.025;


        $A.PerfDevTools = {
            init: function (cfg) {
                cfg || (cfg = {});
                this._initializeOptions(cfg);
                this._hooks = {};
                this.collector = {
                    componentCreation : [],
                    rendering: []
                };
                this._initializeHooks();
            },
            clearMarks: function (marks) {
                this._resetCollector(marks);  
            },
            _initializeOptions: function (cfg) {
                this.opts = {
                    componentCreation  : cfg.componentCreation  || OPTIONS.componentCreation,
                    componentRendering : cfg.componentRendering || OPTIONS.componentRendering,
                    timelineMarks      : typeof cfg.timelineMarks === 'boolean' ? cfg.timelineMarks : OPTIONS.timelineMarks,
                    transactions       : cfg.transactions || OPTIONS.transactions
                };
            },
            _initializeHooks: function () {
                if (this.opts.componentCreation) {
                    this._initializeHooksComponentCreation();
                }
                if (this.opts.transactions) {
                    this._initializeHooksTransactions();
                }
            },
            _createNode: function (name, mark, id) {
                return {
                    id  : id,
                    mark: mark,
                    name: name,
                    timestamp: window.performance.now(),
                };
            },
            _resetCollector: function (type) {
                if (type) {
                    this.collector[type] = [];
                    return;
                }

                for (var i in this.collector) {
                    this.collector[i] = [];
                }
            },
            _initializeHooksTransactions: function () {
                $A.metricsService.setClearCompletedTransactions(false);
                $A.metricsService.onTransactionEnd(this._onTransactionEnd.bind(this));
            },

            _onTransactionEnd: function (t) {
                window.postMessage({
                    action  : "AuraDevToolService.OnTransactionEnd", 
                    payload : t
                }, '*');
            },

            _initializeHooksComponentCreation: function () {
                this._hookMethod($A.componentService, 'newComponentDeprecated', CMP_CREATE_MARK);
                this._hookMethod($A.componentService, '$newComponentDeprecated$', CMP_CREATE_MARK);
            },
            getComponentCreationProfile: function () {
                return this._generateCPUProfilerDataFromMarks(this.collector.componentCreation);
            },
            _hookMethod: function (host, methodName, mark) {
                var self = this,
                    hook = host[methodName];
                self._hooks[methodName] = hook;
                host[methodName] = function (config) {
                    if (Array.isArray(config)) {
                        return hook.apply(this, arguments);
                    }

                    var descriptor = (config.componentDef.descriptor || config.componentDef) + '',
                        collector  = self.collector[mark];

                    // Add mark
                    collector.push(self._createNode(descriptor, mark + START_SUFIX));

                    // Hook!
                    var result = hook.apply(this, arguments);
                    var id = result.getGlobalId && result.getGlobalId() || '([ids])';

                    // End mark
                    collector.push(self._createNode(descriptor, mark + END_SUFIX, id));
                    return result;
                };
            },
            _generateCPUProfilerDataFromMarks: function (marks) {
                //global stuff for the id
                var id = 0;
                function nextId () {return ++id;}
                function logTree(stack, mark) {
                    //var d = '||| ';
                    //console.log(Array.apply(0, Array(stack)).map(function(){return d;}).join(''), mark);
                }

                function hashCode(name) {
                    var hash = 0, i, chr, len;
                    if (name.length == 0) return hash;
                    for (i = 0, len = name.length; i < len; i++) {
                        chr   = name.charCodeAt(i);
                        hash  = ((hash << 5) - hash) + chr;
                        hash |= 0; // Convert to 32bit integer
                    }
                    return Math.abs(hash);
                }

                function generateNode (name, options) {
                    options || (options = {});
                    return  {
                        functionName: name || ("Random." + Math.random()),
                        scriptId: "3",
                        url: options.details || "",
                        lineNumber: 0,
                        columnNumber: 0,
                        hitCount: options.hit || 0,
                        callUID: hashCode(name),
                        children: [],
                        deoptReason: "",
                        id: nextId()
                    };
                }

                var endText    = CMP_CREATE_END,
                    startTime  = marks[0].timestamp, // Get from first and last mark
                    endTime    = marks[marks.length - 1].timestamp,
                    markLength = marks.length,
                    duration   = endTime - startTime,
                    sampling   = SAMPLING_INTERVAL,
                    root       = generateNode("(root)"),
                    idle       = generateNode("(idle)"),
                    current    = generateNode(marks[0].name),
                    stack      = [current, root];

                current._startTime = marks[0].timestamp;

                function generateTimestamps(startTime, endTime) { 
                    var diff  = endTime - startTime,
                        ticks = Math.round(diff / sampling), // every N miliseconds
                        time  = startTime,
                        ts    = [time];

                    for (var i = 1; i < ticks; i++) {
                        time += sampling;
                        ts.push(time);
                    }
                    return ts;
                }

                function generateSamples (root, size, idle) {
                    var samples = Array.apply(0,Array(size)).map(function(){return idle.id;}),
                        currentIndex = 0,
                        idleHits = 0;

                    function calculateTimesForNode(node) {
                        if (node._idleHits) {
                            currentIndex += node._idleHits;
                            idleHits += node._idleHits;
                        }

                        for (var i = 0; i < node.hitCount; i++) {
                            samples[currentIndex + i] = node.id;
                        }
                        currentIndex += node.hitCount;

                        for (var j = 0; j < node.children.length; j++) {
                            calculateTimesForNode(node.children[j]);
                        }

                    }
                    calculateTimesForNode(root, root.id);
                    idle.hitCount = Math.max(0, size - currentIndex + idleHits); //update idle with remaining hits
                    return samples;
                }

                logTree(stack.length - 1, 'open: ' + marks[0].name);
                for (var i = 1; i < markLength; i++) {
                    tmp = marks[i];
                    if (stack[0].functionName === tmp.name && tmp.mark === endText) {
                        tmpNode = stack.shift();
                        tmpNode._endTime = tmp.timestamp;
                        tmpNode._totalTime = tmpNode._endTime - tmpNode._startTime;
                        tmpNode._childrenTime = tmpNode.children.reduce(function (p, c) {return p + c._totalTime;}, 0);
                        tmpNode._selfTime = tmpNode._totalTime - tmpNode._childrenTime;
                        tmpNode.hitCount = Math.floor(tmpNode._selfTime / sampling);
                        tmpNode._cmpId = tmp.id;

                        //push into the parent
                        stack[0].children.push(tmpNode);
                        logTree(stack.length, 'close: ' + tmp.name + ' selfTime: ' + tmpNode._selfTime.toFixed(4) + '| totalTime: ' + tmpNode._totalTime.toFixed(4));
                    } else {

                        current = generateNode(tmp.name);
                        current._startTime = tmp.timestamp;
                        if (stack.length === 1 && ((markLength - i) > 1)) {
                            current._idleHits = Math.floor((tmp.timestamp - marks[i - 1].timestamp) / sampling);
                        }

                        stack.unshift(current);
                        logTree(stack.length - 1, 'open: ' + tmp.name);
                    }
                }
                root.children.push(idle);
                var timestamp = generateTimestamps(startTime, endTime);
                var samples = generateSamples(root, timestamp.length, idle);

                return {
                    head: root,
                    startTime: startTime / 1000,
                    endTime : endTime / 1000,
                    timestamp: timestamp,
                    samples : samples,
                };
            }
        };
    }

    // var evt = $A.get("e.aura:valueChange");
    
    // var fire = evt.constructor.prototype.fire;

    // // Override Events, not sure why this doesn't cover things like aura:valueChange
    // evt.constructor.prototype.fire = function () {
    //     var text;
    //     var eventName = this.getDef().getDescriptor().getQualifiedName().replace("markup://", "");
    //     if(this.source) {
    //         text = "Component: {" + this.source.getGlobalId() + "} fired event " + eventName;// + " with parameter data: " + JSON.stringify(this.getParams());
    //     } else {
    //         text = "Fired event " + eventName;// + " with parameter data: " + JSON.stringify(this.getParams());
    //     }
    //     logText(text);
    //     fire.apply(this, arguments);
    // };

    // var oldEnqueueAction = $A.clientService.enqueueAction;
    // $A.clientService.enqueueAction = function() {
    //     logText("$A.clientService.enqueueAction");
    //     oldEnqueueAction.apply(this, arguments);
    // };

    // var oldEnqueueAction2 = $A.enqueueAction;
    // $A.enqueueAction = function() {
    //     logText("$A.enqueueAction");
    //     oldEnqueueAction2.apply(this, arguments);
    // };

    // function logText(text) {
    //     window.postMessage({
    //         action: "AuraDevToolService.OnError",
    //         text: text
    //     }, "*");
    // }
})();
    
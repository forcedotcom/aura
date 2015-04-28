/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    clear : function(cmp, event, helper) {
        cmp._handler.clear();
    },

    filter : function(cmp, event, helper) {
        cmp._handler.setFilter(cmp.get("v.filter"));
    },
    
    init : function(cmp, event, helper) {
        var component = cmp;
        
        var handler = function(level, msg, error) {
            handler.logs.push(msg);
            handler.handleMessage(msg);
        };
        handler.logs = [];
        handler.output = [];
        handler.handleMessage = function(msg) {
            var match = handler.filter.exec(msg);
            if (match != null) {
                msg = match.length > 1 ? match[1] : msg;
                handler.output.push(msg);
                handler.appendOutput(msg);
                component.set("v.logs", handler.output);
            }
        }
        handler.appendOutput = function(msg) {
            if(component.find("entries").getElement()){
                handler.appendOutput = function(msg) {
                    var p = document.createElement("p");
                    p.appendChild(document.createTextNode(msg))
                    component.find("entries").getElement().appendChild(p);
                }
                for(var i = 0; i < handler.output.length; i++) {
                    handler.appendOutput(handler.output[i]);
                }
            }
        };
        handler.clear = function(){
            handler.logs.length = 0;
            handler.clearOutput();
        };
        handler.clearOutput = function(){
            if(component.find("entries").getElement()){
                handler.clearOutput = function(){
                    handler.output.length = 0;
                    component.set("v.logs", handler.output);
                    var outputElement = component.find("entries").getElement();
                    while(outputElement.lastChild){
                        outputElement.removeChild(outputElement.lastChild);
                    }
                };
                handler.clearOutput();
            } else {
                handler.output.length = 0;
                component.set("v.logs", handler.output);
            }
        };
        handler.setFilter = function(filter){
            handler.filter = new RegExp(filter || "");
            handler.clearOutput();
            for (var i = 0; i < handler.logs.length; i++) {
                handler.handleMessage(handler.logs[i]);
            }
        };
        
        handler.setFilter(cmp.get("v.filter"));
        cmp._handler = handler;
        
        $A.logger.subscribe("INFO", handler);
        $A.logger.subscribe("WARNING", handler);
        $A.logger.subscribe("ASSERT", handler);
        $A.logger.subscribe("ERROR", handler);
    }
})

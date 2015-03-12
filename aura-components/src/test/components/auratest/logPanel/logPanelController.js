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
        cmp._logs.length = 0;
        cmp.set("v.logs", []);
    },

    filter : function(cmp, event, helper) {
        cmp._filter = new RegExp(cmp.get("v.filter") || "");
        var output = [];
        var logs = cmp._logs;
        for (var i = 0; i < logs.length; i++) {
            var entry = logs[i];
            var match = cmp._filter.exec(entry);
            if(match != null){
                output.push(match.length > 1 ? match[1] : entry);
            }
        }
        cmp.set("v.logs", output);
    },
    
    init : function(cmp, event, helper) {
        var component = cmp;
        cmp._logs = [];
        cmp._filter = new RegExp(cmp.get("v.filter") || "");
        var handler = function(level, msg, error) {
            component._logs.push(msg);
            var match = component._filter.exec(msg);
            if(match != null){
                msg = match.length > 1 ? match[1] : msg;
                $A.run(function(){
                    var output = component.get("v.logs");
                    output.push(msg);
                    component.set("v.logs", output);
                });
            }
        }
        $A.logger.subscribe("INFO", handler);
        $A.logger.subscribe("WARNING", handler);
        $A.logger.subscribe("ASSERT", handler);
        $A.logger.subscribe("ERROR", handler);
    }
})

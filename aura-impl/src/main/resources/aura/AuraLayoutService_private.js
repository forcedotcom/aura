/*
 * Copyright (C) 2012 salesforce.com, inc.
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
/*jslint sub: true */
var priv = {

    history : [],

    push : function(layout, params, title){
        if (!aura["finishedInit"] && this.history.length > 0) {
            this.pop();
        }

        this.history.push({
            layout : layout,
            params : params,
            title : title
        });
    },

    pop : function(){
        return this.history.pop();
    },

    peek : function(){
        if (this.history.length > 0) {
            return this.history[this.history.length - 1];
        }
        return null;
    },

    peekLast : function(){
        if (this.history.length > 1) {
            return this.history[this.history.length - 2];
        }
        return null;
    },

    clear : function(){
        var cur = this.pop();
        this.history = [cur];
    },

    getTitle : function(historyItem) {
        if (historyItem.title) {
            // it was overridden manually, use that
            return historyItem.title;
        } else {
            var title = historyItem.layout.getTitle();
            if (title.isExpression()) {
                title = expressionService.getValue(this.cmp, title);
            }
            return title.getValue();
        }
    },

    fireLayoutChangeEvent : function(){
        var curr = this.peek();
        var prev = this.peekLast();
        var title = this.getTitle(curr);

        var params = {
            "layoutName" : curr.layout.getName(),
            "title" : title
        };

        if (prev){
            params["prevTitle"] = this.getTitle(prev);
            params["prevLayoutName"] = prev.layout.getName();
        }

        var evt = $A.get("e.aura:layoutChange");
        evt.setParams(params);
        evt.fire();

        this.fireOnload();
    },

    fireOnload : function(){
        //#if {"modes" : ["TESTING", "AUTOTESTING", "TESTINGDEBUG", "AUTOTESTINGDEBUG"]}
        //For Selenium
        var frame = window.frameElement;
        if (frame && document.createEvent) {
            var loadEvent = document.createEvent('HTMLEvents');
            loadEvent.initEvent("load", true, true); // event type,bubbling,cancelable
            frame.dispatchEvent(loadEvent);
        }
        //#end
    }
};

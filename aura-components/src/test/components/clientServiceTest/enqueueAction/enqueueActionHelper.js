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
    /**
     * put a line in our "home" component for verification.
     */
    log : function(cmp, home, msg) {
        var logValue = home.get("v.log");
        logValue.push(msg);
        home.set("v.log", logValue);
    },

    getAction : function(cmp, parent, commands, label, options) {
        //
        // This path is for the actual execution of hte command.
        //
        var logResponse = function(a) {
            var stored = "";
            if (a.isFromStorage()) {
                stored = "[stored]";
            }
            this.log(cmp, parent, label+stored+": "+a.getState()+" "+a.getReturnValue());
        };
        var logAllAboard = function(a) {
            this.log(cmp, parent, label+"[AllAboard]: "+a.getState());
        };
        var a = cmp.get("c.execute");
        a.setParams({ "commands": commands });
        for (i = 0; options && i < options.length; i++) {
            var option = options[i]
            if (option === "abortable") {
                a.setAbortable();
            } else if (option === "background") {
                a.setBackground();
            } else if (option === "caboose") {
                a.setCaboose();
            } else if (option === "storable") {
                a.setStorable();
            } else if (option === "allaboard") {
                a.setAllAboardCallback(this, logAllAboard);
            } else {
                throw new Error("Option "+option+" is unknown");
            }
        }
        a.setCallback(this, logResponse, "ALL");
        a.setCallback(this, logResponse, "ABORTED");
        return a;
    },

    buildHierarchy : function (cmp) {
        this.buildHierarchyInternal(cmp, "", 2);
    },

    deleteChild : function (cmp, name) {
        var children = cmp.get("v.children");
        var child;
        var childleftbehind = []
        var i;

        for (i = 0; i < children.length; i++) {
            if (children[i].getLocalId() === name) {
                child = children[i];
            } else {
                childleftbehind.push(children[i]);
            }
        }
        cmp.set("v.children", childleftbehind);
        child.destroy();
    },

    addChildren : function (cmp, children, base, levels) {
        cmp.set("v.children", children);
        cmp.index(children[0].getLocalId(), children[0].getGlobalId())
        cmp.index(children[1].getLocalId(), children[1].getGlobalId())
        this.buildHierarchyInternal(children[0], base, levels-1);
        this.buildHierarchyInternal(children[1], base, levels-1);
    },

    buildHierarchyInternal : function (cmp, base, levels) {
        var children = [];
        var done = 0;
        var that = this;
        if (levels === 0) {
            return;
        }
        children.push(null);
        children.push(null);
        $A.createComponent("markup://clientServiceTest:enqueueAction", { "label":base+"child1", "aura:id":"child1" },
            function(child) {
                children[0] = child;
                done += 1;
                if (done == 2) {
                    that.addChildren(cmp, children, base+"child1.", levels);
                }
            });
        $A.createComponent("markup://clientServiceTest:enqueueAction", { "label":base+"child2", "aura:id":"child2" },
            function(child) {
                children[1] = child;
                done += 1;
                if (done == 2) {
                    that.addChildren(cmp, children, base+"child2.", levels);
                }
            });
    }

})

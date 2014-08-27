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
    getTargetComponent : function(component){
        return this.getComponent(component, "ui:popupTarget");
    },

    getTriggerComponent : function(component){
        return this.getComponent(component, "ui:popupTrigger");
    },

    getComponent: function(component, componentName){
        var body = component.getConcreteComponent().getValue("v.body"),
            child;

        if (!$A.util.isUndefinedOrNull(componentName)) {
            for (var i = 0; i < body.getLength(); i++) {
                child = body.getValue(i);

                if (child.isInstanceOf('ui:scroller')) {
                    return this.getComponent(child, componentName);
                } else if (child.isInstanceOf(componentName)) {
                    return child;
                }
            }
        }
    },

    handleTriggerPress : function(component) {
        this.setTargetVisibility(component, !this.getTargetComponent(component).get("v.visible"));
    },

    handleTargetShow : function(component) {
        this.setTargetVisibility(component, true);
    },

    handleTargetHide : function(component) {
        this.setTargetVisibility(component, false);
    },

    handleKeyboardEvent : function(component, event) {
        this.delegateEventToTarget(component, event, 'e.popupKeyboardEvent');
    },

    setTargetVisibility : function(component, visible) {
        var target = this.getTargetComponent(component);

        target.set("v.visible", visible);
    },

    callTriggerAction: function(component, event, action) {
        var concreteHelper = component.getConcreteComponent().getDef().getHelper();

        if (typeof concreteHelper[action] === "function") {
            concreteHelper[action](component, event);
        }
    },

    delegateEventToTarget: function(component, event, eventName) {
        var target = this.getTargetComponent(component),
            targetEvent = target.get(eventName);

        targetEvent.setParams({
            event : event
        });
        targetEvent.fire();
    },

    setEventHandlersOnChildren : function(component) {
        var body = component.getConcreteComponent().getValue("v.body"),
            child;

        for (var i = 0, l = body.getLength(); i < l; i++) {
            child = body.getValue(i);
            if (child.isInstanceOf("ui:popupTrigger")) {
            	child.addHandler("popupTriggerPress", component, "c.onTriggerPress");
            	child.addHandler("popupTargetShow", component, "c.onTargetShow");
            	child.addHandler("popupTargetHide", component, "c.onTargetHide");
            }
            
            if (child.isInstanceOf("ui:popupTarget")) {
            	child.addHandler("doClose", component, "c.onTargetHide");
            }
        }
    }
})
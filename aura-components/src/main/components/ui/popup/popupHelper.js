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
        var body = component.getConcreteComponent().get("v.body"),
            child;

        if (!$A.util.isUndefinedOrNull(componentName)) {
            for (var i = 0; i < body.length; i++) {
                child = body[i];

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

    delegateEventToTarget: function(component, event, eventName) {
        var target = this.getTargetComponent(component),
            targetEvent = target.get(eventName);

        targetEvent.setParams({
            event : event
        });
        targetEvent.fire();
    },

    setEventHandlersOnChildren : function(component) {
        var body = component.getConcreteComponent().get("v.body"),
            child;

        for (var i = 0, l = body.length; i < l; i++) {
            child = body[i];
            if (child.isInstanceOf("ui:popupTrigger")) {
                this.setTriggerEventHandlers(component, child);
            }
            
            if (child.isInstanceOf("ui:popupTarget")) {
                this.setTargetEventHandlers(component, child);
            }
        }
    },

    setTriggerEventHandlers : function(component, childComponent) {
        childComponent.addHandler("popupTriggerPress", component, "c.onTriggerPress");
        childComponent.addHandler("popupTargetShow", component, "c.onTargetShow");
        childComponent.addHandler("popupTargetHide", component, "c.onTargetHide");
        childComponent.addHandler("popupKeyboardEvent", component, "c.onKeyboardEvent");
    },

    setTargetEventHandlers : function(component, targetComponent) {
        this.addCloseHandler(component, targetComponent);
    },

    addCloseHandler : function(component, childComponent) {
        childComponent.addHandler("doClose", component, "c.onTargetHide");
    },

    handleRefresh: function(component) {
        this.setEventHandlersOnChildren(component);
    },

    findElement: function(component, localId) {
        var cmp = component.getConcreteComponent();
        var retCmp = null;
        while (cmp) {
            retCmp = cmp.find(localId);
            if (retCmp) {
                break;
            }
            cmp = cmp.getSuper();
        }
        var elem = retCmp ? retCmp.getElement() : null;

        return elem;
    }
})
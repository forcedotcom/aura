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
({
    clickHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "click", domEvent);
    },
    dblclickHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "dblclick", domEvent);
    },
    keydownHandler:function(component,domEvent,helper){
        helper.fireEvents(component,"keydown",domEvent);
    },
    keypressHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "keypress", domEvent);
    },
    keyupHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "keyup", domEvent);
    },
    mousedownHandler:function(component,domEvent,helper){
        helper.fireEvents(component, "mousedown", domEvent);
    },
    mouseoutHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "mouseout", domEvent);
    },
    mouseoverHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "mouseover", domEvent);
    },
    mouseupHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "mouseup", domEvent);
    },
    touchstartHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "touchstart", domEvent);
    },
    touchmoveHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "touchmove", domEvent);
    },
    touchendHandler:function (component, domEvent, helper) {
        helper.fireEvents(component, "touchend", domEvent);
    }
})

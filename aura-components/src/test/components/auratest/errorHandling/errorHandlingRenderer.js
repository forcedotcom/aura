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
    render: function(component){
        if(component.get("v.throwErrorFromRender") === true) {
            throw new Error("Error from component render");
        } else {
            return this.superRender();
        }
    },

    rerender : function(component){
        if(component.get("v.throwErrorFromRerender") === true) {
            throw new Error("Error from component rerender");
        } else {
            return this.superRerender();
        }
    },

    afterRender : function(component) {
        if (component.get("v.throwErrorFromAfterRender") === true) {
            this.superAfterRender();
            throw new Error("Error from component afterRender");
        } else {
            this.superAfterRender();
        }
    },

    unrender : function(component){
        if(component.get("v.throwErrorFromUnrender") === true) {
            this.superUnrender();
            throw new Error("Error from component unrender");
        } else {
            this.superUnrender();
        }
    }
})

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
    testAfterRenderTopLevel: {
        test: function(component){
            this.runIteration(component, "simple");
        }
    },

    testAfterRenderTopLevelExtended: {
        test: function(component){
            this.runIteration(component, "extended");
        }
    },

    testAfterRenderContainedInHTML: {
        test: function(component){
            this.runIteration(component, "containedInHTML");
        }
    },

    testAfterRenderContainedInHTMLExtended: {
        test: function(component){
            this.runIteration(component, "extendedContainedInHTML");
        }
    },

    testAfterRenderContainedInNestedHTML: {
        test: function(component){
            this.runIteration(component, "containedInNestedHTML");
        }
    },

    testAfterRenderContainedInNestedHTMLExtended: {
        test: function(component){
            this.runIteration(component, "extendedContainedInNestedHTML");
        }
    },

    testAfterRenderContainedInComponent: {
        test: function(component){
            this.runIteration(component, "containedInComponent");
        }
    },

    testAfterRenderContainedInComponentExtended: {
        test: function(component){
            this.runIteration(component, "extendedContainedInComponent");
        }
    },

    testAfterRenderContainedInNestedComponent: {
        test: function(component){
            this.runIteration(component, "containedInNestedComponent");
        }
    },

    testAfterRenderContainedInNestedComponentExtended: {
        test: function(component){
            this.runIteration(component, "extendedContainedInNestedComponent");
        }
    },

    testAfterRenderKitchenSinkA: {
        test: function(component){
            this.runIteration(component, "kitchenSinkA");
        }
    },

    testAfterRenderKitchenSinkAExtended: {
        test: function(component){
            this.runIteration(component, "extendedKitchenSinkA");
        }
    },

    testAfterRenderKitchenSinkB: {
        test: function(component){
            this.runIteration(component, "kitchenSinkB");
        }
    },

    testAfterRenderKitchenSinkBExtended: {
        test: function(component){
            this.runIteration(component, "extendedKitchenSinkB");
        }
    },

    runIteration: function(component, iterationId){
        var div = component.find(iterationId).getElement();
        if (iterationId.substr(0,"extended".length)=="extended")
            aura.test.assertEquals("Extended AfterRender Ran.", div.innerHTML, "After render wasn't chained.");
        else
            aura.test.assertEquals("AfterRender Ran.", div.innerHTML, "After render didn't run.");
    }
})

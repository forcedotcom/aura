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
    createBody: function (component) {
        component.set("v.loaded", false);
        component._itemInfo = [];
        this.buildBody(component,
            function createBodyItem(cmp, template, item, index, itemVar, indexVar, templateValueProvider, forceServer, callback) {
                this.buildTemplate(cmp, template, item, index, itemVar, indexVar, templateValueProvider, true, forceServer, callback);
            },
            function createBodyComplete(cmp, components){
            	cmp.set("v.body", components, true);
            	cmp.set("v.loaded",true);
            	cmp.get("e.iterationComplete").fire({operation:"Initialize"});
            }
        );
    },
    clearUnrenderedBody: function (component) {
        var currentBody = component.get('v.body');
        var cleanedCmps = 0;
        if (currentBody.length) {
            for (var i = 0; i < currentBody.length; i++) {
                if (currentBody[i].isValid() && !currentBody[i].isRendered()) {
                    currentBody[i].destroy();
                    component._itemInfo.splice(i - cleanedCmps, 1);
                    cleanedCmps++;
                }
            }
            if (cleanedCmps) {
                $A.warning([
                    'Performance degradation: ',
                    'Multiple items were set in iteration',
                     '[id:' + component.getGlobalId() + ']',
                    'in the same Aura cycle.'
                ].join(''));
            }
        }
    },
    updateBody: function (component) {
        if (component.get("v.loaded") === false) {
        	component._queueUpdate = true;
            return component._queueUpdate;
        }

        this.clearUnrenderedBody(component);

        component.set("v.loaded",false);
        var itemInfo = component._itemInfo.slice();
        var helper = this;
        component._itemInfo.length = 0;

        this.buildBody(component,
            function updateBodyItem(cmp, template, item, index, itemVar, indexVar, templateValueProvider, forceServer, callback) {
                var found = false;
                var components = null;
                for (var i = 0; i < itemInfo.length; i++) {
                    if (itemInfo[i].item === item) {
                        components = itemInfo[i].components;
                        if (itemInfo[i].index !== index) {
                            for (var j = 0; j < components.length; j++) {
                                var avp = components[j].getAttributeValueProvider();
                                if (avp) {
                                    //JBUCH: HALO: FIXME: THIS IS TO DEAL WITH THE CHANGE TO PTVs BELOW:
                                    avp.set(indexVar, index);
                                    avp.set(itemVar, cmp.getReference("v.items[" + index + "]"), true);
                                }
                            }
                        }
                        found = true;
                        itemInfo.splice(i, 1);
                        this.trackItem(cmp, item, index, components);
                        callback(components);
                        break;
                    }
                }
                if (!found) {
                    this.buildTemplate(cmp, template, item, index, itemVar, indexVar, templateValueProvider, false, forceServer, callback);
                }
            },
            function updateBodyComplete(cmp, components){
            //  if (itemInfo.length) {
            //      We have deletes. Do we even care? RenderingService and Garbage Collection should handle that.
            //      If we do care, it will be to detach PRVs from firing.
            //  }
                cmp.set("v.body", components);
                cmp.set("v.loaded",true);
                cmp.get("e.iterationComplete").fire({operation:"Update"});
                if(cmp._queueUpdate){
                    helper.updateBody(cmp);
                }
                cmp._queueUpdate=false;
            }
        );
    },

    buildBody: function (component, itemHandler, completeHandler) {
        var items = component.get("v.items");
        var template = component.get("v.template");
        var startIndex = this.getStart(component);
        var endIndex = this.getEnd(component);
        var expectedCalls=endIndex-startIndex;
        if (items && items.length && template && template.length && expectedCalls > 0) {
            var itemVar = component.get("v.var");
            var indexVar = component.get("v.indexVar");
            var forceServer = component.get("v.forceServer");
            var templateValueProvider = component.getComponentValueProvider();
            var currentCall=0;
            var collector=[];
            function getCollector(index){
                return function(itemComponents){
                    collector[index]=itemComponents;
                    if(++currentCall===expectedCalls){
                        var components=[];
                        var i = 0;
                        for(i=0;i<collector.length;i++){
                            components=components.concat(collector[i]);
                        }
                        completeHandler(component,components);
                    }
                };
            }
            $A.pushCreationPath("body");
            for (var i = startIndex; i < endIndex; i++) {
                $A.setCreationPathIndex(i);
                itemHandler.bind(this)(component, template, items[i], i, itemVar, indexVar, templateValueProvider, forceServer, getCollector(i-startIndex));
            }
            $A.popCreationPath("body");
        }else{
            completeHandler(component,[]);
        }
    },

    buildTemplate: function (component, template, item, index, itemVar, indexVar, templateValueProvider, localCreation, forceServer, callback) {
        $A.pushCreationPath("body");
        var helper=this;
        var iterationValueProvider = null;
        function collector(templateComponents){
            helper.trackItem(component, item, index, templateComponents);
            callback(templateComponents);
        }
        for (var i = 0; i < template.length; i++) {
            $A.setCreationPathIndex(i);
            var componentDefRef = template[i];
            if (!componentDefRef.valueProvider) {
                componentDefRef.valueProvider = templateValueProvider;
            }
            if (!iterationValueProvider) {
                var itemValueProviders = {};
                itemValueProviders[itemVar] = component.getReference("v.items[" + index + "]");
                itemValueProviders[indexVar] = index;
                iterationValueProvider = $A.expressionService.createPassthroughValue(itemValueProviders, componentDefRef.valueProvider);
            }
            if(localCreation){
                var components=$A.componentService.newComponentDeprecated(template, iterationValueProvider, false, true);
                collector(components);
            }else {
                $A.componentService.newComponentAsync(this, collector, template, iterationValueProvider, localCreation, false, forceServer);
            }
            break;
        }
        $A.popCreationPath("body");
    },

    getStart: function (cmp) {
        return Math.max(0, parseInt(cmp.get("v.start") || 0, 10));
    },

    getEnd: function (cmp) {
        var items = cmp.get("v.items");
        if(items&&items.length){
            var end=parseInt(cmp.get("v.end"), 10);
            return isNaN(end)?items.length:Math.min(items.length, end);
        }
        return 0;
    },

    trackItem: function (component, item, index, components) {
        component._itemInfo.push({
            item: item,
            index: index,
            components: components //,
//			hash : $A.util.json.encode(itemval)
        });
    }
})
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
     * Accepts a map of localid:qualifiedName of components to be lazy loaded.
     * For example: {'textNode':'markup://aura:text',
     * "numNode":'markup://ui:outputNumber'}
     */
    verifyLazyLoading : function(cmp, lazyCmpId_qualifiedName_map, waitIds, callbackAfterLoad) {
                for (var lazyCmpId in lazyCmpId_qualifiedName_map) {
                    $A.test.assertEquals("markup://aura:placeholder", cmp.find(lazyCmpId).getDef().getDescriptor().getQualifiedName(), "Expected component with local id '"+lazyCmpId+"' to be initially represented by a placeholder.");
                }
                waitIds = $A.util.isArray(waitIds) ? waitIds : [waitIds];
                for(var id in waitIds) {
                    var a = cmp.get("c.resumeById");
                    a.setParams({waitId:waitIds[id]});
                    setTimeout(function(){$A.test.callServerAction(a, true);}, 100);
                }
                //Wait till all specified facets marked with aura:load are replaced by actual components, and then call callbackAfterLoad()
                $A.test.addWaitFor(true, function(){
                        var ret = true;
                        for (var lazyCmpId in lazyCmpId_qualifiedName_map) {
                            ret = ret && (lazyCmpId_qualifiedName_map[lazyCmpId] == cmp.find(lazyCmpId).getDef().getDescriptor().getQualifiedName());
                        }
                        return ret;
                    },
                    callbackAfterLoad
                );
    }
})

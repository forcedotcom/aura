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
     * Only component def refs are lazily loaded. Basic components(HTML and Expression) are not lazily loaded.
     * Specifying aura:load on these tags has no effect.
     *
     * Implementation details in.
     * BaseComponentDefHandler.handleChildTag()
     *       ||
     *       \/
     * ContainerTagHandler.getDefRefHandler()
     */
    testHtmlExpressionAreNotLazilyLoaded:{
        attributes:{waitId:"lazyLoadBasicTypes-Expression"},
        test:[function(cmp){
            try{
                $A.test.assertEquals("markup://aura:html",
                                     cmp.find("simpleHtml").getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("div element", cmp.find("simpleHtml").getElement().title);
                $A.test.assertEquals("markup://aura:html",
                                     cmp.find("htmlWithFacet").getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("div element as facet", cmp.find("htmlWithFacet").getElement().title);
                $A.test.assertEquals("markup://aura:html",
                                     cmp.find("facetInsideDiv").getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("div element inside facet", cmp.find("facetInsideDiv").getElement().title);
            } finally {
                var helper = cmp.getDef().getHelper();
                helper.resumeGateId(cmp, "lazyLoadBasicTypes-Expression");
            }
        }]
    },
    testLazyLoadingAuraLabel:{
        attributes:{waitId:"lazyLoadBasicTypes-Label"},
        test:[function(cmp){
            var helper= cmp.getDef().getHelper();
            helper.verifyLazyLoading(cmp, {'labelWithoutBody':'markup://aura:label'},
                                     "lazyLoadBasicTypes-Label",
                                     function(){
                                         $A.test.assertEquals("one {0} two",
                                                              $A.test.getTextByComponent(cmp.find("labelWithoutBody")));
                                     });
        }]
    },
    testLazyLoadingAuraText:{
        attributes:{waitId:"lazyLoadBasicTypes-Text"},
        test:[function(cmp){
            var helper= cmp.getDef().getHelper();
            helper.verifyLazyLoading(cmp, {'text':'markup://aura:text'},
                                     "lazyLoadBasicTypes-Text",
                                     function(){
                                         $A.test.assertEquals("lazyLoading",
                                                              $A.test.getTextByComponent(cmp.find("text")));
                                     });
        }]
    }
})

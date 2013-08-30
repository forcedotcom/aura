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
     * Verify simple lazy loading case. 
     */
    testSimpleLazyLoading:{
        attributes:{start:0,end:2, slowFacet:true},
        test:function(cmp){
            var helper = cmp.getDef().getHelper();
            var items = cmp.find("lazy");
            $A.test.assertEquals(2, items.length,
                    "Expected two items in iteration component.");
            $A.test.assertEquals("placeholder", items[0].getDef().getDescriptor().getName(),
                    "Expected a placeholder for first lazy loading component.");
            $A.test.assertEquals("placeholder", items[1].getDef().getDescriptor().getName(),
                    "Expected a placeholder for second lazy loading component.");

            //
            // Note that we have to free up the second component because they get
            // put in a single request to the server.
            //
            helper.resumeGateId(cmp, "withLazyComponents0");
            helper.resumeGateId(cmp, "withLazyComponents1");
            //First Item
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("lazy")[0].getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("lazy")[0].isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("lazy")[0]).indexOf("Server component")!=-1);
                //iteration component
                var iteration = cmp.find("iteration");
                var realbody = iteration.get("v.realbody");
                $A.test.assertTrue(realbody instanceof Array);
                $A.test.assertEquals(2, realbody.length);

                //Placeholder for lazy component
                var placeholder = realbody[0];
                $A.test.assertTrue(typeof placeholder === "object");
                $A.test.assertEquals("Component", placeholder.auraType);
                $A.test.assertEquals("markup://aura:placeholder", placeholder.getDef().getDescriptor().getQualifiedName());

                //Actual lazy loaded component
                var placeholderBody = placeholder.get("v.body");
                $A.test.assertTrue(placeholderBody instanceof Array);
                $A.test.assertEquals(1, placeholderBody.length);
                $A.test.assertTrue(typeof placeholderBody[0] === "object");
                $A.test.assertEquals("Component", placeholderBody[0].auraType);
                $A.test.assertEquals("markup://loadLevelTest:serverComponent", placeholderBody[0].getDef().getDescriptor().getQualifiedName());

                //Verify that the placeholder's elements were associated with the iteration component
                var flag= false;
                var itrElements = iteration.getElements();
                for(var i in itrElements){
                    if(itrElements[i].className){
                        flag = flag || (($A.test.isInstanceOfDivElement(itrElements[i])) &&
                                         (itrElements[i].className.indexOf("auraPlaceholder")!=-1 ) );
                    }
                }
                $A.test.assertTrue(flag, "Placeholder elements were not associated with iteration component");

            });
            //Second Item
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("lazy")[1].getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("lazy")[1].isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("lazy")[1]).indexOf("Server component")!=-1);
            });

        }
    },
    /**
     * Verify that iteration component facilitates using the outer component as value provider.
     */
    testLazyLoadingWithAttributeValues:{
        attributes:{start:0,end:4, fastFacet:true},
        test:function(cmp){
            var helper = cmp.getDef().getHelper();
            var iteration = cmp.find("iterationWithAttributes");
            var items = cmp.find("lazyWithAttributes");
            $A.test.assertEquals(4,items.length, "Expeted 4 items in iteration.");
            //Verify that all items are initially represented by placeholder
            for(var i = 0, n = items.length; i < n; i++) {
                var item = items[i];
                $A.test.assertEquals("placeholder", item.getDef().getDescriptor().getName(),
                "Expected a placeholder for lazy loading component.");
            }
            helper.resumeGateId(cmp, "withAttributes");

            //Verify first item is replaced by expected value
            $A.test.addWaitFor('markup://aura:expression', function(){
                    return  cmp.find('lazyWithAttributes')[0].getDef().getDescriptor().getQualifiedName();
                },
                function(){
                    $A.test.assertEquals(cmp.get('m.innerData')[0],$A.test.getTextByComponent(cmp.find("lazyWithAttributes")[0]),
                        "Failed to provide value for lazy component in iteration block");
                });

            //Verify last item is replaced by expected value
            $A.test.addWaitFor('markup://aura:expression', function(){
                    return  cmp.find('lazyWithAttributes')[3].getDef().getDescriptor().getQualifiedName();
                },
                function(){
                    $A.test.assertEquals(cmp.get('m.innerData')[3],$A.test.getTextByComponent(cmp.find("lazyWithAttributes")[3]),
                        "Failed to provide value for lazy component in iteration block");
                });
        }
    },
    
    /**
     * ----------------------------------------------------------------------------------------------------------------
     * ------------------------client-side cmp creation tests ---------------------------------------------------------
     * ----------------------------------------------------------------------------------------------------------------
     */
    testSimpleLazyLoadingCscc:{
        attributes:{start:0,end:2, slowFacet:true},
        test:function(cmp){
            var helper = cmp.getDef().getHelper();
            var items = cmp.find("lazyCscc");
            $A.test.assertEquals(2, items.length,
                    "Expected two items in iteration component.");
            $A.test.assertEquals("placeholder", items[0].getDef().getDescriptor().getName(),
                    "Expected a placeholder for first lazy loading component.");
            $A.test.assertEquals("placeholder", items[1].getDef().getDescriptor().getName(),
                    "Expected a placeholder for second lazy loading component.");

            //
            // Note that we have to free up the second component because they get
            // put in a single request to the server.
            //
            helper.resumeGateId(cmp, "withLazyComponents0");
            helper.resumeGateId(cmp, "withLazyComponents1");
            //First Item
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("lazyCscc")[0].getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("lazyCscc")[0].isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("lazyCscc")[0]).indexOf("Server component")!=-1);
                //iteration component
                var iteration = cmp.find("iterationCscc");
                var realbody = iteration.get("v.realbody");
                $A.test.assertTrue(realbody instanceof Array);
                $A.test.assertEquals(2, realbody.length);

                //Placeholder for lazy component
                var placeholder = realbody[0];
                $A.test.assertTrue(typeof placeholder === "object");
                $A.test.assertEquals("Component", placeholder.auraType);
                $A.test.assertEquals("markup://aura:placeholder", placeholder.getDef().getDescriptor().getQualifiedName());

                //Actual lazy loaded component
                var placeholderBody = placeholder.get("v.body");
                $A.test.assertTrue(placeholderBody instanceof Array);
                $A.test.assertEquals(1, placeholderBody.length);
                $A.test.assertTrue(typeof placeholderBody[0] === "object");
                $A.test.assertEquals("Component", placeholderBody[0].auraType);
                $A.test.assertEquals("markup://loadLevelTest:serverComponent", placeholderBody[0].getDef().getDescriptor().getQualifiedName());

                //Verify that the placeholder's elements were associated with the iteration component
                var flag= false;
                var itrElements = iteration.getElements();
                for(var i in itrElements){
                    if(itrElements[i].className){
                        flag = flag || (($A.test.isInstanceOfDivElement(itrElements[i])) &&
                                         (itrElements[i].className.indexOf("auraPlaceholder")!=-1 ) );
                    }
                }
                $A.test.assertTrue(flag, "Placeholder elements were not associated with iteration component");

            });
            //Second Item
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("lazy")[1].getDef().getDescriptor().getName();
            },function(){
                $A.test.assertTrue(cmp.find("lazyCscc")[1].isRendered());
                $A.test.assertTrue($A.test.getTextByComponent(cmp.find("lazy")[1]).indexOf("Server component")!=-1);
            });

        }
    },
    /**
     * Verify that iteration component facilitates using the outer component as value provider.
     */
    testLazyLoadingWithAttributeValuesCscc:{
        attributes:{start:0,end:4, fastFacet:true},
        test:function(cmp){
            var helper = cmp.getDef().getHelper();
            var iteration = cmp.find("iterationWithAttributesCscc");
            var items = cmp.find("lazyWithAttributesCscc");
            $A.test.assertEquals(4,items.length, "Expeted 4 items in iteration.");
            //Verify that all items are initially represented by placeholder
            for(var i = 0, n = items.length; i < n; i++) {
                var item = items[i];
                $A.test.assertEquals("placeholder", item.getDef().getDescriptor().getName(),
                "Expected a placeholder for lazy loading component.");
            }
            helper.resumeGateId(cmp, "withAttributes");

            //Verify first item is replaced by expected value
            $A.test.addWaitFor('markup://aura:expression', function(){
                    return  cmp.find('lazyWithAttributesCscc')[0].getDef().getDescriptor().getQualifiedName();
                },
                function(){
                    $A.test.assertEquals(cmp.get('m.innerData')[0],$A.test.getTextByComponent(cmp.find("lazyWithAttributesCscc")[0]),
                        "Failed to provide value for lazy component in iteration block");
                });

            //Verify last item is replaced by expected value
            $A.test.addWaitFor('markup://aura:expression', function(){
                    return  cmp.find('lazyWithAttributesCscc')[3].getDef().getDescriptor().getQualifiedName();
                },
                function(){
                    $A.test.assertEquals(cmp.get('m.innerData')[3],$A.test.getTextByComponent(cmp.find("lazyWithAttributesCscc")[3]),
                        "Failed to provide value for lazy component in iteration block");
                });
        }
    }
})

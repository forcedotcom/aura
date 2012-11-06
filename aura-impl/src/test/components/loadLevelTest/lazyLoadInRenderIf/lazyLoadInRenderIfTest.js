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
    testRenderIf: {
        attributes:{flip:true},
        test: [function(cmp){
                // Verify that both renderIf and else sections are
                $A.test.assertEquals("placeholder", cmp.find("lazyrenderIf").getDef().getDescriptor().getName(), "Placeholder missing for lazy component.");
                $A.test.assertEquals("placeholder", cmp.find("lazyelse").getDef().getDescriptor().getName(), "Placeholder missing for lazy component.");
                $A.test.assertTrue(cmp.find('nonLazyRenderIfDiv').isRendered(), "renderIf section is not rendered");
                $A.test.assertFalse(cmp.find('nonLazyElseDiv').isRendered(), "else section is rendered");

                $A.test.addWaitFor(true, $A.test.isActionPending,
                        function(){$A.test.callServerAction(cmp.get("c.resumeAll"), true);});

                // Wait till lazy component is loaded from server
                $A.test.addWaitFor("serverComponent", function(){
                    return cmp.find("lazyrenderIf").getDef().getDescriptor().getName();
                },function(){
                    // Else section still hasn't been replaced by actual component
                    $A.test.assertEquals("placeholder", cmp.find("lazyelse").getDef().getDescriptor().getName());
                    $A.test.assertTrue(cmp.find('nonLazyRenderIfDiv').isRendered(), "renderIf section is not rendered");
                    $A.test.assertFalse(cmp.find('nonLazyElseDiv').isRendered(), "else section is rendered");
                });
        }, function(cmp){
            // Flip the renderIf flag to lazy load components in else section
            $A.services.event.startFiring(true);
            cmp.getAttributes().setValue('flip', false);
            $A.services.event.finishFiring();

            $A.test.assertFalse(cmp.find('nonLazyRenderIfDiv').isRendered(), "renderIf section is rendered");
            $A.test.assertTrue(cmp.find('nonLazyElseDiv').isRendered(), "else section is not rendered");

            // Place holder should still be placed for else section, because the server action to get the replacement component is not expected to be complete at this point.
            $A.test.assertEquals("placeholder", cmp.find("lazyelse").getDef().getDescriptor().getName(), "Placeholder missing for lazy component.");

            $A.test.addWaitFor(true, $A.test.isActionPending,
                    function(){$A.test.callServerAction(cmp.get("c.resumeAll"), true);});

            // Wait till lazy component is loaded from server
            $A.test.addWaitFor("serverComponent", function(){
                return cmp.find("lazyelse").getDef().getDescriptor().getName();
            },function(){
                $A.test.assertFalse(cmp.find('nonLazyRenderIfDiv').isRendered(), "renderIf section is rendered");
                $A.test.assertTrue(cmp.find('nonLazyElseDiv').isRendered(), "else section is not rendered");
            });
        }]
    }
})

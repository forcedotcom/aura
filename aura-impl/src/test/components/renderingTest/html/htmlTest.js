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
    testRenderingHtmlMarkupWithoutBody:{
        test:[function(cmp){
            var div = cmp.find('divWithoutBody');
            $A.test.assertTrue(div!==undefined,"HTML tag without body was not available.")
            $A.test.assertTrue(div.isRendered(), "HTML tag was not rendered.")
            var ele = div.getElement();
            $A.test.assertEquals("styleClass div withoutBody",ele.className)
            $A.test.assertEquals("divWithoutBody_Title",ele.title);

            //Verify Rerendering
            cmp.getAttributes().setValue('styleClass', 'styleNEWClass');
            $A.rerender(cmp);
            $A.test.assertEquals("styleNEWClass div withoutBody",cmp.find('divWithoutBody').getElement().className)
        }
        ]
    },
    //W-1271344
    testCleanUpOfCommentTags:{
        test:[function(cmp){

            var div = cmp.find('divWithoutBody');
            var ele = div.getElements();
            $A.test.assertTrue(ele.element!==undefined, "div element has more than one element.");
            $A.test.assertTrue(ele[1]===undefined, "div element has more than one element.");

            $A.test.assertTrue(ele[0]!==undefined, "div element should have one element.");
            $A.test.assertTrue($A.test.isInstanceOfDivElement(ele[0]));
            //There should be only 1 comment node for each html element that does not have anything in its body.
            $A.test.assertEquals(1, ele[0].childNodes.length,
                    "Did not expect to see more than 1 child node in this div. but saw "+ele[0].childNodes.length);
        },function(cmp){

            var div = cmp.find('divWithBody');
            var ele = div.getElements();
            $A.test.assertTrue(ele.element!==undefined, "div element has more than one element.");
            $A.test.assertTrue(ele[1]===undefined, "div element has more than one element.");

            $A.test.assertTrue(ele[0]!==undefined, "div element should have one element.");
            $A.test.assertTrue($A.test.isInstanceOfDivElement(ele[0]));

            $A.test.assertEquals(1, ele[0].childNodes.length,
                    "Did not expect to see more than 1 child node in div. but saw "+ele[0].childNodes.length);
            $A.test.assertTrue($A.test.isInstanceOfParagraphElement(ele[0].childNodes[0]));

            $A.test.assertEquals(1, ele[0].childNodes[0].childNodes.length,
                    "Did not expect to see more than 1 child node in paragraph. but saw "+ele[0].childNodes.length);
            $A.test.assertTrue($A.test.isInstanceOfText(ele[0].childNodes[0].childNodes[0]));

        }]
    }
})

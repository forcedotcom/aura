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
    /**
     * Verify that simple array values are passed to facets and rendered.
     */
    // TODO: W-1279147 user Story to render String Arrays
    _testRenderingSimpleValueArrayInFacet : {
        test : [ function(cmp) {
            // First level of Facet
            var arrayFacet = cmp.find("arrayFacet");
            $A.test.assertTruthy(arrayFacet);

            // Second level of Facet
            var simpleValueArray = arrayFacet.find("simpleValueArray");
            $A.test.assertTruthy(simpleValueArray);
            // Verify that value came down from model of top level component
            $A.test.assertEquals("onetwothree", $A.test
                    .getTextByComponent(simpleValueArray));
        } ]
    },

    testRenderingComponentArrayInFacet : {
        test : [ function(cmp) {
            // First level of Facet
            var arrayFacet = cmp.find("arrayFacet");
            $A.test.assertTruthy(arrayFacet);

            // Second level of Facet
            var componentArray = arrayFacet.find("componentArray");
            $A.test.assertTruthy(componentArray);

            // LocalIds are indexed only on the component they are declared in.
            // So component Array won't index stuff that's passed to its body.
            $A.test.assertFalsy(componentArray.find('text'));
            $A.test.assertFalsy(componentArray.find('div'));

            // Third level of Facet
            var text = cmp.find('text');
            var div = cmp.find('div');

            // Verify that the component Array was rendered
            $A.test.assertTruthy(text);
            $A.test.assertTruthy(div);
            $A.test.assertTrue(text.isRendered());
            $A.test.assertTrue(div.isRendered());

            $A.test.assertEquals("textInsideFacet", $A.test.getText(text.getElement()));
            $A.test.assertEquals("divInsideFacet", div.getElement().title);
        } ]
    },

    /**
     * Verify rendering component array declared in the current component's markup.
     */
    // TODO: W-1198083 cannot set default values for Aura.Component[]
    _testRenderingComponentArrayInMyBody : {
        test : [ function(cmp) {
            var text = cmp.find('localtext');
            var div = cmp.find('localdiv');
            // Verify that the component Array was rendered
            $A.test.assertTruthy(text);
            $A.test.assertTruthy(div);
            $A.test.assertTrue(text.isRendered());
            $A.test.assertTrue(div.isRendered());

            $A.test.assertEquals("textOnBody", $A.test.getText(text.getElement()));
            $A.test.assertEquals("divOnBody", div.getElement().title);
        } ]
    },

    /**
     * Verify rendering/rerendering expression intitialized with contitional
     * statements. Also verify that dom nodes are cleaned up after unrendering.
     */
    // TODO: W-1198083 cannot set default values for Aura.Component[]
    _testRenderRerenderOfExpressions : {
        attributes : {
            flag : false
        },
        test : [
                function(cmp) {
                    var conditionalRendering = cmp.find('conditionalRendering');
                    $A.test.assertEquals(cmp.get('v.stringAttribute'),
                            conditionalRendering.get('v.stuffToRender'));
                    $A.test.assertEquals("London", $A.test
                            .getTextByComponent(conditionalRendering));
                },
                function(cmp) {
                    debugger;
                    var conditionalRendering = cmp.find('conditionalRendering');
                    $A.test.assertTruthy(conditionalRendering);

                    cmp.getAttributes().setValue('flag', true);
                    // Verify that expression evaluates to provide component
                    // array as attribute value
                    $A.test.assertEquals(cmp.get('v.cmps'),
                            conditionalRendering.get('v.stuffToRender'));

                    $A.rerender(cmp);
                    $A.test.assertEquals("textOnBodydivOnBody", $A.test
                            .getTextByComponent(conditionalRendering));
                } ]
    }
})

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
//@since 0.0.61
({
    testDefaultAttributes:{
        test:function(cmp){
            var imgElement = cmp.getElement();
            aura.test.assertTrue(imgElement instanceof HTMLImageElement, "Expected to see a image element.")
            aura.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/s.gif'), "Expected src to be '/auraFW/resources/aura/s.gif' by default");
            aura.test.assertUndefinedOrNull(cmp.find('link'), 'By default there should be no link on the image.');
        }
    },
    testImageOnly:{
        attributes : {src: '/auraFW/resources/aura/auralogo.png'},
        test: function(cmp){
            var imgElement = cmp.getElement();
            aura.test.assertTrue(imgElement instanceof HTMLImageElement, "Expected to see a image element.")
            aura.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/auralogo.png'), "Failed to display specified image source.");
            aura.test.assertUndefinedOrNull(cmp.find('link'), 'By default there should be no link on the image.');
        }

    },
    testImageWithLink:{
        attributes : {src: '/auraFW/resources/aura/auralogo.png', href: 'http://www.salesforce.com'},
        test: function(cmp){
            var linkElement = cmp.find('link').getElement();
            aura.test.assertTrue(linkElement instanceof HTMLAnchorElement, "Expected to see a anchor element.")
            aura.test.assertTrue(aura.test.contains(linkElement.href,'http://www.salesforce.com'), linkElement.href + " Expected a link with specified address.")
            aura.test.assertEquals('_self',linkElement.target, "Expected target to be _self by default.")
            aura.test.assertEquals(1, linkElement.childElementCount);

            var imgElement = linkElement.children[0];
            aura.test.assertTrue(imgElement instanceof HTMLImageElement, "Expected to see a image element embedded in the anchor tag.")
            aura.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/auralogo.png'), "Failed to display specified image source.");

        }
    },
    testUseAllAttributes:{
        attributes : {src: '/auraFW/resources/aura/images/bug.png', href: 'http://www.salesforce.com', linkClass:'logo', alt:'Company', target:'_top'},
        test: function(cmp){
            var linkElement = cmp.find('link').getElement();
            aura.test.assertTrue(linkElement instanceof HTMLAnchorElement, "Expected to see a anchor element.")
            aura.test.assertTrue(aura.test.contains(linkElement.href,'http://www.salesforce.com'), linkElement.href + " Expected a link with specified address.")
            aura.test.assertEquals('_top',linkElement.target, "Expected target to be _top.")
            aura.test.assertTrue(linkElement.className.indexOf('logo')!==-1, "Expected link element to have specified class selector.");

            var imgElement = linkElement.children[0];
            aura.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/images/bug.png'), "Failed to display specified image source.");
            aura.test.assertEquals('Company', imgElement.alt, "Expected to see alt text on image element.");
            aura.test.assertTrue(imgElement.className.indexOf('logo') == -1);
        }
    },
    //W-1014086
    _testAccessibility:{
        test:function(cmp){
            var imgElement = cmp.getElement();
            aura.test.assertTrue(imgElement instanceof HTMLImageElement)
            aura.test.assertEquals("",imgElement.alt, "Expected a empty alt text for all image tags.");
            cmp.getAttributes().setValue("alt",'Help Accessibility');
            cmp.getAttributes().setValue("src",'http://www.google.com/intl/en_com/images/srpr/logo3w.png');
            $A.renderingService.rerender(cmp);

            imgElement = cmp.getElement();
            aura.test.assertEquals("Help Accessibility",imgElement.alt, "Expected alt text for the image element.");
        }
    },
    endsWith:function(str, suffix){
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
})

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
//@since 0.0.61
({
    testDefaultAttributes:{
	exceptionsAllowedDuringInit : ["\"alt\" attribute should not be empty for informational image"], 	
        test:function(cmp){
            var errorMessage = "component: 1:1.1 \"alt\" attribute should not be empty for informational image";
            $A.test.expectAuraError(errorMessage);
            $A.test.getAuraErrorMessage();
            
            var imgElement = cmp.getElement();
            $A.test.assertTrue($A.test.isInstanceOfImageElement(imgElement), "Expected to see a image element.");
            $A.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/s.gif'), "Expected src to be '/auraFW/resources/aura/s.gif' by default");
            $A.test.assertUndefinedOrNull(cmp.find('link'), 'By default there should be no link on the image.');
        }
    },
    testImageOnly:{
        attributes : {src: '/auraFW/resources/aura/auralogo.png', imageType:'decorative'},
        test: function(cmp){
            var imgElement = cmp.getElement();
            $A.test.assertTrue($A.test.isInstanceOfImageElement(imgElement), "Expected to see a image element.");
            $A.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/auralogo.png'), "Failed to display specified image source.");
            $A.test.assertUndefinedOrNull(cmp.find('link'), 'By default there should be no link on the image.');
        }

    },
    testImageWithLink:{
        attributes : {src: '/auraFW/resources/aura/auralogo.png', href: 'http://www.salesforce.com', imageType:'decorative'},
        test: function(cmp){
            var linkElement = cmp.find('link').getElement();
            $A.test.assertTrue($A.test.isInstanceOfAnchorElement(linkElement), "Expected to see a anchor element.");
            $A.test.assertTrue($A.test.contains(linkElement.href,'http://www.salesforce.com'), linkElement.href + " Expected a link with specified address.");
            $A.test.assertEquals('_self',linkElement.target, "Expected target to be _self by default.");
            
            $A.test.assertEquals(1, linkElement.childElementCount || linkElement.children.length); //IE8 and below don't have childElementCount

            var imgElement = linkElement.children[0];
            $A.test.assertTrue($A.test.isInstanceOfImageElement(imgElement), "Expected to see a image element embedded in the anchor tag.");
            $A.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/auralogo.png'), "Failed to display specified image source.");

        }
    },
    testUseAllAttributes:{
        attributes : {src: '/auraFW/resources/aura/images/bug.png', href: 'http://www.salesforce.com', linkClass:'logo', alt:'Company', target:'_top'},
        test: function(cmp){
            var linkElement = cmp.find('link').getElement();
            $A.test.assertTrue($A.test.isInstanceOfAnchorElement(linkElement), "Expected to see a anchor element.");
            $A.test.assertTrue($A.test.contains(linkElement.href,'http://www.salesforce.com'), linkElement.href + " Expected a link with specified address.");
            $A.test.assertEquals('_top',linkElement.target, "Expected target to be _top.");
            $A.test.assertNotEquals(linkElement.className.indexOf('logo'), -1, "Expected link element to have specified class selector.");

            var imgElement = linkElement.children[0];
            $A.test.assertTrue(this.endsWith(imgElement.src, '/auraFW/resources/aura/images/bug.png'), "Failed to display specified image source.");
            $A.test.assertEquals('Company', imgElement.alt, "Expected to see alt text on image element.");
            $A.test.assertEquals(-1, imgElement.className.indexOf('logo'));
        }
    },
    
    testInformationImageTypeWithAltText:{
    	attributes : {imageType:'informational', alt:'Company'},
        test: function(cmp){
            var imgElement = cmp.getElement();
            $A.test.assertTrue($A.test.isInstanceOfImageElement(imgElement), "Expected to see a image element.");
            $A.test.assertEquals('Company', imgElement.alt, "Expected to see alt text on image element.");
        }
    },
    
    testInformationImageTypeWithoutAltText:{
    	exceptionsAllowedDuringInit : ["\"alt\" attribute should not be empty for informational image"],
    	attributes : {imageType:'informational'},
        test: function(cmp){
            // Note the missing colon here compared to below.
            var errorMessage = "component: 1:1.1 \"alt\" attribute should not be empty for informational image";
            $A.test.expectAuraError(errorMessage);
            var screenError = $A.test.getAuraErrorMessage();
            $A.test.assertTrue($A.test.contains(screenError, errorMessage),
                               "Expected '" + errorMessage+"', Got:'"+screenError+"'");
        }
    },
    
    testDecorativeImageTypeWithAltText:{
    	exceptionsAllowedDuringInit : ["\"alt\" attribute should be empty for decorative image"],
    	attributes : {imageType:'decorative', alt:'Company'},
        test: function(cmp){
            var errorMessage = "component: 1:1.1: \"alt\" attribute should be empty for decorative image";
            $A.test.expectAuraError(errorMessage);
            var screenError = $A.test.getAuraErrorMessage();
            $A.test.assertTrue($A.test.contains(screenError, errorMessage),
                               "Expected '" + errorMessage+"', Got:'"+screenError+"'");
        }
    },
    
    testDecorativeImageTypeWithoutAltText:{
    	attributes : {imageType:'decorative'},
        test: function(cmp,action){
            var imgElement = cmp.getElement();
            $A.test.assertTrue($A.test.isInstanceOfImageElement(imgElement), "Expected to see a image element.");
        }
    },
    
    //W-1014086
    _testAccessibility:{
        test:function(cmp){
            var imgElement = cmp.getElement();
            $A.test.assertTrue($A.test.isInstanceOfImageElement(imgElement))
            $A.test.assertEquals("",imgElement.alt, "Expected a empty alt text for all image tags.");
            cmp.getAttributes().setValue("alt",'Help Accessibility');
            cmp.getAttributes().setValue("src",'http://www.google.com/intl/en_com/images/srpr/logo3w.png');
            $A.renderingService.rerender(cmp);

            imgElement = cmp.getElement();
            $A.test.assertEquals("Help Accessibility",imgElement.alt, "Expected alt text for the image element.");
        }
    },
    endsWith:function(str, suffix){
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
})

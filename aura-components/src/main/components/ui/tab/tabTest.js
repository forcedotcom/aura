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
    testDefault:{
        test:function(cmp){
            //Assert that a tab is enclosed in a list element, changing the element type can lead to breaking third party app styling.
            var li = cmp.find('li');
            aura.test.assertNotNull(li);
            aura.test.assertTrue(li.getElement() instanceof HTMLLIElement, "The element type used to display tab has changed.")

        }
    },
    testTitleAndBody:{
        attributes:{title:'aura'},
        test:function(cmp){
            var tabHeader = cmp.find('a');
            aura.test.assertNotNull(tabHeader);
            aura.test.assertTrue(tabHeader.getElement().className.indexOf('tabHeader')!=-1, "The anchor tag does not have CSS selector 'tabHeader', header styling will not be applied.")
            aura.log(tabHeader);
            aura.test.assertEquals('aura', $A.test.getText(tabHeader.getElement()), "Tab header failed to display the title of the tab.")
        }
    },
    testTabActive:{
        attributes:{active:false},
        test:function(cmp){
            var li = cmp.find('li');
            aura.test.assertNotNull(li);
            aura.test.assertTrue(li.getElement().className.indexOf('active')==-1, "Active css selector applied to tab when attribute was set to false.")
            //Verify that tab title is visible
            var a = cmp.find('a');
            aura.test.assertEquals('block', this.getComputedStyle(a.getElement())['display'], "Title of tab to be displayed even if tab is inactive");
            var tabBody = cmp.find('tabBody');
            aura.test.assertEquals('none', this.getComputedStyle(tabBody.getElement())['display'], "Tabbody should not be displayed if tab is inactive");

            //Make the tab active and verify that CSS rule makes the tabBody Visible
            cmp.getAttributes().setValue('active',true);
            $A.renderingService.rerender(cmp);
            tabBody = cmp.find('tabBody');
            aura.test.assertEquals('block', this.getComputedStyle(tabBody.getElement())['display'], "tabbody should be displayed if tab is active");

        }
    },
    /**
     * Test case that verifies the role attributes are correctly set (Accessibility)
     */
    testRole:{
        test:function(cmp){
            var li = cmp.find("li");
            aura.test.assertNotNull(li);
            aura.test.assertEquals("presentation", li.getElement().getAttribute("role"), "The presentation role is not correctly set on li element");
            var a = cmp.find("a");
            aura.test.assertNotNull(a);
            aura.test.assertEquals("tab", a.getElement().getAttribute("role"), "The tab role is not correctly set on anchor element");
            var tabBody = cmp.find("tabBody");
            aura.test.assertNotNull(tabBody);
            aura.test.assertEquals("tabpanel", tabBody.getElement().getAttribute("role"), "The tabpanel role is not correctly set on div.tabBody element");
        }
    },
    /**
     * Test case that verifies the aria-xxxx attributes are correctly set (Accessibility)
     */
    testAriaAttribute:{
        attributes:{active:true},
        test:function(cmp){
            var a = cmp.find("a");
            aura.test.assertNotNull(a);
            aura.test.assertEquals("true", a.getElement().getAttribute("aria-selected"), "The aria-selected attribute is not correctly set on anchor element");
            var tabBody = cmp.find("tabBody");
            aura.test.assertNotNull(tabBody);
            aura.test.assertEquals("true", tabBody.getElement().getAttribute("aria-expanded"), "The aria-expanded attribute is not set correctly on div.tabBody element");
        }
    },
    
    getComputedStyle: function(element){
    	if(!window.getComputedStyle){
    		return element.currentStyle;
    	}
    	return window.getComputedStyle(element);    	
    }
})

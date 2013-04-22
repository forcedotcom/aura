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
    testLabel: {
        attributes : {label : 'shucks'},
        test: function(component){
            aura.test.assertEquals('shucks', $A.test.getText(component.find("span").getElement()), "Label not found");
        }
    },
    testHTMLElementType:{
        attributes : {label : 'Ok'},
        test:function(component){
            var element = component.getElement();
            aura.test.assertNotNull(element, "Unable to retrieve Dom element information for ui button");
            aura.test.assertTrue($A.test.isInstanceOfButtonElement(element), "ui:button should be rendering a button element.");
        }
    },
    testDefaultPropertiesOfUiButton:{
        attributes : {label : 'Ok'},
        test:function(component){
            var element = component.getElement();
            aura.test.assertEquals('button', component.getAttributes().getValue('buttonType').getValue(), "default value of buttonType attribute should be 'button'")
            aura.test.assert('button',element.getAttribute('type'), "By default ui:button should create a button element of type 'Button'");

            aura.test.assertTrue(!component.getAttributes().getValue('buttonTitle').getValue(), "Button should not have a default value for title");

            aura.test.assertFalse(component.getAttributes().getValue('disabled').getBooleanValue(), "Button should not be disabled by default");
            aura.test.assertFalse(element.disabled, "By default dom element for ui:button should not be disabled");

            aura.test.assertEquals('ltr', component.getAttributes().getValue('labelDir').getValue(), "Button label should be left to right by default");

            aura.test.assertEquals("", component.getAttributes().getValue('accesskey').getValue(), "Button should have no shortcut key by default");
            aura.test.assertEquals("", element.accessKey, "By default dom element for ui:button should have no shortcut key");
        }
    },
    testTitle:{
        attributes:{label : 'Ok', buttonTitle:'Button Title'},
        test:function(component)    {
            aura.test.assertEquals('Button Title',component.find("button").getElement().title, "Rendered button does not have a title");
        }
    },
    testButtonType:{
        attributes:{label : 'Ok', buttonType: 'reset'},
        test:function(component){
            aura.test.assertEquals('reset', component.find("button").getElement().getAttribute("type"), "Button not rendered with specified type");
        }
    },
    // FF 3.6 doesn't default the type as FF 4+ and Google Chrome do, but FF 3.6 is not our end-target platform
    _testInvalidButtonType:{
        attributes:{buttonType: 'fooBar'},
        test:function(component){
            aura.test.assertEquals('submit', component.find("button").getElement().type, "Button not rendered with default type when a bad type is specified")
        }
    },
    testLabelClass:{
        attributes:{label:'Ok', labelClass: 'OkStyling'},
        test:function(component){
            aura.test.assertNotEquals(component.find("span").getElement().className.toString().indexOf('OkStyling'), -1,
                    "Button not rendered with specified labelStyle class")
        }
    },
    testLabelHidden: {
        attributes : {label : 'shucks', labelDisplay: "false"},
        test: function(component){
            aura.test.assertEquals('shucks', $A.test.getText(component.find("hidden").getElement()), "Label not found");
        }
    },
    testButtonWithIcon:{
        attributes:{label : 'Ok', iconImgSrc:'/auraFW/resources/aura/images/bug.png', iconClass:'Red'},
        test:function(component){
            for(var i in component.find('button').getElement().children){
                var child = component.find('button').getElement().children[i];
                if($A.test.isInstanceOfImageElement(child)){
                    aura.test.assertNotEquals(child.className.toString().indexOf('Red'), -1 ,
                            "Button not rendered with specified iconClass")
                    aura.test.assertNotEquals(child.src.indexOf('/auraFW/resources/aura/images/bug.png'), -1,
                            "Button not rendered with specified icon img")
                    return;
                }
            }
            aura.test.fail("Could not attach an image icon to button");
        }
    },
    //TODO Uncomment test once user story W-747907 is resolved
    _testButtonWithoutIcon:{
        attributes:{},
        test:function(component){
            for(var i in component.find('button').getElement().children){
                var child = component.find('button').getElement().children[i];
                if($A.test.isInstanceOfImageElement(child)){
                    aura.test.fail("There should be no image element for this button");
                }
            }
        }
    },
    testDisabled:{
        attributes:{label : 'Ok', disabled:true},
           test:function(component){
            aura.test.assertTrue(component.find("button").getElement().disabled, "Button was not rendered in disabled state");
        }
    },
    testAccesskey:{
        attributes:{label : 'Ok', accesskey:'A'},
        test:function(component){
            aura.test.assertEquals('A',component.find("button").getElement().accessKey, "Button not rendered with the specified accesskey");
        }
    },
    testLabelDir:{
        attributes:{label:"Click right Now!", labelDir:'rtl'},
        test:function(component){
            aura.test.assertEquals('rtl', component.find('span').getElement().dir, "Label not rendered with specified text direction.")
        }
    },
    //TODO W-1014086
    _testRerender:{
        attributes:{label:"Like", disabled:false, hasIcon:true, iconImgSrc:'/auraFW/resources/aura/images/bug.png'},
        test:function(component){
            aura.test.assertEquals('Like', $A.test.getText(component.find("div").getElement()), "Label not correct");
            aura.test.assertFalse(component.find("button").getElement().disabled, "Button was rendered in disabled state");

            component.getAttributes().setValue('disabled', true);
            component.getAttributes().setValue('label', 'clear');
            component.getAttributes().setValue('iconImgSrc', '/auraFW/resources/aura/images/clear.png');
            $A.renderingService.rerender(component);

            aura.test.assertEquals('clear', $A.test.getText(component.find("div").getElement()), "New label not rerendered");
            aura.test.assertTrue(component.find("button").getElement().disabled, "Button was not rerendered in disabled state");
            for(var i in component.find('button').getElement().children){
                var child = component.find('button').getElement().children[i];
                if($A.test.isInstanceOfImageElement(child)){
                    aura.test.assertTrue(child.src.indexOf('/auraFW/resources/aura/images/clear.png')!==-1, "Button not rerendered with specified icon img")
                }
            }
            $A.renderingService.rerender(component);

            for(var i in component.find('button').getElement().children){
                var child = component.find('button').getElement().children[i];
                if($A.test.isInstanceOfImageElement(child)){
                    aura.test.fail("There should be no image element for the button");
                }
            }
        }
    }

})

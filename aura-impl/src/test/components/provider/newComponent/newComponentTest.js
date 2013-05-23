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
    getLocallyCreatedComponent:function(cmp){
        cmp.find("create").get("e.press").fire();
        var body = cmp.get("v.body");
        $A.test.assertEquals(1, body.length);
        $A.test.assertEquals(true, body[0].isRendered());
        return body[0];
    },

    /**
     * Create client-side provided component with descriptor.
     */
    testClientProvidedDescriptor:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'ui:inputText'}"},
        test:function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://ui:inputText", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("ui:inputText", creation.getElement().value);
        }
    },

    /**
     * Create client-side provided component with prefixed descriptor.
     */
    testClientProvidedPrefixedDescriptor:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'markup://ui:outputText'}"},
        test:function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://ui:outputText", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("markup://ui:outputText", $A.test.getText(creation.getElement()));
        }
    },

    /**
     * Create client-side provided provider component.  Luckily, this provider is a concrete component, as the provided provider will not provide again.
     */
    testClientProvidedProvider:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'provider:clientProvider'}"},
        test:function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://provider:clientProvider", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("provider:clientProvider", creation.getAttributes().get("value"));
        }
    },

    /**
     * Create client-side provided component with config.
     */
    testClientProvidedConfig:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'aura:text',attributes:{value:'breadwinner'}}\"}"},
        test:function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://aura:text", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("breadwinner", $A.test.getText(creation.getElement()));
        }
    },

    /**
     * Create client-side provided component with config with prefixed descriptor.
     */
    testClientProvidedConfigWithPrefixedDescriptor:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'markup://aura:expression',attributes:{value:'breadchampion'}}\"}"},
        test:function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://aura:expression", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("breadchampion", $A.test.getText(creation.getElement()));
        }
    },

    /**
     * Create client-side provided provider component with config.  Luckily, this provider is a concrete component, as the provided provider will not provide again.
     */
    testClientProvidedProviderConfig:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'provider:clientProvider',attributes:{value:'baconbringerhomer'}}\"}"},
        test:function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://provider:clientProvider", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("baconbringerhomer", creation.getAttributes().get("value"));
        }
    },

    /**
     * Error thrown if client provider provides unknown descriptor.
     */
    testClientProvidedUnknownDescriptor:{
        test:function(cmp){
            var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:'arrested:development'} } };
            try{
                $A.componentService.newComponent(config, null, true, false);
            } catch (e){
                $A.test.assertEquals("Assertion Failed!: Unknown component markup://arrested:development : undefined", e.message);
                return;
            }

            throw new Error("Expected an error");
        }
    },

    /**
     * Default provider descriptor is used if client provider provides null descriptor.
     */
    testClientProvidedNullDescriptor:{
        test:function(cmp){
            var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:null} } };
            var creation = $A.componentService.newComponent(config, null, true, false);
            $A.test.assertEquals("markup://provider:clientProvider", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals(null, creation.getAttributes().get("value"));
        }
    },

    /**
     * Default provider descriptor is used if client provider provides undefined descriptor.
     */
    testClientProvidedUndefinedDescriptor:{
        test:function(cmp){
            var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:undefined} } };
            var creation = $A.componentService.newComponent(config, null, true, false);
            $A.test.assertEquals("markup://provider:clientProvider", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals(undefined, creation.getAttributes().get("value"));
        }
    }
})

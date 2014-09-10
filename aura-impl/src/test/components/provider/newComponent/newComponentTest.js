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
	createComponent : function(cmp){
		cmp.get('c.createComponent').runDeprecated();
	},
	
    getLocallyCreatedComponent:function(cmp){
        var body = cmp.get('v.body');
        $A.test.assertEquals(1, body.length);
        $A.test.assertEquals(true, body[0].isRendered());
        return body[0];
    },

    /**
     * Create client-side provided component with descriptor. ui:* is preloaded for application.
     */
    testClientProvidedDescriptor:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'ui:inputText'}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
        	var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://ui:inputText", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("ui:inputText", creation.getElement().value);
        }]
    },
    
    /**
     * Create client-side provided component with descriptor. attributesTest:simpleValue is not preloaded, we add it as dependency
     */
    testClientProvidedDescriptorNotPreloaded:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'attributesTest:simpleValue'}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://attributesTest:simpleValue", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("button", creation.getElement().getAttribute('type'));
        }]
    },
    
    /**
     * Create client-side provided component with descriptor. attributesTest:parent is not preloaded.
     * this is different from the test for "arrested:development" down there as attributesTest:parent does exist
     */
    testClientProvidedDescriptorNotPreloadedError:{
    	test:function(cmp){
    	var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:'attributesTest:parent'} } };
        try{
            $A.componentService.newComponentAsync(this, function(){}, config, null, true, false);
            $A.test.fail("ERROR: Expecting exception when provider return non-loaded componentDef");
        }
        catch (e){
                $A.test.assertEquals("Unknown component: markup://attributesTest:parent", e.message);
            }
        }
    },
      
    /**
     * Create client-side provided component with prefixed descriptor.
     */
    testClientProvidedPrefixedDescriptor:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'markup://ui:outputText'}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://ui:outputText", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("markup://ui:outputText", $A.test.getText(creation.getElement()));
        }]
    },
    
    

    /**
     * Create client-side provided provider component.  Luckily, this provider is a concrete component, as the provided provider will not provide again.
     */
    testClientProvidedProvider:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:'provider:clientProvider'}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://provider:clientProvider", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("provider:clientProvider", creation.get("v.value"));
        }]
    },

    /**
     * Create client-side provided component with config.
     */
    testClientProvidedConfig:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'aura:text',attributes:{value:'breadwinner'}}\"}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://aura:text", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("breadwinner", $A.test.getText(creation.getElement()));
        }]
    },

    /**
     * Create client-side provided component with config with prefixed descriptor.
     */
    testClientProvidedConfigWithPrefixedDescriptor:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'markup://aura:expression',attributes:{value:'breadchampion'}}\"}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://aura:expression", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("breadchampion", $A.test.getText(creation.getElement()));
        }]
    },

    /**
     * Create client-side provided provider component with config.  Luckily, this provider is a concrete component, as the provided provider will not provide again.
     */
    testClientProvidedProviderConfig:{
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'provider:clientProvider',attributes:{value:'baconbringerhomer'}}\"}"},
        test : [function(cmp) {
        	this.createComponent(cmp);
        }, function(cmp){
            var creation = this.getLocallyCreatedComponent(cmp);
            $A.test.assertEquals("markup://provider:clientProvider", creation.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("baconbringerhomer", creation.get("v.value"));
        }]
    },

    /**
     * Error thrown if client provider provides unknown descriptor.
     */
    testClientProvidedUnknownDescriptor:{
        test:function(cmp){
            var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:'arrested:development'} } };
            try{
                $A.componentService.newComponentAsync(this, function(){}, config, null, true, false);
                $A.test.fail("Expected error to be thrown during new component creation");
            } catch (e){
                $A.test.assertEquals("Unknown component: markup://arrested:development", e.message);
            }
        }
    },

    /**
     * Default provider descriptor is used if client provider provides null descriptor.
     */
    testClientProvidedNullDescriptor:{
        test:function(cmp){
            var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:null} } };
            $A.componentService.newComponentAsync(
                this,
                function(newCmp){
                    $A.test.assertEquals("markup://provider:clientProvider", newCmp.getDef().getDescriptor().getQualifiedName());
                    $A.test.assertEquals(null, newCmp.get("v.value"));
                },
                config, null, true, false
            );
        }
    },

    /**
     * Default provider descriptor is used if client provider provides undefined descriptor.
     */
    testClientProvidedUndefinedDescriptor:{
        test:function(cmp){
            var config = { componentDef:"markup://provider:clientProvider", attributes:{ values:{ value:undefined} } };
            $A.componentService.newComponentAsync(
                this,
                function(newCmp){
                    $A.test.assertEquals("markup://provider:clientProvider", newCmp.getDef().getDescriptor().getQualifiedName());
                    $A.test.assertEquals(undefined, newCmp.get("v.value"));
                },
                config, null, true, false
            );
        }
    },

    /**
     * Verify client provided component cannot be server dependent
     */
    testClientProvidedServerDependent: {
        attributes:{ newDescriptor:"markup://provider:clientProvider", newAttributes:"{value:\"{componentDef:'markup://provider:cmpWithModel',attributes:{value:'secondThing'}}\"}"},
        test:function(cmp){
            $A.run(function(){
                cmp.get('c.createComponent').runDeprecated();
            });
            var error = $A.test.getAuraErrorMessage();
            $A.test.assertTrue(error.indexOf("Client provided component cannot have server dependencies") != -1,
                "Incorrect error message when creating client provided server dependent component");
        }
    }
})

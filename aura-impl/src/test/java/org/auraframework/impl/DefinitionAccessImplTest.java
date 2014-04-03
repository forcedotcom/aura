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
package org.auraframework.impl;

import org.auraframework.Aura;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

public class DefinitionAccessImplTest extends AuraImplTestCase {
    DefinitionParserAdapter definitionParser = null;
    
    public DefinitionAccessImplTest(String name) {
        super(name);
    }
    
    @Override
    public void setUp() throws Exception{
        super.setUp();
        definitionParser = Aura.getDefinitionParserAdapter();
    }
    public void testInvalidAccessStrings()throws Exception{
        for(String s : new String[]{"", "null", " ", "fooBared", "PRIVATEAUTHENTICATED"}){
            try{
                definitionParser.parseAccess(null,s);
                fail("Should have failed to accept \""+s+"\" as value for access attribute.");
            }catch(InvalidAccessValueException expected){
                //Expected
            }
        }
    }
    
    /**
     * Verify authentication values specified with access attribute.
     * @throws Exception
     */
    public void testParseSpecifiedAuthentication()throws Exception{
        DefinitionAccess access = definitionParser.parseAccess(null, "authenticated");
        assertTrue(access.requiresAuthentication());
        
        access = definitionParser.parseAccess(null, "unauthenticated");
        assertFalse(access.requiresAuthentication());
        
        //Case insensitive too
        access = definitionParser.parseAccess(null, "AUTHENTICATED");
        assertTrue(access.requiresAuthentication());
        
        //No authentication specified
        access = definitionParser.parseAccess(null, "PRIVATE");
        assertTrue(access.requiresAuthentication());
        
        //Both authentication values specified
        try{
            definitionParser.parseAccess(null, "AUTHENTICATED, UNAUTHENTICATED");
            fail("Should not allow to specify both authentication values.");
        }catch(InvalidAccessValueException expected){
            assertEquals("Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED", expected.getMessage());
        }
    }
    
    /**
     * Verify access values specified using access attribute.
     */
    public void testParseSpecifiedAccess() throws Exception{
        DefinitionAccess access = definitionParser.parseAccess(null, "GLOBAL");
        assertTrue(access.isGlobal());
        
        access = definitionParser.parseAccess(null, "PRIVATE");
        assertFalse(access.isGlobal());
        assertTrue(access.isPrivate());
        
        access = definitionParser.parseAccess(null, "INTERNAL");
        assertTrue(access.isInternal());
        
        access = definitionParser.parseAccess(null, "PUBLIC");
        assertTrue(access.isPublic());
        
        //Multiple access levels specified
        try{
            definitionParser.parseAccess(null, "GLOBAL, PRIVATE");
            fail("Should not allow to specify more than one access level.");
        }catch(InvalidAccessValueException expected){
            assertEquals("Access attribute can only specifiy one of GLOBAL, PUBLIC, or PRIVATE", expected.getMessage());
        }
    }
    
    public void testParseStaticMethods()throws Exception{
        //Positive test case
        DefinitionAccess access = definitionParser.parseAccess(null, "org.auraframework.test.TestAccessMethods.allowGlobal");
        assertTrue(access.isGlobal());
        
        //Negative test cases
        for(String s : new String[]{
                "org.auraframework.test.TestAccessMethods.privateMethod",
                "org.auraframework.test.TestAccessMethods.allowAuthenticated", //Return type is not Access
                "java://org.auraframework.test.TestAccessMethods.allowGlobal",
                "org.auraframework.test.TestAccessMethods.nonStaticMethod",
                "org.auraframework.test.TestAccessMethods.allowGlobal, org.auraframework.test.TestAccessMethods.allowPrivate",
                "org.auraframework.test.TestAccessMethods.lostSoul",
                "org.auraframework.test.LostParent.lostSoul",
                })
        {
            try{
                definitionParser.parseAccess(null, s);
                fail("Should have failed because this access method is unusable :"+ s);
            }catch(InvalidAccessValueException expected){
                //Expected
            }
        }
        access = definitionParser.parseAccess(null, "org.auraframework.test.TestAccessMethods.throwsException");
        try{
            access.isGlobal();
            fail("Should throw an AuraRuntimeException when access method throws an exception.");
        }catch(AuraRuntimeException expected){
            assertTrue(expected.getMessage().startsWith("Exception executing access-checking method"));
        }
        
    }
    
    public void testValidation_AccessLevelAndStaticMethodSpecified()throws Exception{
        DefinitionAccess access = definitionParser.parseAccess(null, "org.auraframework.test.TestAccessMethods.allowGlobal, PRIVATE");
        try{
            access.validate(null, false, false);
            fail("Access attribute may not specify enum value when a static method is also specified");
        }catch(InvalidAccessValueException expected){}
    }
    
    public void testValidation_AuthenticationAllowedOnlyInSystemNamespace()throws Exception{
        DefinitionAccess access = definitionParser.parseAccess(null, "AUTHENTICATED");
        access.validate(StringSourceLoader.DEFAULT_NAMESPACE, true, false);
        
        //AUTHENTICATED/UNAUTHENTICATED not supported in custom namespaces
        try{
            access.validate(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, true, false);
            fail("Authentication values for access should not be allowed in custom namespaces");
        }catch(InvalidAccessValueException expected){           
        }
    }

    /**
     * Verify that authentication values cannot be used when validate() is asked not to allow it.
     * @throws Exception
     */
    public void testValidation_AuthenticationCannotBeUsedWhenNotAllowed()throws Exception{
        Boolean allowAuthentication = false;
        DefinitionAccess access = definitionParser.parseAccess(null, "AUTHENTICATED");
        try{
            access.validate(StringSourceLoader.DEFAULT_NAMESPACE, allowAuthentication, false);
            fail("Should not have processed athentication");
        }catch(InvalidAccessValueException expected){}
    }
    
    
    public void testValidation_PrivateAccess()throws Exception{
        boolean allowPrivate = true;
        DefinitionAccess access = definitionParser.parseAccess(null, "PRIVATE");
        access.validate(null, false, allowPrivate);
        
        allowPrivate = false;
        try{
            access.validate(null, false, allowPrivate);
            fail("PRIVATE access should not be allowed");
        }catch(InvalidAccessValueException expected){}
    }
    
    public void testValidation_InternalAccess()throws Exception{
        DefinitionAccess access = definitionParser.parseAccess(null, "INTERNAL");
        access.validate(StringSourceLoader.DEFAULT_NAMESPACE, false, false);
        
        //INTERNAL not supported in custom namespaces
        try{
            access.validate(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, false, false);
            fail("INTERNAL should not be allowed in custom namespaces");
        }catch(InvalidAccessValueException expected){}
    }
    
    public void testValidation_StaticMethodsUsageRestriction() throws Exception{
        DefinitionAccess access = definitionParser.parseAccess(null, "org.auraframework.test.TestAccessMethods.allowGlobal");
        access.validate(StringSourceLoader.DEFAULT_NAMESPACE, false, false);
        
        //static methods not supported in custom namespaces
        try{
            access.validate(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, false, false);
            fail("static methods should not be allowed in custom namespaces");
        }catch(InvalidAccessValueException expected){}
        
    }
}

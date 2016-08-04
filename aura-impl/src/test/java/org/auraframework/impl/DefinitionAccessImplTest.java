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

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.junit.Test;

import javax.inject.Inject;

public class DefinitionAccessImplTest extends AuraImplTestCase {

    @Inject
    private DefinitionParserAdapter definitionParserAdapter;
    
    @Override
    public void setUp() throws Exception{
        super.setUp();
    }

    @Test
    public void testInvalidAccessStrings()throws Exception{
        for(String s : new String[]{"", "null", " ", "fooBared", "PRIVATEAUTHENTICATED"}){
            try{
                definitionParserAdapter.parseAccess(null, s);
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
    @Test
    public void testParseSpecifiedAuthentication()throws Exception{
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "authenticated");
        assertTrue(access.requiresAuthentication());

        access = definitionParserAdapter.parseAccess(null, "unauthenticated");
        assertFalse(access.requiresAuthentication());
        
        //Case insensitive too
        access = definitionParserAdapter.parseAccess(null, "AUTHENTICATED");
        assertTrue(access.requiresAuthentication());
        
        //No authentication specified
        access = definitionParserAdapter.parseAccess(null, "PRIVATE");
        assertTrue(access.requiresAuthentication());
        
        //Both authentication values specified
        try{
            definitionParserAdapter.parseAccess(null, "AUTHENTICATED, UNAUTHENTICATED");
            fail("Should not allow to specify both authentication values.");
        }catch(InvalidAccessValueException expected){
            assertEquals("Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED", expected.getMessage());
        }
    }
    
    /**
     * Verify access values specified using access attribute.
     */
    @Test
    public void testParseSpecifiedAccess() throws Exception{
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "GLOBAL");
        assertTrue(access.isGlobal());

        access = definitionParserAdapter.parseAccess(null, "PRIVATE");
        assertFalse(access.isGlobal());
        assertTrue(access.isPrivate());

        access = definitionParserAdapter.parseAccess(null, "INTERNAL");
        assertTrue(access.isInternal());

        access = definitionParserAdapter.parseAccess(null, "PUBLIC");
        assertTrue(access.isPublic());
        
        //Multiple access levels specified
        try{
            definitionParserAdapter.parseAccess(null, "GLOBAL, PRIVATE");
            fail("Should not allow to specify more than one access level.");
        }catch(InvalidAccessValueException expected){
            assertEquals("Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE", expected.getMessage());
        }
    }

    @Test
    public void testParseStaticMethods()throws Exception{
        //Positive test case
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "org.auraframework.impl.test.util.TestAccessMethods.allowGlobal");
        assertTrue(access.isGlobal());
        
        //Negative test cases
        for(String s : new String[]{
                "org.auraframework.impl.test.util.TestAccessMethods.privateMethod",
                "org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated", //Return type is not Access
                "java://org.auraframework.impl.test.util.TestAccessMethods.allowGlobal",
                "org.auraframework.impl.test.util.TestAccessMethods.nonStaticMethod",
                "org.auraframework.impl.test.util.TestAccessMethods.allowGlobal, org.auraframework.impl.test.util.TestAccessMethods.allowPrivate",
                "org.auraframework.impl.test.util.TestAccessMethods.lostSoul",
                "org.auraframework.test.LostParent.lostSoul",
                })
        {
            try{
                definitionParserAdapter.parseAccess(null, s);
                fail("Should have failed because this access method is unusable :"+ s);
            }catch(InvalidAccessValueException expected){
                //Expected
            }
        }
        access = definitionParserAdapter.parseAccess(null, "org.auraframework.impl.test.util.TestAccessMethods.throwsException");
        try{
            access.isGlobal();
            fail("Should throw an AuraRuntimeException when access method throws an exception.");
        }catch(AuraRuntimeException expected){
            assertTrue(expected.getMessage().startsWith("Exception executing access-checking method"));
        }
        
    }

    @Test
    public void testValidation_AccessLevelAndStaticMethodSpecified()throws Exception{
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "org.auraframework.impl.test.util.TestAccessMethods.allowGlobal, PRIVATE");
        try{
            access.validate(null, false, false, configAdapter);
            fail("Access attribute may not specify enum value when a static method is also specified");
        }catch(InvalidAccessValueException expected){}
    }

    @Test
    public void testValidation_AuthenticationAllowedOnlyInSystemNamespace()throws Exception{
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "AUTHENTICATED");
        access.validate(StringSourceLoader.DEFAULT_NAMESPACE, true, false, configAdapter);
        
        //AUTHENTICATED/UNAUTHENTICATED not supported in custom namespaces
        try{
            access.validate(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, true, false, configAdapter);
            fail("Authentication values for access should not be allowed in custom namespaces");
        }catch(InvalidAccessValueException expected){           
        }
    }

    /**
     * Verify that authentication values cannot be used when validate() is asked not to allow it.
     * @throws Exception
     */
    @Test
    public void testValidation_AuthenticationCannotBeUsedWhenNotAllowed()throws Exception{
        Boolean allowAuthentication = false;
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "AUTHENTICATED");
        try{
            access.validate(StringSourceLoader.DEFAULT_NAMESPACE, allowAuthentication, false, configAdapter);
            fail("Should not have processed athentication");
        }catch(InvalidAccessValueException expected){}
    }


    @Test
    public void testValidation_PrivateAccess()throws Exception{
        boolean allowPrivate = true;
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "PRIVATE");
        access.validate(null, false, allowPrivate, configAdapter);
        
        allowPrivate = false;
        try{
            access.validate(null, false, allowPrivate, configAdapter);
            fail("PRIVATE access should not be allowed");
        }catch(InvalidAccessValueException expected){}
    }

    @Test
    public void testValidation_InternalAccess()throws Exception{
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "INTERNAL");
        access.validate(StringSourceLoader.DEFAULT_NAMESPACE, false, false, configAdapter);
        
        //INTERNAL not supported in custom namespaces
        try{
            access.validate(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, false, false, configAdapter);
            fail("INTERNAL should not be allowed in custom namespaces");
        }catch(InvalidAccessValueException expected){}
    }

    @Test
    public void testValidation_StaticMethodsUsageRestriction() throws Exception{
        DefinitionAccess access = definitionParserAdapter.parseAccess(null, "org.auraframework.impl.test.util.TestAccessMethods.allowGlobal");
        access.validate(StringSourceLoader.DEFAULT_NAMESPACE, false, false, configAdapter);
        
        //static methods not supported in custom namespaces
        try{
            access.validate(StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, false, false, configAdapter);
            fail("static methods should not be allowed in custom namespaces");
        }catch(InvalidAccessValueException expected){}
        
    }
}

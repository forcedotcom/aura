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
package org.auraframework.impl.java.securityProvider;

import org.auraframework.Aura;
import org.auraframework.components.DefaultSecurityProvider;
import org.auraframework.components.security.*;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.test.AuraTestCase;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.QuickFixException;

public class JavaSecurityProviderDefFactoryTest extends AuraTestCase {

    public JavaSecurityProviderDefFactoryTest() {
        super(JavaSecurityProviderDefFactoryTest.class.getSimpleName());
    }

    private SecurityProviderDef getSecurityProviderDef(String className) throws QuickFixException {
        return new JavaSecurityProviderDefFactory(null).getDef(Aura.getDefinitionService().getDefDescriptor(
                "java://" + className, SecurityProviderDef.class));
    }

    /**
     * Assert that we get an exception when attempting to retrieve a definition.
     */
    private Exception assertException(String className, String message, String filename) {
        try {
            getSecurityProviderDef(className);
            fail("Expected Exception");
            return null;
        } catch (Exception e) {
            checkExceptionFull(e, null, message, filename);
            return e;
        }
    }

    /**
     * getDef with descriptor for a valid SecurityProvider.
     */
    public void testGetSecurityProviderDef() throws Exception {
        SecurityProviderDef def = getSecurityProviderDef(DefaultSecurityProvider.class.getName());
        assertEquals("java://" + DefaultSecurityProvider.class.getName(), def.getDescriptor().getQualifiedName());
    }

    /**
     * getDef with descriptor for unknown class.
     */
    public void testGetSecurityProviderDefUnknown() throws Exception {
        assertNull(getSecurityProviderDef("unknown.class.name"));
    }

    /**
     * getDef with descriptor for a class without SecurityProvider annotation.
     */
    public void testGetSecurityProviderDefWithoutAnnotation() throws Exception {
        assertException(SecurityProviderWithoutAnnotation.class.getName(),
                        "SecurityProviders must implement the SecurityProvider interface",
                        SecurityProviderWithoutAnnotation.class.getName());
    }

    /**
     * getDef with descriptor for a class without SecurityProvider annotation.
     */
    public void testSecurityProviderDefCompatibility() throws Exception {
        SecurityProviderDef compat = getSecurityProviderDef(SecurityProviderCompatibility.class.getName());

        assertFalse(compat.isAllowed(null));
        assertTrue(compat.isAllowed(Aura.getDefinitionService().getDefDescriptor("auratest:html",
                                                                                  ComponentDef.class)));
        assertFalse(compat.isAllowed(Aura.getDefinitionService().getDefDescriptor("uitest:butttonteest",
                                                                                   ComponentDef.class)));
    }

    /**
     * getDef with descriptor for a class without expected static method.
     */
    public void testGetSecurityProviderDefWithoutStaticMethod() throws Exception {
        assertException(SecurityProviderWithoutStaticMethod.class.getName(),
                        "SecurityProviders must implement the SecurityProvider interface",
                        SecurityProviderWithoutStaticMethod.class.getName());
    }

    /**
     * getDef with descriptor for a class without expected method name.
     */
    public void testGetSecurityProviderDefWithoutMethodName() {
        assertException(SecurityProviderWithoutMethodName.class.getName(),
                        "SecurityProviders must implement the SecurityProvider interface",
                        SecurityProviderWithoutMethodName.class.getName());
    }

    /**
     * getDef with descriptor for a class without expected interface.
     */
    public void testGetSecurityProviderDefWithoutIfc() {
        assertException(SecurityProviderWithoutIfc.class.getName(),
                        "SecurityProviders must implement the SecurityProvider interface",
                        SecurityProviderWithoutIfc.class.getName());
    }

    /**
     * getDef with descriptor for a class with private constructor.
     */
    public void testGetSecurityProviderDefWithPrivateConst() {
        assertException(SecurityProviderWithPrivateConst.class.getName(),
                        "Constructor is inaccessible for "+SecurityProviderWithPrivateConst.class.getName(),
                        SecurityProviderWithPrivateConst.class.getName());
    }

    /**
     * getDef with descriptor for a class with arguments to constructor.
     */
    public void testGetSecurityProviderDefWithConstructorArgs() {
        assertException(SecurityProviderWithConstructorArgs.class.getName(),
                        "Cannot instantiate "+SecurityProviderWithConstructorArgs.class.getName(),
                        SecurityProviderWithConstructorArgs.class.getName());
    }

    public void testSecurityProviderThrowsThrowable() throws Exception {
        SecurityProviderDef spd = getSecurityProviderDef(SecurityProviderThrowsThrowable.class.getName());
        try {
            spd.isAllowed(null);
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionFull(e, NoAccessException.class, "Access Denied", null);
            checkExceptionFull(e.getCause(), RuntimeException.class, "generated intentionally", null);
        }
    }
}

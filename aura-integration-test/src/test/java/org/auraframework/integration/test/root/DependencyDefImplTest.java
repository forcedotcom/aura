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
package org.auraframework.integration.test.root;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DependencyDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import java.util.HashSet;
import java.util.Set;

public class DependencyDefImplTest extends AuraImplTestCase {
    @Test
    public void testDependencyDefNoParent() throws Exception {
        DependencyDef testDependencyDef = null;

        // Invalid, no parent.
        try {
            testDependencyDef = vendor.makeDependencyDef(null, "aura", null, vendor.makeLocation("f1", 5, 5, 0));
            testDependencyDef.validateDefinition();
            fail("Should have thrown QuickFixException for null parent in DependencyDef's");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "No parent in DependencyDef", "f1");
        }
    }

    @Test
    public void testDependencyDefNullResource() throws Exception {
        DependencyDef testDependencyDef = null;
        // Invalid no resource.
        try {
            testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), null, "COMPONENT",
                    vendor.makeLocation("f1", 5, 5, 0));
            testDependencyDef.validateDefinition();
            fail("Should have thrown QuickFixException for null resource in DependencyDef's");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Missing required resource", "f1");
        }
    }

    @Test
    public void testDependencyDefInvalidType() throws Exception {
        DependencyDef testDependencyDef = null;
        // Invalid type
        try {
            testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), "aura", "WhatAmI",
                    vendor.makeLocation("f1", 5, 5, 0));
            testDependencyDef.validateDefinition();
            fail("Should have thrown QuickFixException for invalid type in DependencyDef's");
        } catch (Exception e) {
            checkExceptionRegex(e, InvalidDefinitionException.class,
                    "No enum const(ant)? (class )?org\\.auraframework\\.def\\.DefDescriptor.DefType\\.WhatAmI", "f1");
        }
    }

    @Test
    public void testDependencyDefValidWithNamespace() throws Exception {
        DependencyDef testDependencyDef = null;
        // Valid, with a namespace.
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), "aura", null,
                vendor.makeLocation("f1", 5, 5, 0));
        testDependencyDef.validateDefinition();
    }

    @Test
    public void testDependencyDefValidWithNamespaceAndType() throws Exception {
        DependencyDef testDependencyDef = null;
        // Valid, with a namespace & type.
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), "aura", "COMPONENT",
                vendor.makeLocation("f1", 5, 5, 0));
        testDependencyDef.validateDefinition();
    }

    @Test
    public void testAppendDependenciesNoneFound() throws Exception {
        DependencyDef testDependencyDef;
        Set<DefDescriptor<?>> deps = new HashSet<>();
        // Try to get dependency that doesn't exist, verify exception thrown
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"),
                "markup://aura:iDontExist*", "COMPONENT", vendor.makeLocation("f1", 5, 5, 0));
        deps.clear();
        testDependencyDef.appendDependencies(deps);
        testDependencyDef.validateReferences();
        assertEquals(0, deps.size());
    }


    /**
     * Verify that dependencies of different types can be found within a given namespace or that the correct Exception
     * is thrown.
     * 
     * Since this test looks in a namespace that can be changed over time, the specific names of dependencies may need
     * to be changed as the source code changes.
     */
    @Test
    public void testAppendDependencies() throws Exception {
        DependencyDef testDependencyDef;
        Set<DefDescriptor<?>> deps = new HashSet<>();

        // Check for a couple dependencies present in a namespace
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), "aura", "INTERFACE",
                vendor.makeLocation("f1", 5, 5, 0));
        testDependencyDef.appendDependencies(deps);
        assertTrue("Dependency not found", containsDependency(deps, "markup://aura:rootComponent"));

        // Check dependency that exists but is wrong type
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"),
                "aura", "PROVIDER", vendor.makeLocation("f1", 5, 5, 0));
        deps.clear();
        testDependencyDef.appendDependencies(deps);

        // Get dependency of specific component
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"),
                "markup://aura:component", "COMPONENT", vendor.makeLocation("f1", 5, 5, 0));
        deps.clear();
        testDependencyDef.appendDependencies(deps);
        assertTrue("Failed to find dependency when searching using format <type>://<namespace>:<name>",
                containsDependency(deps, "markup://aura:component"));
    }

    @Test
    public void testAppendDependenciesDifferentType() throws Exception {
        // Valid resource name but wrong type
        DependencyDef testDependencyDef;
        Set<DefDescriptor<?>> deps = new HashSet<>();
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"),
                "markup://aura:applicatio*", "COMPONENT", vendor.makeLocation("f1", 5, 5, 0));
        deps.clear();
        testDependencyDef.appendDependencies(deps);
        testDependencyDef.validateReferences();
        assertEquals(0, deps.size());

    }

    @Test
    public void testAppendDependenciesDisallowedType() throws Exception {
        // Valid resource name but disallowed type
        DependencyDef testDependencyDef;
        Set<DefDescriptor<?>> deps = new HashSet<>();
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"),
                "markup://aura:application", "APPLICATION", vendor.makeLocation("f1", 5, 5, 0));
        deps.clear();
        testDependencyDef.appendDependencies(deps);
        testDependencyDef.validateReferences();
        assertEquals(0, deps.size());
    }

    private boolean containsDependency(Set<DefDescriptor<?>> depSet, String depName) {
        for (DefDescriptor<?> dependency : depSet) {
            if (dependency.getQualifiedName().equals(depName)) {
                return true;
            }
        }
        return false;
    }
}

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
package org.auraframework.impl.root;

import org.auraframework.def.DependencyDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.QuickFixException;

public class DependencyDefTest extends AuraImplTestCase {
    public DependencyDefTest(String name) {
        super(name);
    }

    public void testDependencyDefAndValidate() throws Exception {
        DependencyDef testDependencyDef = null;

        //
        // Invalid, no parent.
        //
        try {
            testDependencyDef = vendor.makeDependencyDef(null, "aura", null, vendor.makeLocation("f1", 5, 5, 0));
            testDependencyDef.validateDefinition();
            fail("Should have thrown QuickFixException for null parent in DependencyDef's");
        } catch (QuickFixException expected) {
        }

        //
        // Invalid no resource.
        //
        try {
            testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), null, null,
                    vendor.makeLocation("f1", 5, 5, 0));
            testDependencyDef.validateDefinition();
            fail("Should have thrown QuickFixException for null resource in DependencyDef's");
        } catch (QuickFixException expected) {
        }

        //
        // Invalid type
        //
        try {
            testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), null, "WhatAmI",
                    vendor.makeLocation("f1", 5, 5, 0));
            testDependencyDef.validateDefinition();
            fail("Should have thrown QuickFixException for invalid type in DependencyDef's");
        } catch (QuickFixException expected) {
        }

        //
        // Valid, with a namespace.
        //
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), "aura", null,
                vendor.makeLocation("f1", 5, 5, 0));
        testDependencyDef.validateDefinition();

        //
        // Valid, with a namespace & type.
        //
        testDependencyDef = vendor.makeDependencyDef(vendor.makeComponentDefDescriptor("hi"), "aura", "COMPONENT",
                vendor.makeLocation("f1", 5, 5, 0));
        testDependencyDef.validateDefinition();
    }
}

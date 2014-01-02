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
package org.auraframework.instance;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.test.UnitTestCase;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.json.Json;

/**
 * Unit tests for InstanceStack.java.
 * 
 * Note that the 'assert' keyword is not enabled by default so tests may fail depending on where they are run. Running
 * the tests through JUnit inside Eclipse, for example, fails but run from the command line using the 'mvn verify'
 * command passes.
 * 
 */
public class InstanceStackTest extends UnitTestCase {

    public InstanceStackTest(String name) {
        super(name);
    }

    // Simplified implementation of Instance for testing. We really only care about the path string.
    private class TestInstance implements Instance<Definition> {
        private final String path;

        public TestInstance() {
            this.path = "testInstance";
        }

        public TestInstance(String path) {
            this.path = path;
        }

        @Override
        public DefDescriptor getDescriptor() {
            return null;
        }

        @Override
        public String getPath() {
            return this.path;
        }

        @Override
        public void serialize(Json json) throws IOException {
        }
    }

    public void testPath() {
        InstanceStack iStack = new InstanceStack("testBase");
        assertEquals("InstanceStack constructor should set path to base", "testBase/*~0", iStack.getPath());

        iStack.pushInstance(new TestInstance());

        // Set and clear attributes
        iStack.setAttributeName("attr1");
        assertEquals("Setting attribute name should append name to path", "testBase/*~0/attr1", iStack.getPath());
        iStack.clearAttributeName("attr1");
        assertEquals("Clearing attribute name should remove name from path", "testBase/*~0", iStack.getPath());
        iStack.setAttributeName("body");
        assertEquals("Setting attribute name as body should append '*' to path", "testBase/*~0/*", iStack.getPath());
        iStack.clearAttributeName("body");
        assertEquals("testBase/*~0", iStack.getPath());
        iStack.setAttributeName("realbody");
        assertEquals("Setting attribute name as realbody should append '+' to path", "testBase/*~0/+", iStack.getPath());
        iStack.clearAttributeName("realbody");
        assertEquals("testBase/*~0", iStack.getPath());

        // Set and clear indexes
        iStack.setAttributeName("attr2");
        iStack.setAttributeIndex(42);
        assertEquals("testBase/*~0/attr2~42", iStack.getPath());
        iStack.clearAttributeIndex(42);
        assertEquals("testBase/*~0/attr2", iStack.getPath());
    }

    public void testPopInstanceToTopIncrementsIndex() {
        InstanceStack iStack = new InstanceStack("testBase");
        assertEquals("InstanceStack constructor should set path to base", "testBase/*~0", iStack.getPath());
        TestInstance ti = new TestInstance();
        iStack.pushInstance(ti);
        iStack.popInstance(ti);
        assertEquals("Popping to top of stack should increment index", "testBase/*~1", iStack.getPath());
        iStack.pushInstance(ti);
        iStack.popInstance(ti);
        assertEquals("Popping to top of stack should increment index", "testBase/*~2", iStack.getPath());
    }

    public void testMarkParentNoCurrentInstance() {
        InstanceStack iStack = new InstanceStack("testBase");
        assertEquals("InstanceStack constructor should set path to base", "testBase/*~0", iStack.getPath());
        TestInstance parent = new TestInstance("parentBase");
        iStack.markParent(parent);
        assertEquals("Marking parent should set path to the parent's path", "parentBase", iStack.getPath());
        iStack.clearParent(parent);
        assertEquals("Clearing parent should reset path to original base path", "testBase/*~0", iStack.getPath());
    }

    public void testMarkParentMultipleTimes() {
        InstanceStack iStack = new InstanceStack("testBase");
        assertEquals("InstanceStack constructor should set path to base", "testBase/*~0", iStack.getPath());
        TestInstance parent = new TestInstance("parent");
        iStack.markParent(parent);
        assertEquals("Marking parent should set path to the parent's path", "parent", iStack.getPath());
        iStack.markParent(parent);
        assertEquals("Marking additional parent should not update path", "parent", iStack.getPath());
        iStack.clearParent(parent);
        assertEquals("parent", iStack.getPath());
        iStack.clearParent(parent);
        assertEquals("Clearing both parents should reset path to original base path", "testBase/*~0", iStack.getPath());
    }

    public void testErrorWrongParent() {
        // Mark a new parent without clearing the first
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.markParent(new TestInstance("parent"));
        try {
            iStack.markParent(new TestInstance("different parent"));
            fail("Expected error when marking parent that's different than the current instance");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "Don't know how to handle setAttribute here");
        }

        // Clear an instance that hasn't been marked as a parent
        iStack = new InstanceStack("testBase");
        iStack.markParent(new TestInstance("parent"));
        try {
            iStack.clearParent(new TestInstance("different parent"));
            fail("Expected error when clearing parent that's different than the current instance");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched clear parent");
        }
    }

    public void testErrorPushPopDifferentInstances() {
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.pushInstance(new TestInstance("instance1"));
        try {
            iStack.popInstance(new TestInstance("instance2"));
            fail("Expected error when trying to pop different instance than previously pushed");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched instance pop");
        }
    }

    public void testErrorSetAttributeNameWithoutClearing() {
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.pushInstance(new TestInstance("instance"));
        iStack.setAttributeName("first");
        try {
            iStack.setAttributeName("second");
            fail("Expected error when setting second attribute without clearing first");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "Setting name illegally");
        }
    }

    public void testErrorSetIndexWithoutAttributeSet() {
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.pushInstance(new TestInstance("instance"));
        try {
            iStack.setAttributeIndex(1);
            fail("Expected error when setting attribute index without setting attribute name first");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "no name when index set");
        }
    }

    public void testErrorClearIndexWithoutSettingIndex() {
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.pushInstance(new TestInstance());
        iStack.setAttributeName("attribute");
        try {
            iStack.clearAttributeIndex(1);
            fail("Expected error when clearing attribute index before setting an index");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched clearAttributeIndex");
        }
    }

    public void testErrorClearIndexWhileDifferentIndexSet() {
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.pushInstance(new TestInstance());
        iStack.setAttributeName("attribute");
        iStack.setAttributeIndex(11);
        try {
            iStack.clearAttributeIndex(22);
            fail("Expected error when clearing attribute index when different index is set");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched clearAttributeIndex");
        }
    }

    public void testErrorSetIndexWithoutClearingPreviousIndex() {
        InstanceStack iStack = new InstanceStack("testBase");
        iStack.pushInstance(new TestInstance());
        iStack.setAttributeName("attribute");
        iStack.setAttributeIndex(42);
        try {
            iStack.setAttributeIndex(43);
            fail("Expected error when setting a new attribute index without clearing previous one");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "missing clearAttributeIndex");
        }
    }
}

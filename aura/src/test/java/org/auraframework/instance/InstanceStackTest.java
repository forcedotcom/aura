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

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.test.ServiceLocatorMocker;
import org.auraframework.test.UnitTestCase;

import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.ServiceLoader;
import org.auraframework.util.json.Json;
import org.mockito.Mockito;

import com.google.common.collect.Lists;

/**
 * Unit tests for InstanceStack.java.
 */
public class InstanceStackTest extends UnitTestCase {

    public InstanceStackTest(String name) {
        super(name);
    }

    /**
     * setUp mocks Aura.getConfigAdapter().isPrivilegedNamespace().
     */
    @Override
    public void setUp() throws Exception {
    	 super.setUp();
    	 mci = Mockito.mock(ConfigAdapter.class);
    	 Mockito.when(mci.isPrivilegedNamespace((String)Mockito.any())).thenReturn(true);
    	 ServiceLoader msl = ServiceLocatorMocker.mockServiceLocator();
    	 Mockito.when(msl.get(ConfigAdapter.class)).thenReturn(mci);    	 
    }

    /**
     * tearDown un-mocks Aura.getConfigAdapter().isPrivilegedNamespace().
     */
    @Override
    public void tearDown() throws Exception {
        ServiceLocatorMocker.unmockServiceLocator();
        super.tearDown();
    }

    //
    // Simplified implementation of Instance for testing. We really only care about the path string.
    // FIXME: This shoule be a mock.
    //
    private class TestInstance implements Instance<Definition> {
        private final String path;
        protected final DefDescriptor<Definition> descriptor;
        
        private DefDescriptor<Definition> createMockDescriptor(String namespace) {
        	@SuppressWarnings("unchecked")
			DefDescriptor<Definition> desc = Mockito.mock(DefDescriptor.class);
        	Mockito.when(desc.getNamespace()).thenReturn(namespace);
        	return desc;
        }
        
        public TestInstance() {
            this.path = "testInstance";
            this.descriptor = createMockDescriptor("aura");
        }

        public TestInstance(String path) {
        	this.path = path;
        	this.descriptor = createMockDescriptor("aura");
        }
        
        public TestInstance(String namespace, String name) {
        	this.path = namespace;
        	this.descriptor = createMockDescriptor(namespace);
        }
        
        @Override
        public DefDescriptor<Definition> getDescriptor() {
            return this.descriptor;
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
        InstanceStack iStack = new InstanceStack();
        assertEquals("InstanceStack constructor should set path to base", "/*[0]", iStack.getPath());

        Instance<?> ti = new TestInstance();
        iStack.pushInstance(ti, ti.getDescriptor());

        // Set and clear attributes
        iStack.setAttributeName("attr1");
        assertEquals("Setting attribute name should append name to path", "/*[0]/attr1", iStack.getPath());
        iStack.clearAttributeName("attr1");
        assertEquals("Clearing attribute name should remove name from path", "/*[0]", iStack.getPath());
        iStack.setAttributeName("body");
        assertEquals("Setting attribute name as body should append '*' to path", "/*[0]/*", iStack.getPath());
        iStack.clearAttributeName("body");
        assertEquals("/*[0]", iStack.getPath());
        iStack.setAttributeName("realbody");
        assertEquals("Setting attribute name as realbody should append '+' to path", "/*[0]/+", iStack.getPath());
        iStack.clearAttributeName("realbody");
        assertEquals("/*[0]", iStack.getPath());

        // Set and clear indexes
        iStack.setAttributeName("attr2");
        iStack.setAttributeIndex(42);
        assertEquals("/*[0]/attr2[42]", iStack.getPath());
        iStack.clearAttributeIndex(42);
        assertEquals("/*[0]/attr2", iStack.getPath());
    }

    public void testPopInstanceToTopIncrementsIndex() {
        InstanceStack iStack = new InstanceStack();
        assertEquals("InstanceStack constructor should set path to base", "/*[0]", iStack.getPath());
        TestInstance ti = new TestInstance();
        iStack.pushInstance(ti, ti.getDescriptor());
        iStack.popInstance(ti);
        assertEquals("Popping to top of stack should increment index", "/*[1]", iStack.getPath());
        iStack.pushInstance(ti, ti.getDescriptor());
        iStack.popInstance(ti);
        assertEquals("Popping to top of stack should increment index", "/*[2]", iStack.getPath());
    }

    public void testMarkParentNoCurrentInstance() {
        InstanceStack iStack = new InstanceStack();
        assertEquals("InstanceStack constructor should set path to base", "/*[0]", iStack.getPath());
        TestInstance parent = new TestInstance("parentBase");
        iStack.markParent(parent);
        assertEquals("Marking parent should set path to the parent's path", "parentBase", iStack.getPath());
        iStack.clearParent(parent);
        assertEquals("Clearing parent should reset path to original base path", "/*[0]", iStack.getPath());
    }

    public void testMarkParentMultipleTimes() {
        InstanceStack iStack = new InstanceStack();
        assertEquals("InstanceStack constructor should set path to base", "/*[0]", iStack.getPath());
        TestInstance parent = new TestInstance("parent");
        iStack.markParent(parent);
        assertEquals("Marking parent should set path to the parent's path", "parent", iStack.getPath());
        iStack.markParent(parent);
        assertEquals("Marking additional parent should not update path", "parent", iStack.getPath());
        iStack.clearParent(parent);
        assertEquals("parent", iStack.getPath());
        iStack.clearParent(parent);
        assertEquals("Clearing both parents should reset path to original base path", "/*[0]", iStack.getPath());
    }

    public void testErrorWrongParent() {
        // Mark a new parent without clearing the first
        InstanceStack iStack = new InstanceStack();
        iStack.markParent(new TestInstance("parent"));
        try {
            iStack.markParent(new TestInstance("different parent"));
            fail("Expected error when marking parent that's different than the current instance");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "Don't know how to handle setAttribute here");
        }

        // Clear an instance that hasn't been marked as a parent
        iStack = new InstanceStack();
        iStack.markParent(new TestInstance("parent"));
        try {
            iStack.clearParent(new TestInstance("different parent"));
            fail("Expected error when clearing parent that's different than the current instance");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched clear parent");
        }
    }

    public void testErrorPushPopDifferentInstances() {
        InstanceStack iStack = new InstanceStack();
        TestInstance ti = new TestInstance("instance1");
        iStack.pushInstance(ti, ti.getDescriptor());
        try {
            iStack.popInstance(new TestInstance("instance2"));
            fail("Expected error when trying to pop different instance than previously pushed");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched instance pop");
        }
    }

    public void testErrorSetAttributeNameWithoutClearing() {
        InstanceStack iStack = new InstanceStack();
        TestInstance ti = new TestInstance("instance");
        iStack.pushInstance(ti, ti.getDescriptor());
        iStack.setAttributeName("first");
        try {
            iStack.setAttributeName("second");
            fail("Expected error when setting second attribute without clearing first");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "Setting name illegally");
        }
    }

    public void testErrorSetIndexWithoutAttributeSet() {
        InstanceStack iStack = new InstanceStack();
        TestInstance ti = new TestInstance("instance");
        iStack.pushInstance(ti, ti.getDescriptor());
        try {
            iStack.setAttributeIndex(1);
            fail("Expected error when setting attribute index without setting attribute name first");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "no name when index set");
        }
    }

    public void testErrorClearIndexWithoutSettingIndex() {
        InstanceStack iStack = new InstanceStack();
        TestInstance ti = new TestInstance();
        iStack.pushInstance(ti, ti.getDescriptor());
        iStack.setAttributeName("attribute");
        try {
            iStack.clearAttributeIndex(1);
            fail("Expected error when clearing attribute index before setting an index");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "mismatched clearAttributeIndex");
        }
    }

    public void testErrorClearIndexWhileDifferentIndexSet() {
        InstanceStack iStack = new InstanceStack();
        TestInstance ti = new TestInstance();
        iStack.pushInstance(ti, ti.getDescriptor());
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
        InstanceStack iStack = new InstanceStack();
        TestInstance ti = new TestInstance();
        iStack.pushInstance(ti, ti.getDescriptor());
        iStack.setAttributeName("attribute");
        iStack.setAttributeIndex(42);
        try {
            iStack.setAttributeIndex(43);
            fail("Expected error when setting a new attribute index without clearing previous one");
        } catch (Exception expected) {
            assertExceptionMessage(expected, AuraRuntimeException.class, "missing clearAttributeIndex");
        }
    }

    private BaseComponent<?, ?> getComponentWithPath(final String path) {
        BaseComponent<?, ?> comp = Mockito.mock(BaseComponent.class);
        Mockito.when(comp.getPath()).thenReturn(path);
        Mockito.when(comp.hasLocalDependencies()).thenReturn(true);
        return comp;
    }

    public void testComponents() {
        InstanceStack iStack = new InstanceStack();

        Map<String, BaseComponent<?, ?>> comps = iStack.getComponents();
        assertNotNull("Components should never be null", comps);
        assertEquals("Components should empty", 0, comps.size());

        BaseComponent<?, ?> x = getComponentWithPath("a");
        iStack.registerComponent(x);
        comps = iStack.getComponents();
        assertNotNull("Components should never be null", comps);
        assertEquals("Components should have one component", 1, comps.size());
        assertEquals("Components should have x", x, comps.get("a"));

        BaseComponent<?, ?> y = getComponentWithPath("b");
        iStack.registerComponent(y);
        comps = iStack.getComponents();
        assertNotNull("Components should never be null", comps);
        assertEquals("Components should have two components", 2, comps.size());
        assertEquals("Components should have x", x, comps.get("a"));
        assertEquals("Components should have y", y, comps.get("b"));
    }

    public void testNextId() {
        InstanceStack iStack = new InstanceStack();
        assertEquals("nextId should be initialized to 1", 1, iStack.getNextId());
        assertEquals("nextId should increment", 2, iStack.getNextId());
        assertEquals("nextId should increment again", 3, iStack.getNextId());
    }

    /**
     * Verify registered components are serialized in alphabetical order
     */
    public void testSerializeAsPart() throws Exception {
        InstanceStack iStack = new InstanceStack();

        Json jsonMock = Mockito.mock(Json.class);
        BaseComponent<?, ?> a = getComponentWithPath("a");
        BaseComponent<?, ?> b = getComponentWithPath("b");
        BaseComponent<?, ?> c = getComponentWithPath("c");
        iStack.registerComponent(b);
        iStack.registerComponent(c);
        iStack.registerComponent(a);
        iStack.serializeAsPart(jsonMock);

        List<BaseComponent<?, ?>> sorted = Lists.newArrayList();
        sorted.add(a);
        sorted.add(b);
        sorted.add(c);
        verify(jsonMock).writeMapKey("components");
        verify(jsonMock).writeArray(sorted);
    }

    /**
     * Verify nothing serialized if no registered components
     */
    public void testSerializeAsPartNoComponents() throws Exception {
        InstanceStack iStack = new InstanceStack();
        Json jsonMock = Mockito.mock(Json.class);
        iStack.serializeAsPart(jsonMock);
        assertEquals("Components should empty when no registered components", 0, iStack.getComponents().size());
        verifyZeroInteractions(jsonMock);
    }

    public void testPrivileged() throws Exception {
    	//setting up 
    	String namespace_Priv = "previlege";
    	String namespace_UnPriv = "unprevilege";
    	String name1 = "one";
    	String name2 = "two";
    	String name3 = "three";
    	String name4 = "four";
    	Mockito.when(mci.isPrivilegedNamespace(namespace_Priv)).thenReturn(true);
    	Mockito.when(mci.isPrivilegedNamespace(namespace_UnPriv)).thenReturn(false);
    	//create empty stack, sanity check
        InstanceStack iStack = new InstanceStack();
        assertFalse("stack should has topUnprivileged=null at the beginning", iStack.isUnprivileged());
        //start pushing
        TestInstance one = new TestInstance(namespace_Priv,name1);
        iStack.pushInstance(one, one.getDescriptor());
        assertFalse("topUnprivileged is still null after pushing in one previleged instance:instance1", iStack.isUnprivileged());
        TestInstance two = new TestInstance(namespace_UnPriv,name2);
        iStack.pushInstance(two, two.getDescriptor());
        assertTrue("topUnprivileged should become first unprivilege instance:instance2", iStack.isUnprivileged());
        TestInstance three = new TestInstance(namespace_Priv,name3);
        iStack.pushInstance(three, three.getDescriptor());
        assertTrue("topUnprivileged should remain unchanged after pushing in a new privilege instance:instance3", iStack.isUnprivileged());
        TestInstance four = new TestInstance(namespace_UnPriv,name4);
        iStack.pushInstance(four, four.getDescriptor());
        assertTrue("topUnprivileged should be unchanged after pushing in a new unprivilege instance:instance4", iStack.isUnprivileged());
        //start poping
        iStack.popInstance(four);
        assertTrue("topUnprivileged should be unchanged after poping out unprivilege instance:instance4", iStack.isUnprivileged());
        iStack.popInstance(three);
        assertTrue("topUnprivileged should be unchanged after poping out privilege instance:instance3", iStack.isUnprivileged());
        iStack.popInstance(two);
        assertFalse("topUnprivileged should become null after poping out first unprivilege instance:instance2", iStack.isUnprivileged());
        iStack.popInstance(one);
        assertFalse("topUnprivileged should be unchanged(null) after poping out instance1", iStack.isUnprivileged());
    }

    private ConfigAdapter mci;
}

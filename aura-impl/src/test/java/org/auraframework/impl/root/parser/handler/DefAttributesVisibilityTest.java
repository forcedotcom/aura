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
package org.auraframework.impl.root.parser.handler;

import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

import com.google.common.collect.Sets;

public abstract class DefAttributesVisibilityTest extends AuraImplTestCase {
    protected Set<String> expectedAttrsInPrivilegedNS;
    protected Set<String> expectedAttrsInCustomNS;
    protected XMLHandler<?> defHandler;
    private static AtomicLong counter = new AtomicLong();

    public DefAttributesVisibilityTest(String name){
        super(name);
    }

    public void testVerifyAttributesVisibleInPrivilegedNamespace()throws Exception{
        defHandler = getHandler(false);
        compareExpectedWithActual(expectedAttrsInPrivilegedNS, defHandler);
    }

    public void testVerifyAttributesVisibleInCustomNamespace() throws Exception{
        defHandler = getHandler(true);
        compareExpectedWithActual(expectedAttrsInCustomNS, defHandler);
    }

    abstract XMLHandler<?> getHandler(boolean b) throws DefinitionNotFoundException;
    private static void compareExpectedWithActual(Set<String> expected, XMLHandler<?> defHandler)throws Exception{
        Set<String> actualAttributes=null;
        if (defHandler != null) {
            actualAttributes = defHandler.getAllowedAttributes();
        }else{
            fail("Specified an invalid DefHandler: null object");
        }
        Set<String> expectedButAbsent = Sets.newHashSet(expected);
        expectedButAbsent.removeAll(actualAttributes);

        Set<String> notExpectedButPresent = Sets.newHashSet(actualAttributes);
        notExpectedButPresent.removeAll(expected);

        assertTrue("Expected attributes but not allowed "+ expectedButAbsent+
                "\n Not expected attributes but allowed "+ notExpectedButPresent, expectedButAbsent.isEmpty()&&notExpectedButPresent.isEmpty());
    }

    static abstract class RootDefAttributesVisibilityTest extends DefAttributesVisibilityTest{
        Class<? extends RootDefinition> clazz;
        public RootDefAttributesVisibilityTest(String name){
            super(name);
        }
        @Override
        XMLHandler<?> getHandler(boolean b)throws DefinitionNotFoundException{
            return getHandler(b, clazz);
        }
        @SuppressWarnings("unchecked")
        private static <T extends Definition> ContainerTagHandler<?> getHandler(boolean isCustomNamespace, Class<T> clazz) throws DefinitionNotFoundException{
            DefDescriptor<T> desc = Aura.getDefinitionService().getDefDescriptor(
                    String.format("%s:%s", (isCustomNamespace?StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE:StringSourceLoader.DEFAULT_NAMESPACE),
                            "stringResource"+counter),
                            clazz);
            return RootTagHandlerFactory.newInstance((DefDescriptor<RootDefinition>)desc, null, null);
        }
    }
    public static class ApplicationDefAttributesVisibilityTest extends RootDefAttributesVisibilityTest {
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("access", "description", "implements", "useAppcache", "controller", "model", "apiVersion");
            expectedAttrsInPrivilegedNS = Sets.newHashSet("preload", "layouts", "locationChangeEvent", "additionalAppCacheURLs", "isOnePageApp",
                    "theme", "render", "template", "provider", "abstract", "extensible", "isTemplate", "extends",
                    "style", "helper", "renderer", "whitespace", "support");
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
            clazz = ApplicationDef.class;
        }
        public ApplicationDefAttributesVisibilityTest(String name) {
            super(name);
        }
    }
    public static class ComponentDefAttributesVisibilityTest extends RootDefAttributesVisibilityTest{
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("access", "description", "implements", "controller", "model", "apiVersion");
            expectedAttrsInPrivilegedNS = Sets.newHashSet("render", "template", "provider", "abstract", "extensible", "isTemplate", "extends",
                    "style", "helper", "renderer", "whitespace", "support");
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
            clazz = ComponentDef.class;
        }
        public ComponentDefAttributesVisibilityTest(String name) {
            super(name);
        }
    }
    public static class EventDefAttributesVisibilityTest extends RootDefAttributesVisibilityTest{
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("access", "description", "extends", "type", "apiVersion");
            expectedAttrsInPrivilegedNS = Sets.newHashSet("support");
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
            clazz = EventDef.class;
        }
        public EventDefAttributesVisibilityTest(String name) {
            super(name);
        }
    }
    public static class InterfaceDefAttributesVisibilityTest extends RootDefAttributesVisibilityTest{
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("access", "description", "extends", "apiVersion");
            expectedAttrsInPrivilegedNS = Sets.newHashSet("support", "provider");
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
            clazz = InterfaceDef.class;
        }
        public InterfaceDefAttributesVisibilityTest(String name) {
            super(name);
        }
    }

    public static class AttributeDefAttributesVisibilityTest extends DefAttributesVisibilityTest{
        public AttributeDefAttributesVisibilityTest(String name){
            super(name);
        }
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("access", "default", "description", "name", "required", "type");
            expectedAttrsInPrivilegedNS = Sets.newHashSet("serializeTo", "visibility");//TODO support?
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
        }
        @Override
        @SuppressWarnings("unchecked")
        XMLHandler<?> getHandler(boolean isCustomNamespace) throws DefinitionNotFoundException{
            return new AttributeDefHandler<ApplicationDef>(
                    (RootTagHandler<ApplicationDef>)RootDefAttributesVisibilityTest.getHandler(isCustomNamespace, ApplicationDef.class),
                    null,
                    null);
        }
    }
    public static class RegisterEventDefAttributesVisibilityTest extends DefAttributesVisibilityTest{
        public RegisterEventDefAttributesVisibilityTest(String name){
            super(name);
        }
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("access", "description", "name", "type");
            expectedAttrsInPrivilegedNS = Sets.newHashSet();
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
        }
        @Override
        public void testVerifyAttributesVisibleInCustomNamespace() throws Exception{
            //Nothing to verify, no special behavior based on namespace
        }
        @Override
        XMLHandler<?> getHandler(boolean b) throws DefinitionNotFoundException {
            return new RegisterEventHandler<RootDefinition>();
        }
    }
    public static class AttributeDefRefAttributesVisibilityTest extends DefAttributesVisibilityTest{
        public AttributeDefRefAttributesVisibilityTest(String name){
            super(name);
        }
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("attribute", "value");
            expectedAttrsInPrivilegedNS = Sets.newHashSet();
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
        }
        @Override
        @SuppressWarnings("unchecked")
        XMLHandler<?> getHandler(boolean isCustomNamespace) throws DefinitionNotFoundException{
            return new AttributeDefRefHandler<ApplicationDef>(
                    (RootTagHandler<ApplicationDef>)RootDefAttributesVisibilityTest.getHandler(isCustomNamespace, ApplicationDef.class),
                    null,
                    null);
        }
    }
    public static class EventHandlerDefAttributesVisibilityTest extends DefAttributesVisibilityTest{
        public EventHandlerDefAttributesVisibilityTest(String name){
            super(name);
        }
        @Override
        public void setUp() throws Exception {
            super.setUp();
            expectedAttrsInCustomNS = Sets.newHashSet("action", "description", "event", "name", "value");
            expectedAttrsInPrivilegedNS = Sets.newHashSet();
            expectedAttrsInPrivilegedNS.addAll(expectedAttrsInCustomNS);
        }
        @Override
        @SuppressWarnings("unchecked")
        XMLHandler<?> getHandler(boolean isCustomNamespace) throws DefinitionNotFoundException{
            return new EventHandlerDefHandler(
                    (RootTagHandler<ApplicationDef>)RootDefAttributesVisibilityTest.getHandler(isCustomNamespace, ApplicationDef.class),
                    null,
                    null);
        }
    }
}

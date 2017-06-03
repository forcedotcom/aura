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
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.junit.Before;
import org.junit.Test;

import javax.inject.Inject;

import com.google.common.collect.Sets;

public abstract class DefAttributesVisibilityTest extends AuraImplTestCase {
    protected Set<String> publicAttrs;
    protected Set<String> internalAttrs;
    protected Set<String> publicAndInternalAttrs;

    @Inject
    StringSourceLoader loader;

    @Inject
    DefinitionParserAdapter definitionParserAdapter;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        publicAndInternalAttrs = Sets.newHashSet(internalAttrs);
        publicAndInternalAttrs.addAll(publicAttrs);
    }

    protected <D extends Definition> DefDescriptor<D> getDescriptor(boolean internal, Class<D> clazz) {
        String prefix;

        if (internal) {
            prefix = StringSourceLoader.DEFAULT_NAMESPACE + ":";
        } else {
            prefix = StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":";
        }
        return loader.createStringSourceDescriptor(prefix, clazz, null);
    }

    protected abstract XMLHandler<?> getHandler(boolean internal);

    @Test
    public void testAttributeSettings() throws Exception {
        Set<String> intersect = Sets.intersection(publicAttrs, internalAttrs);
        assertTrue("Internal and private sets must not intersect" + intersect, intersect.size() == 0);
    }

	@Test
    public void testInternalAttributeSet() throws Exception {
        compareExpectedWithActual(publicAndInternalAttrs, getHandler(true));
    }
	
	@Test
    public void testNonInternalAttributeSet() throws Exception {
        compareExpectedWithActual(publicAttrs, getHandler(false));
    }

    public static class ApplicationDefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("access", "description", "implements", "useAppcache",
                        "additionalAppCacheURLs", "controller", "model", "apiVersion", "abstract", "extensible",
                        "extends", "template");
            internalAttrs = Sets.newHashSet("preload", "track", "locationChangeEvent",
                    "render", "provider", "style", "helper", "renderer", "services",
                    "support", "flavorOverrides", "defaultFlavor", "dynamicallyFlavorable", "bootstrapPublicCacheExpiration", "tokens");
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            return new ApplicationDefHandler(getDescriptor(internal, ApplicationDef.class), null, null, internal,
                    definitionService, contextService, configAdapter, definitionParserAdapter);
        }
    }

    public static class ComponentDefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("access", "description", "implements", "controller",
                    "model", "apiVersion", "abstract", "extensible", "extends", "isTemplate");
            internalAttrs = Sets.newHashSet("render", "template", "provider", "style", "helper",
                    "renderer", "support", "defaultFlavor",
                    "dynamicallyFlavorable");
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            return new ComponentDefHandler(getDescriptor(internal, ComponentDef.class), null, null, internal,
                    definitionService, contextService, configAdapter, definitionParserAdapter);
        }
    }

    public static class EventDefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("access", "description", "extends", "type", "apiVersion");
            internalAttrs = Sets.newHashSet("support");
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            return new EventDefHandler(getDescriptor(internal, EventDef.class), null, null, internal,
                    definitionService, configAdapter, definitionParserAdapter);
        }
    }

    public static class InterfaceDefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("access", "description", "extends", "apiVersion");
            internalAttrs = Sets.newHashSet("support");
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            return new InterfaceDefHandler(getDescriptor(internal, InterfaceDef.class), null, null, internal,
                    definitionService, contextService, configAdapter, definitionParserAdapter);
        }
    }

    public static class AttributeDefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("access", "default", "description", "name", "required", "type");
            internalAttrs = Sets.newHashSet("serializeTo");
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            ApplicationDefHandler parentHandler;
            parentHandler = new ApplicationDefHandler(getDescriptor(internal, ApplicationDef.class), null, null,
                    internal, definitionService, contextService, configAdapter, definitionParserAdapter);
            return new AttributeDefHandler<>(parentHandler, null, null, internal, definitionService, configAdapter,
                    definitionParserAdapter);
        }
    }

    public static class RegisterEventAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("access", "description", "name", "type");
            internalAttrs = Sets.newHashSet();
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            ApplicationDefHandler parentHandler;
            parentHandler = new ApplicationDefHandler(getDescriptor(internal, ApplicationDef.class), null, null,
                    internal, definitionService, contextService, configAdapter, definitionParserAdapter);
            return new RegisterEventHandler<>(parentHandler, null, null, internal, definitionService, configAdapter,
                    definitionParserAdapter);
        }
    }

    public static class AttributeDefRefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("attribute", "value");
            internalAttrs = Sets.newHashSet();
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            ApplicationDefHandler parentHandler;
            parentHandler = new ApplicationDefHandler(getDescriptor(internal, ApplicationDef.class), null, null,
                    internal, definitionService, contextService, configAdapter, definitionParserAdapter);
            return new AttributeDefRefHandler<>(parentHandler, null, null, internal, definitionService,
                    configAdapter, definitionParserAdapter);
        }
    }

    public static class EventHandlerDefAttributesVisibilityTest extends DefAttributesVisibilityTest {
        @Override
        @Before
        public void setUp() throws Exception {
            publicAttrs = Sets.newHashSet("action", "description", "event", "name", "value", "phase", "includeFacets");
            internalAttrs = Sets.newHashSet();
            super.setUp();
        }

        @Override
        protected XMLHandler<?> getHandler(boolean internal) {
            ApplicationDefHandler parentHandler;
            parentHandler = new ApplicationDefHandler(getDescriptor(internal, ApplicationDef.class), null, null,
                    internal, definitionService, contextService, configAdapter, definitionParserAdapter);
            return new EventHandlerDefHandler(parentHandler, null, null, definitionService);
        }
    }

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
                "\n Not expected attributes but allowed "+ notExpectedButPresent,
                expectedButAbsent.isEmpty()&&notExpectedButPresent.isEmpty());
    }
}

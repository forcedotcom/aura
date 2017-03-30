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
package org.auraframework.impl.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionServiceImpl;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.Location;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.Source;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@ThreadHostileTest("we are out of line with caches here")
public class DefinitionServiceImplUnitTest extends AuraImplTestCase {

    @Inject
    private CachingService cachingService;

    @Mock
    private ConfigAdapter configAdapter;

    @Mock
    private LoggingService loggingService;

    @Mock
    Definition globalDef;

    @Mock
    DefinitionAccess defAccess;
    @Mock
    DefDescriptor<ComponentDef> referencingDesc;

    @Mock
    Cache<String, String> mockAccessCheckCache;

    @Mock
    ContextService contextService;

    private MockRegistrySet registries = new MockRegistrySet();

    @Mock
    DefRegistry registry1;

    @Mock
    DefRegistry registry2;
    
    private AuraContext setupContext(DefinitionService service, Mode mode, Authentication access) {
        AuraContext context = new AuraContextImpl(mode, registries,
                null /* defaultPrefixes */,
                Format.JSON, access,
                null /* jsonContext */,
                null /* globalProviders */,
                configAdapter,
                service,
                null /* testContextAdapter */);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        return context;
    }

    /**
     * setupContext for definitionSercie passed in, mode=DEV, authentication=AUTHENTICATED
     * @param service
     * @return
     */
    private AuraContext setupContext(DefinitionService service) {
        return setupContext(service, Mode.DEV, Authentication.AUTHENTICATED);
    }
    
    /**
     * create new DefinitionServiceImpl instance with mocked cachingService, contextService, configAdapter and loggingService
     * @return definitionService
     */
    private DefinitionService createDefinitionServiceWithMocks() {
        DefinitionServiceImpl definitionService = new DefinitionServiceImpl();
        definitionService.setCachingService(cachingService);
        definitionService.setContextService(contextService);
        definitionService.setConfigAdapter(configAdapter);
        definitionService.setLoggingService(loggingService);
        return definitionService;
    }

    /**
     * add defDescriptor desc to defRegistry reg, when we call reg.getDef(desc), it will return definition
     * @param desc
     * @param reg
     * @param definition
     * @throws Exception
     */
    private <T extends Definition> void setupMockRegistryFor(DefDescriptor<T> desc, DefRegistry reg, T definition)
            throws Exception {
        registries.addRegistryFor(desc, reg);
        Mockito.when(reg.getDef(desc)).thenReturn(definition);
    }

    private final String NAMESPACE = getClass().getSimpleName()+System.currentTimeMillis();
    private final AtomicInteger counter = new AtomicInteger(1);

    private String getUniqueNamespace() {
        return getClass().getSimpleName() + System.currentTimeMillis() + "_" + counter.getAndIncrement();
    }

    /**
     * Get a mocked descriptor, type=Action, name=test_Counter, namespace=thisClassName+timeStamp, qualifiedName="bah://namespace:name"
     *
     * @return mocked descriptor
     */
    private DefDescriptor<Definition> getMockDescriptor() {
        String name = "test_"+counter.getAndIncrement();

        @SuppressWarnings("unchecked")
        DefDescriptor<Definition> descriptor = Mockito.mock(DefDescriptor.class);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.ACTION);
        Mockito.when(descriptor.getName()).thenReturn(name);
        Mockito.when(descriptor.getNamespace()).thenReturn(NAMESPACE);
        Mockito.when(descriptor.getQualifiedName()).thenReturn("bah://"+NAMESPACE+":"+name);
        return descriptor;
    }

// <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass);
// <T extends Definition, B extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass, DefDescriptor<B> bundle);
// <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix, Class<T> defClass);
// DefDescriptor<?> getDefDescriptor(String prefix, String namespace, String name, DefType defType);

// <T extends Definition> T getDefinition(DefDescriptor<T> descriptor) throws DefinitionNotFoundException, QuickFixException;
    @Test
    public void testGetDefinitionReturnsNullForNull() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        assertNull(definitionService.getDefinition(null));
    }

    //verify validateDefinition and validateReferences are called once during getDefinition
    @Test
    public void testGetDefinitionLinksSimpleDef() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = Mockito.spy(new MockDefinition(descriptor));
        setupMockRegistryFor(descriptor, registry1, definition);
        assertEquals(definition, definitionService.getDefinition(descriptor));
        Mockito.verify(definition, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition, Mockito.times(1)).validateReferences();
    }

    @Test
    public void testGetDefinitionFailsOnValidateDefError() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = Mockito.spy(new MockDefinition(descriptor));

        Mockito.doThrow(expected).when(definition).validateDefinition();
        setupMockRegistryFor(descriptor, registry1, definition);
        Exception actual = null;

        try {
            definitionService.getDefinition(descriptor);
        } catch (QuickFixException e) {
            actual = e;
        }
        assertEquals(expected, actual);
        Mockito.verify(definition, Mockito.times(1)).validateDefinition();
    }

    @Test
    public void testGetDefinitionFailsOnValidateRefsError() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = Mockito.spy(new MockDefinition(descriptor));

        Mockito.doThrow(expected).when(definition).validateReferences();
        setupMockRegistryFor(descriptor, registry1, definition);
        Exception actual = null;

        try {
            definitionService.getDefinition(descriptor);
        } catch (QuickFixException e) {
            actual = e;
        }
        assertEquals(expected, actual);
        Mockito.verify(definition, Mockito.times(1)).validateDefinition();
    }

    @Test
    public void testGetDefinitionLinksLoopedDefs() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        DefDescriptor<Definition> descriptor2 = getMockDescriptor();
        MockDefinition unmocked2 = new MockDefinition(descriptor2);
        unmocked1.addDependency(descriptor2);
        unmocked2.addDependency(descriptor1);
        Definition definition1 = Mockito.spy(unmocked1);
        Definition definition2 = Mockito.spy(unmocked2);
        setupMockRegistryFor(descriptor1, registry1, definition1);
        setupMockRegistryFor(descriptor2, registry1, definition2);
        assertEquals(definition1, definitionService.getDefinition(descriptor1));
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(1)).validateReferences();
        Mockito.verify(definition1, Mockito.times(1)).markValid();
        Mockito.verify(definition2, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition2, Mockito.times(1)).validateReferences();
        Mockito.verify(definition2, Mockito.times(1)).markValid();
    }

    @Test
    public void testGetDefinitionFailsOnDependencyValidateDefinitionError() throws Exception {
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        DefDescriptor<Definition> descriptor2 = getMockDescriptor();
        MockDefinition unmocked2 = new MockDefinition(descriptor2);
        unmocked1.addDependency(descriptor2);
        Definition definition1 = Mockito.spy(unmocked1);
        Definition definition2 = Mockito.spy(unmocked2);
        Mockito.doThrow(expected).when(definition2).validateDefinition();
        setupMockRegistryFor(descriptor1, registry1, definition1);
        setupMockRegistryFor(descriptor2, registry1, definition2);

        QuickFixException actual = null;
        try {
            definitionService.getDefinition(descriptor1);
        } catch (QuickFixException e) {
            actual = e;
        }
        assertEquals(expected, actual);

        //
        // When we fail due to an error we should call validateDefinition(), but no validateReferences()
        //
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences();
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition2, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition2, Mockito.times(0)).validateReferences();
        Mockito.verify(definition2, Mockito.times(0)).markValid();
    }

    @Test
    public void testGetDefinitionFailsOnDependencyValidateReferencesError() throws Exception {
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        DefDescriptor<Definition> descriptor2 = getMockDescriptor();
        MockDefinition unmocked2 = new MockDefinition(descriptor2);
        unmocked1.addDependency(descriptor2);
        Definition definition1 = Mockito.spy(unmocked1);
        Definition definition2 = Mockito.spy(unmocked2);
        Mockito.doThrow(expected).when(definition2).validateReferences();
        setupMockRegistryFor(descriptor1, registry1, definition1);
        setupMockRegistryFor(descriptor2, registry1, definition2);

        QuickFixException actual = null;
        try {
            definitionService.getDefinition(descriptor1);
        } catch (QuickFixException e) {
            actual = e;
        }
        assertEquals(expected, actual);

        //
        // When we fail due to an error we should call validateDefinition(), but no validateReferences()
        //
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        //Mockito.verify(definition1, Mockito.times(0)).validateReferences(); - no guarantee
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition2, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition2, Mockito.times(1)).validateReferences();
        Mockito.verify(definition2, Mockito.times(0)).markValid();
    }

//<T extends Definition> T getDefinition(String qualifiedName, Class<T> defType) throws DefinitionNotFoundException, QuickFixException; - FIXME

//<D extends Definition> D getUnlinkedDefinition(DefDescriptor<D> descriptor) throws QuickFixException;

    /**
     * Test for get 'unlinked'.
     *
     * This test ensures that we can actually get an unlinked def that has dependencies, and that nothing happens
     * with the dependencies.
     */
    @Test
    public void testGetUnlinkedDefinitionWithDependencies() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        DefDescriptor<Definition> descriptor2 = getMockDescriptor();
        unmocked1.addDependency(descriptor2);
        Definition definition1 = Mockito.spy(unmocked1);
        setupMockRegistryFor(descriptor1, registry1, definition1);
        assertEquals(definition1, definitionService.getUnlinkedDefinition(descriptor1));
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences();
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition1, Mockito.times(0)).appendDependencies(Mockito.any());
    }

    @Test
    public void testGetUnlinkedDefinitionValidateDefinitionFailure() throws Exception {
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        DefDescriptor<Definition> descriptor2 = getMockDescriptor();
        unmocked1.addDependency(descriptor2);
        Definition definition1 = Mockito.spy(unmocked1);
        setupMockRegistryFor(descriptor1, registry1, definition1);
        Mockito.doThrow(expected).when(definition1).validateDefinition();

        QuickFixException actual = null;
        try {
            definitionService.getUnlinkedDefinition(descriptor1);
        } catch (QuickFixException e) {
            actual = e;
        }

        assertEquals(expected, actual);
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences();
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition1, Mockito.times(0)).appendDependencies(Mockito.any());
    }

    @Test
    public void testGetUnlinkedDefinitionFromLocalCache() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        AuraContext context = setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        Definition definition1 = Mockito.spy(unmocked1);
        setupMockRegistryFor(descriptor1, registry1, definition1);
        context.addLocalDef(descriptor1, definition1);

        assertEquals(definition1, definitionService.getUnlinkedDefinition(descriptor1));
        Mockito.verify(definition1, Mockito.times(0)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences();
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition1, Mockito.times(0)).appendDependencies(Mockito.any());
    }

//<D extends Definition> boolean exists(DefDescriptor<D> descriptor);
    @Test
    public void testExistsFromRegistry() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        Definition definition1 = Mockito.spy(unmocked1);
        Mockito.when(registry1.exists(descriptor1)).thenReturn(true);
        setupMockRegistryFor(descriptor1, registry1, definition1);

        assertEquals(true, definitionService.exists(descriptor1));
        Mockito.verify(registry1, Mockito.times(1)).exists(descriptor1);
    }

    @Test
    public void testExistsFromLocalDefCache() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        AuraContext context = setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        Definition definition1 = Mockito.spy(unmocked1);
        setupMockRegistryFor(descriptor1, registry1, definition1);
        context.addLocalDef(descriptor1, definition1);

        assertEquals(true, definitionService.exists(descriptor1));
        Mockito.verify(registry1, Mockito.times(0)).exists(descriptor1);
    }

//<D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor);
    @Test
    public void testSourceFromRegistry() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        @SuppressWarnings("unchecked")
        Source<Definition> source = Mockito.mock(Source.class);
        Definition definition1 = Mockito.spy(unmocked1);
        Mockito.when(registry1.getSource(descriptor1)).thenReturn(source);
        setupMockRegistryFor(descriptor1, registry1, definition1);

        assertEquals(source, definitionService.getSource(descriptor1));
        Mockito.verify(registry1, Mockito.times(1)).getSource(descriptor1);
    }

    @Test
    public void testSourceWithNoRegistry() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        assertEquals(null, definitionService.getSource(descriptor1));
    }

//Set<DefDescriptor<?>> find(DescriptorFilter matcher);
    @Test
    public void testFindCallsRegistryWithWildcard() throws Exception {
        String namespace = getUniqueNamespace();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://*:*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        assertNull("Wildcards should not be cached", cachingService.getDescriptorFilterCache().getIfPresent(cacheKey));
    }

    @Test
    public void testFindCallsRegistryWithNamespace() throws Exception {
        String namespace = getUniqueNamespace();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespace+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.find(Mockito.any())).thenReturn(Sets.newHashSet());
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        assertNull("Namespaces should be cached", cachingService.getDescriptorFilterCache().getIfPresent(cacheKey));
    }

    @Test
    public void testFindCallsRegistryWithNamespaceAndCachesWhenCacheable() throws Exception {
        String namespace = getUniqueNamespace();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespace+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.isCacheable()).thenReturn(true);
        Mockito.when(registry1.find(Mockito.any())).thenReturn(Sets.newHashSet());
        Mockito.when(configAdapter.isCacheable(Mockito.any())).thenReturn(true);
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        assertSame("Namespaces should be cached", registry1.find(filter),
            cachingService.getDescriptorFilterCache().getIfPresent(cacheKey));
    }

    @Test
    public void testFindCallsRegistryWithNamespaceMismatchCase() throws Exception {
        String namespace = getUniqueNamespace();
        String namespaceMismatch = namespace.toUpperCase();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespaceMismatch+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.find(Mockito.any())).thenReturn(Sets.newHashSet());
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        assertNull("Namespaces not should be cached when not cacheable",
                cachingService.getDescriptorFilterCache().getIfPresent(cacheKey));
    }

    @Test
    public void testFindCallsRegistryWithNamespaceMismatchCaseAndCaches() throws Exception {
        String namespace = getUniqueNamespace();
        String namespaceMismatch = namespace.toUpperCase();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespaceMismatch+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.find(Mockito.any())).thenReturn(Sets.newHashSet());
        Mockito.when(registry1.isCacheable()).thenReturn(true);
        Mockito.when(configAdapter.isCacheable(Mockito.any())).thenReturn(true);
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        assertSame("Namespaces should be cached when cacheable", registry1.find(filter),
                cachingService.getDescriptorFilterCache().getIfPresent(cacheKey));
    }

    @Test
    public void testFindCallsRegistryWithNamespaceForTestCase() throws Exception {
        String namespace = getUniqueNamespace();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespace+":*", DefType.TESTCASE);
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.find(Mockito.any())).thenReturn(Sets.newHashSet());
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        assertNull("Namespaces should be cached", cachingService.getDescriptorFilterCache().getIfPresent(cacheKey));
    }
    
    
    /*
     public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor)
     public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def)
     public boolean hasAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor)
     public <D extends Definition> boolean hasAccess(DefDescriptor<?> referencingDescriptor, D def)
     */  
    @Test
    public void testHasAccessWithNullDef() throws QuickFixException {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	DefDescriptor<Definition> descriptor = getMockDescriptor();
    	boolean res = definitionService.hasAccess(descriptor, (Definition)null);
    	assertTrue("hasAccess on null definitation should return true", res);
    }
    
    @Test
    public void testHasAccessWithDefNoAccessDeclaration() throws QuickFixException {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	DefDescriptor<Definition> descriptor = getMockDescriptor();
    	Definition definition = new MockDefinition(descriptor, null);
    	try {
    		definitionService.hasAccess(descriptor, definition);
    		fail("we should throw RuntimeException when definition miss access declaration");
    	} catch (Exception e) {
    		assertExceptionMessageStartsWith(e, RuntimeException.class, "Missing access declaration for");
    	}
    }
    
    @Test
    public void testHasAcessWithDefGlobalAccess() throws QuickFixException {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	DefDescriptor<Definition> descriptor = getMockDescriptor();
    	Definition definition = new MockDefinition(descriptor);
    	boolean res = definitionService.hasAccess(descriptor, definition);
    	assertTrue("hasAccess on definition with access=GLOBAL should return true", res);
    }
    
    @Test
    public void testHasAcessWithDefPrivateAccess() throws QuickFixException {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	DefDescriptor<Definition> descriptor = getMockDescriptor();
    	Definition definition = new MockDefinition(descriptor, AuraContext.Access.PRIVATE);
    	boolean res = definitionService.hasAccess(descriptor, definition);
    	assertTrue("hasAccess on definition with access=PRIVATE should return true only when referencingDescriptor the same as definition's descriptor", res);
    }
    
    //todo: more test on hasAccess
    
    
    /*
     public List<ClientLibraryDef> getClientLibraries(String uid)
    */
    @Test
    public void testGetClientLibrariesWithNullUid() {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	assertNull("we should return null when getting clientLibraries with null uid", definitionService.getClientLibraries(null));
    }
    
    @Test
    public void testGetClientLibraries() {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	
    	Set<DefDescriptor<? extends Definition>> dependencies = new HashSet<>();
    	List<ClientLibraryDef> clientLibraries = new ArrayList<>();
    	DependencyEntry de = new DependencyEntry("testUID", dependencies, clientLibraries);
    	AuraContext context = new AuraContextImpl(Mode.DEV, registries,
                null /* defaultPrefixes */,
                Format.JSON, Authentication.AUTHENTICATED,
                null /* jsonContext */,
                null /* globalProviders */,
                configAdapter,
                definitionService,
                null /* testContextAdapter */);
    	AuraContext mockedContext = Mockito.spy(context);
    	Mockito.when(mockedContext.getLocalDependencyEntry("testUID")).thenReturn(de);
    	Mockito.when(contextService.getCurrentContext()).thenReturn(mockedContext);    	
    	
    	assertEquals("we should return DependencyEntry's clientLibraries when getting clientLibraries with valid uid", 
    			clientLibraries, definitionService.getClientLibraries("testUID"));
    }
    
    /*
     public Set<DefDescriptor<?>> getDependencies(String uid)
     */
    @Test
    public void testGetDependenciesWithNullUid() {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	assertNull("we should return null when getting dependency with null uid", definitionService.getDependencies(null));
    }
    
    @Test
    public void testGetDependencies() {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	
    	Set<DefDescriptor<? extends Definition>> dependencies = new HashSet<>();
    	List<ClientLibraryDef> clientLibraries = new ArrayList<>();
    	DependencyEntry de = new DependencyEntry("testUID", dependencies, clientLibraries);
    	AuraContext context = new AuraContextImpl(Mode.DEV, registries,
                null /* defaultPrefixes */,
                Format.JSON, Authentication.AUTHENTICATED,
                null /* jsonContext */,
                null /* globalProviders */,
                configAdapter,
                definitionService,
                null /* testContextAdapter */);
    	AuraContext mockedContext = Mockito.spy(context);
    	Mockito.when(mockedContext.getLocalDependencyEntry("testUID")).thenReturn(de);
    	Mockito.when(contextService.getCurrentContext()).thenReturn(mockedContext);    	
    	
    	assertEquals("we should return DependencyEntry's clientLibraries when getting dependencies with valid uid", 
    			dependencies, definitionService.getDependencies("testUID"));
    }
    
    /*
     public <T extends Definition> String getUid(String uid, DefDescriptor<T> descriptor)
     */
    @Test
    public void getGetUidWithNullDescriptor() throws Exception {
    	DefinitionService definitionService = createDefinitionServiceWithMocks();
    	assertNull("we should return null when getting Uid with null descriptor", 
    			definitionService.getUid("testUID", null));
    }
    

//void updateLoaded(DefDescriptor<?> loading) throws QuickFixException, ClientOutOfSyncException;

//    private boolean isInDescriptorFilterCache(DescriptorFilter filter, Set<DefDescriptor<?>> results) throws Exception {
//        // taking the long road in determining what is in the cache because the current key implementation for
//        // the descriptor cache is difficult to recreate.
//        Cache<String, Set<DefDescriptor<?>>> cache = cachingService.getDescriptorFilterCache();
//        for (String key : cache.getKeySet()) {
//            if (key.startsWith(filter.toString() + "|")) {
//                return results.equals(cache.getIfPresent(key));
//            }
//        }
//        return false;
//    }
//
//    /**
//     * Check to ensure that a DescriptorFilter is not in the cache.
//     */
//    private boolean notInDescriptorFilterCache(DescriptorFilter filter) throws Exception {
//        Cache<String, Set<DefDescriptor<?>>> cache = cachingService.getDescriptorFilterCache();
//        for (String key : cache.getKeySet()) {
//            if (key.startsWith(filter.toString() + "|")) {
//                return false;
//            }
//        }
//        return true;
//    }
//
//    private boolean isInDepsCache(DefDescriptor<?> dd, String cacheKey) throws Exception {
//        Cache<String, ?> cache = cachingService.getDepsCache();
//        String ddKey;
//        if(dd != null) {
//            ddKey = dd.getDescriptorName().toLowerCase();
//        } else {
//            ddKey = cacheKey;
//        }
//        for (String key : cache.getKeySet()) {
//            if (key.endsWith(ddKey)) {
//                return cache.getIfPresent(key) != null;
//            }
//        }
//        return false;
//    }
//
    
    
    

    @SuppressWarnings("serial")
    private static class MockDefinition implements Definition {
        public DefDescriptor<Definition> descriptor;
        private Set<DefDescriptor<?>> localDeps;
        private DefinitionAccess access = Mockito.mock(DefinitionAccess.class);

        /**
         * set descriptor, make access=GLOBAL
         * @param descriptor
         */
        public MockDefinition(DefDescriptor<Definition> descriptor) {
            this.descriptor = descriptor;
            Mockito.when(this.access.isGlobal()).thenReturn(true);
        }
        
        public MockDefinition(DefDescriptor<Definition> descriptor, AuraContext.Access access) {
        	this.descriptor = descriptor;
        	if(access == null) {
        		this.access = null;
        	} else {
        		switch(access) {
        		case PRIVATE:
        			Mockito.when(this.access.isGlobal()).thenReturn(false);
        			Mockito.when(this.access.isPrivate()).thenReturn(true);
        			Mockito.when(this.access.requiresAuthentication()).thenReturn(true);
        			break;
        		default:
        			Mockito.when(this.access.isGlobal()).thenReturn(true);
        		}
        	}
        	
        }

        public void addDependency(DefDescriptor<?> descriptor) {
            if (localDeps == null) {
                localDeps = Sets.newHashSet(descriptor);
            } else {
                localDeps.add(descriptor);
            }
        }

        @Override
        public void serialize(Json json) throws IOException {
        }

        @Override
        public void validateDefinition() throws QuickFixException {
        }

        @Override
        public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
            if (localDeps != null) {
                dependencies.addAll(localDeps);
            }
        }

        @Override
        public void validateReferences() throws QuickFixException {
        }

        @Override
        public void markValid() {
        }

        @Override
        public boolean isValid() {
            return false;
        }

        @Override
        public String getName() {
            return null;
        }

        @Override
        public Location getLocation() {
            return null;
        }

        @Override
        public DefinitionAccess getAccess() {
            return access;
        }

        @Override
        public void retrieveLabels() throws QuickFixException {

        }

        @Override
        public String getDescription() {
            return null;
        }

        @Override
        public String getAPIVersion() {
            return null;
        }

        @Override
        public String getOwnHash() {
            return null;
        }

        @Override
        public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {

        }

        @Override
        public DefDescriptor<? extends Definition> getDescriptor() {
            return descriptor;
        }

        @Override
        public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
            return null;
        }
    }

    /**
     * Registry sets do not lend themselves to mocking, too many generics.
     */
    private static class MockRegistrySet implements RegistrySet {
        private final Map<DefDescriptor<?>,DefRegistry> registryMap = Maps.newHashMap();
        private final Map<DescriptorFilter, Collection<DefRegistry>> filterMap = Maps.newHashMap();
        private final List<DefRegistry> allRegistries = Lists.newArrayList();
        
        public void addRegistryFor(DefDescriptor<?> descriptor, DefRegistry registry) {
            registryMap.put(descriptor, registry);
            if (!allRegistries.contains(registry)) {
                allRegistries.add(registry);
            }
        }

        public void addFilterFor(DescriptorFilter matcher, Collection<DefRegistry> registries) {
            filterMap.put(matcher, registries);
            for (DefRegistry registry: registries) {
                if (!allRegistries.contains(registry)) {
                    allRegistries.add(registry);
                }
            }
        }

        public void addFilterFor(DescriptorFilter matcher, DefRegistry registry) {
            addFilterFor(matcher, Lists.newArrayList(registry));
        }


        @Override
        public Collection<DefRegistry> getAllRegistries() {
            return allRegistries;
        }

        @Override
        public Collection<DefRegistry> getRegistries(DescriptorFilter matcher) {
            return filterMap.get(matcher);
        }

        @Override
        public <T extends Definition> DefRegistry getRegistryFor(DefDescriptor<T> descriptor) {
            return registryMap.get(descriptor);
        }
    }
}

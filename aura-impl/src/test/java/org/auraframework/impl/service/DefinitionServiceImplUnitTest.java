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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.DefinitionServiceImpl;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.impl.controller.AuraGlobalControllerDefRegistry;
import org.auraframework.impl.util.mock.MockDefinition;
import org.auraframework.impl.util.mock.MockRegistrySet;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.DefinitionService.ResolverContext;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.AuraLocalStore;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * DefinitionService "almost" unit tests.
 *
 * We still use AuraContextImpl here, which we probably should mock out...
 */
public class DefinitionServiceImplUnitTest {

    @Mock
    private CachingService cachingService;

    @Mock
    private AuraGlobalControllerDefRegistry globalControllerDefRegistry;

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

    @Mock
    Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;

    @Mock
    Cache<String, DependencyEntry> depsCache;

    @Mock
    Cache<DefDescriptor<?>, Boolean> existsCache;

    @Mock
    Cache<String, Set<DefDescriptor<?>>> descriptorFilterCache;

    @Before
    public void setupMocks() {
        MockitoAnnotations.initMocks(this);
    }
    
    private AuraContext setupContext(DefinitionService service, Mode mode, Authentication access) {
        GlobalValueProvider labels = Mockito.mock(GlobalValueProvider.class);
        Map<String, GlobalValueProvider> gvps = Maps.newHashMap();
        gvps.put(AuraValueProviderType.LABEL.getPrefix(), labels);
        AuraContext context = new AuraContextImpl(mode, registries,
                null /* defaultPrefixes */,
                Format.JSON, access,
                null /* jsonContext */,
                gvps /* globalProviders */,
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
        ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

        DefinitionServiceImpl definitionService = new DefinitionServiceImpl();
        definitionService.setCachingService(cachingService);
        definitionService.setContextService(contextService);
        definitionService.setConfigAdapter(configAdapter);
        definitionService.setLoggingService(loggingService);
        definitionService.setAuraGlobalControllerDefRegistry(globalControllerDefRegistry);
        Mockito.doReturn(ImmutableMap.of()).when(globalControllerDefRegistry).getAll();
        Mockito.doReturn(rwLock.readLock()).when(cachingService).getReadLock();
        Mockito.doReturn(rwLock.writeLock()).when(cachingService).getWriteLock();
        Mockito.doReturn(defsCache).when(cachingService).getDefsCache();
        Mockito.doReturn(depsCache).when(cachingService).getDepsCache();
        Mockito.doReturn(existsCache).when(cachingService).getExistsCache();
        Mockito.doReturn(descriptorFilterCache).when(cachingService).getDescriptorFilterCache();
        return definitionService;
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

    @Test
    public void testGetDefinitionLogsOnMissingNamespace() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        QuickFixException expected = null;

        try {
            definitionService.getDefinition(descriptor);
        } catch (QuickFixException e) {
            expected = e;
        }
        Assert.assertNotNull("Should have gotten a definition not found exception", expected);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        Mockito.verify(loggingService, Mockito.times(1)).warn(captor.capture());
        Assert.assertTrue(captor.getValue().startsWith("Registry not found for"));
    }

    @Test
    public void testGetDefinitionLogsOnMissingDefinition() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        QuickFixException expected = null;
        registries.setupRegistryFor(descriptor, registry1, null);

        try {
            definitionService.getDefinition(descriptor);
        } catch (QuickFixException e) {
            expected = e;
        }
        Assert.assertNotNull("Should have gotten a definition not found exception", expected);
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        Mockito.verify(loggingService, Mockito.times(1)).warn(captor.capture());
        Assert.assertTrue(captor.getValue().contains("not found in registry registry1"));
    }


// <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass);
// <T extends Definition, B extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass, DefDescriptor<B> bundle);
// <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix, Class<T> defClass);
// DefDescriptor<?> getDefDescriptor(String prefix, String namespace, String name, DefType defType);

// <T extends Definition> T getDefinition(DefDescriptor<T> descriptor) throws DefinitionNotFoundException, QuickFixException;
    @Test
    public void testGetDefinitionReturnsNullForNull() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Assert.assertNull(definitionService.getDefinition(null));
    }

    //verify validateDefinition and validateReferences are called once during getDefinition
    @Test
    public void testGetDefinitionLinksSimpleDef() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = Mockito.spy(new MockDefinition(descriptor));
        registries.setupRegistryFor(descriptor, registry1, definition);
        Assert.assertEquals(definition, definitionService.getDefinition(descriptor));
        Mockito.verify(definition, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition, Mockito.times(1)).validateReferences(Matchers.any());
    }

    @Test
    public void testGetDefinitionFailsOnValidateDefError() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = Mockito.spy(new MockDefinition(descriptor));

        Mockito.doThrow(expected).when(definition).validateDefinition();
        registries.setupRegistryFor(descriptor, registry1, definition);
        Exception actual = null;

        try {
            definitionService.getDefinition(descriptor);
        } catch (QuickFixException e) {
            actual = e;
        }
        Assert.assertEquals(expected, actual);
        Mockito.verify(definition, Mockito.times(1)).validateDefinition();
    }

    @Test
    public void testGetDefinitionFailsOnValidateRefsError() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = Mockito.spy(new MockDefinition(descriptor));

        Mockito.doThrow(expected).when(definition).validateReferences(Matchers.any());
        registries.setupRegistryFor(descriptor, registry1, definition);
        Exception actual = null;

        try {
            definitionService.getDefinition(descriptor);
        } catch (QuickFixException e) {
            actual = e;
        }
        Assert.assertEquals(expected, actual);
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
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        registries.setupRegistryFor(descriptor2, registry1, definition2);
        Assert.assertEquals(definition1, definitionService.getDefinition(descriptor1));
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(1)).validateReferences(Matchers.any());
        Mockito.verify(definition1, Mockito.times(1)).markValid();
        Mockito.verify(definition2, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition2, Mockito.times(1)).validateReferences(Matchers.any());
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
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        registries.setupRegistryFor(descriptor2, registry1, definition2);

        QuickFixException actual = null;
        try {
            definitionService.getDefinition(descriptor1);
        } catch (QuickFixException e) {
            actual = e;
        }
        Assert.assertEquals(expected, actual);

        //
        // When we fail due to an error we should call validateDefinition(), but no validateReferences()
        //
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences(Matchers.any());
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition2, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition2, Mockito.times(0)).validateReferences(Matchers.any());
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
        Mockito.doThrow(expected).when(definition2).validateReferences(Matchers.any());
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        registries.setupRegistryFor(descriptor2, registry1, definition2);

        QuickFixException actual = null;
        try {
            definitionService.getDefinition(descriptor1);
        } catch (QuickFixException e) {
            actual = e;
        }
        Assert.assertEquals(expected, actual);

        //
        // When we fail due to an error we should call validateDefinition(), but no validateReferences()
        //
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        //Mockito.verify(definition1, Mockito.times(0)).validateReferences(); - no guarantee
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition2, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition2, Mockito.times(1)).validateReferences(Matchers.any());
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
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        Assert.assertEquals(definition1, definitionService.getUnlinkedDefinition(descriptor1));
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences(Matchers.any());
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition1, Mockito.times(0)).getDependencySet();
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
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        Mockito.doThrow(expected).when(definition1).validateDefinition();

        QuickFixException actual = null;
        try {
            definitionService.getUnlinkedDefinition(descriptor1);
        } catch (QuickFixException e) {
            actual = e;
        }

        Assert.assertEquals(expected, actual);
        Mockito.verify(definition1, Mockito.times(1)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences(Matchers.any());
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition1, Mockito.times(0)).getDependencySet();
    }

    @Test
    public void testGetUnlinkedDefinitionFromLocalCache() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        AuraContext context = setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        Definition definition1 = Mockito.spy(unmocked1);
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        context.addLocalDef(descriptor1, definition1);

        Assert.assertEquals(definition1, definitionService.getUnlinkedDefinition(descriptor1));
        Mockito.verify(definition1, Mockito.times(0)).validateDefinition();
        Mockito.verify(definition1, Mockito.times(0)).validateReferences(Matchers.any());
        Mockito.verify(definition1, Mockito.times(0)).markValid();
        Mockito.verify(definition1, Mockito.times(0)).getDependencySet();
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
        registries.setupRegistryFor(descriptor1, registry1, definition1);

        Assert.assertEquals(true, definitionService.exists(descriptor1));
        Mockito.verify(registry1, Mockito.times(1)).exists(descriptor1);
    }

    @Test
    public void testExistsFromLocalDefCache() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        AuraContext context = setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        MockDefinition unmocked1 = new MockDefinition(descriptor1);
        Definition definition1 = Mockito.spy(unmocked1);
        registries.setupRegistryFor(descriptor1, registry1, definition1);
        context.addLocalDef(descriptor1, definition1);

        Assert.assertEquals(true, definitionService.exists(descriptor1));
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
        registries.setupRegistryFor(descriptor1, registry1, definition1);

        Assert.assertEquals(source, definitionService.getSource(descriptor1));
        Mockito.verify(registry1, Mockito.times(1)).getSource(descriptor1);
    }

    @Test
    public void testSourceWithNoRegistry() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService);
        DefDescriptor<Definition> descriptor1 = getMockDescriptor();
        Assert.assertEquals(null, definitionService.getSource(descriptor1));
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
        //String cacheKey = filter.toString() + "|" + registry1.toString();
        Mockito.verify(descriptorFilterCache, Mockito.times(0)).put(Mockito.any(), Mockito.any());
    }

    @Test
    public void testFindCallsRegistryWithNamespace() throws Exception {
        String namespace = getUniqueNamespace();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Set<DefDescriptor<?>> expectedCacheValue = Sets.newHashSet();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespace+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.find(Matchers.any())).thenReturn(expectedCacheValue);
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        Mockito.verify(descriptorFilterCache, Mockito.times(0)).put(Mockito.any(), Mockito.any());
    }

    @Test
    public void testFindCallsRegistryWithNamespaceAndCachesWhenCacheable() throws Exception {
        String namespace = getUniqueNamespace();
        Set<DefDescriptor<?>> expectedCacheValue = Sets.newHashSet();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespace+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.isCacheable()).thenReturn(true);
        Mockito.when(registry1.find(Matchers.any())).thenReturn(expectedCacheValue);
        Mockito.when(configAdapter.isCacheable(Matchers.any())).thenReturn(true);
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        Mockito.verify(descriptorFilterCache, Mockito.times(1)).put(cacheKey, expectedCacheValue);
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
        Mockito.when(registry1.find(Matchers.any())).thenReturn(Sets.newHashSet());
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        Mockito.verify(descriptorFilterCache, Mockito.times(0)).put(Matchers.any(), Matchers.any());
    }

    @Test
    public void testFindCallsRegistryWithNamespaceMismatchCaseAndCaches() throws Exception {
        String namespace = getUniqueNamespace();
        String namespaceMismatch = namespace.toUpperCase();
        Set<DefDescriptor<?>> expectedCacheValue = Sets.newHashSet();
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DescriptorFilter filter = new DescriptorFilter("*://"+namespaceMismatch+":*");
        registries.addFilterFor(filter, registry1);
        // registry must have 'hasFind()', and must have a namespace that matches.
        Mockito.when(registry1.hasFind()).thenReturn(true);
        Mockito.when(registry1.getNamespaces()).thenReturn(Sets.newHashSet(namespace));
        Mockito.when(registry1.find(Matchers.any())).thenReturn(expectedCacheValue);
        Mockito.when(registry1.isCacheable()).thenReturn(true);
        Mockito.when(configAdapter.isCacheable(Matchers.any())).thenReturn(true);
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        String cacheKey = filter.toString() + "|" + registry1.toString();
        Mockito.verify(descriptorFilterCache, Mockito.times(1)).put(cacheKey, expectedCacheValue);
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
        Mockito.when(registry1.find(Matchers.any())).thenReturn(Sets.newHashSet());
        definitionService.find(filter);
        Mockito.verify(registry1, Mockito.times(1)).find(filter);

        //
        // This should not be cached.
        //
        Mockito.verify(descriptorFilterCache, Mockito.times(0)).put(Matchers.any(), Matchers.any());
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
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        boolean res = definitionService.hasAccess(descriptor, (Definition)null);
        Assert.assertTrue("hasAccess on null definitation should return true", res);
    }
    
    @Test
    public void testHasAccessWithDefNoAccessDeclaration() throws QuickFixException {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = new MockDefinition(descriptor, null);
        Exception expected = null;
        try {
            definitionService.hasAccess(descriptor, definition);
        } catch (Exception e) {
            expected = e;
        }
        Assert.assertNotNull("we should throw RuntimeException when definition miss access declaration", expected);
        Assert.assertEquals("Unexpected exception type", RuntimeException.class, expected.getClass());
        String messageStartsWith = "Missing access declaration for";
        Assert.assertEquals("Unexpected start of message", messageStartsWith,
                expected.getMessage().substring(0, messageStartsWith.length()));
    }
    
    @Test
    public void testHasAcessWithDefGlobalAccess() throws QuickFixException {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = new MockDefinition(descriptor);
        boolean res = definitionService.hasAccess(descriptor, definition);
        Assert.assertTrue("hasAccess on definition with access=GLOBAL should return true", res);
    }
    
    @Test
    public void testHasAcessWithDefPrivateAccess() throws QuickFixException {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        setupContext(definitionService, Mode.DEV, Authentication.AUTHENTICATED);
        DefDescriptor<Definition> descriptor = getMockDescriptor();
        Definition definition = new MockDefinition(descriptor, AuraContext.Access.PRIVATE);
        boolean res = definitionService.hasAccess(descriptor, definition);
        Assert.assertTrue("hasAccess on definition with access=PRIVATE should return true only when referencingDescriptor the same as definition's descriptor", res);
    }
    
    //todo: more test on hasAccess
    
    
    /*
     public List<ClientLibraryDef> getClientLibraries(String uid)
    */
    @Test
    public void testGetClientLibrariesWithNullUid() {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Assert.assertNull("we should return null when getting clientLibraries with null uid", definitionService.getClientLibraries(null));
    }
    
    @Test
    public void testGetClientLibraries() {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        
        Map<DefDescriptor<? extends Definition>, Definition> dependencies = Maps.newHashMap();
        List<ClientLibraryDef> clientLibraries = new ArrayList<>();
        DependencyEntry de = new DependencyEntry("testUID", dependencies, clientLibraries, false, null);
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
        
        Assert.assertEquals("we should return DependencyEntry's clientLibraries when getting clientLibraries with valid uid", 
                clientLibraries, definitionService.getClientLibraries("testUID"));
    }
    
    /*
     public Set<DefDescriptor<?>> getDependencies(String uid)
     */
    @Test
    public void testGetDependenciesWithNullUid() {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Assert.assertNull("we should return null when getting dependency with null uid", definitionService.getDependencies(null));
    }
    
    @Test
    public void testGetDependencies() {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        
        Map<DefDescriptor<? extends Definition>, Definition> dependencies = Maps.newHashMap();
        List<ClientLibraryDef> clientLibraries = new ArrayList<>();
        DependencyEntry de = new DependencyEntry("testUID", dependencies, clientLibraries, false, null);
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
        
        Assert.assertEquals("We should get the set of def descriptors for dependencies",
                dependencies.keySet(), definitionService.getDependencies("testUID"));
    }
    
    /*
     public <T extends Definition> String getUid(String uid, DefDescriptor<T> descriptor)
     */
    @Test
    public void getGetUidWithNullDescriptor() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Assert.assertNull("we should return null when getting Uid with null descriptor", 
                definitionService.getUid("testUID", null));
    }
    
    @Test
    public void testLabelsCacheisPopulatedForApplications() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Mockito.when(globalControllerDefRegistry.getAll()).thenReturn(ImmutableMap.of());        
        String name = "test_"+counter.getAndIncrement();
        @SuppressWarnings("unchecked")
        DefDescriptor<Definition> descriptor = Mockito.mock(DefDescriptor.class);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(descriptor.getName()).thenReturn(name);
        Mockito.when(descriptor.getNamespace()).thenReturn(NAMESPACE);
        Mockito.when(descriptor.getQualifiedName()).thenReturn("bah://"+NAMESPACE+":"+name);
        Definition mockDefinition = new MockDefinition(descriptor, AuraContext.Access.PRIVATE);
        registries.setupRegistryFor(descriptor, registry1, mockDefinition);
        AuraContext context = setupContext(definitionService);
        AuraContext mockedContext = Mockito.spy(context);
        Mockito.when(contextService.getCurrentContext()).thenReturn(mockedContext);
        String uid = definitionService.getUid(null, descriptor);
        Assert.assertNotNull(uid);
        DependencyEntry de = mockedContext.getLocalDependencyEntry(uid);
        Assert.assertNotNull(de);
        String key = uid + "/" + descriptor.getDefType() + ":" + descriptor.getQualifiedName().toLowerCase();
        Mockito.verify(depsCache, Mockito.times(1)).put(key, de);
        Assert.assertNotNull(de.globalReferencesMap.get(AuraValueProviderType.LABEL.getPrefix()));
    }
    
    @Test
    public void testLabelsCacheisUsedForApplications() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Map<DefDescriptor<? extends Definition>, Definition> dependencies = Maps.newHashMap();
        List<ClientLibraryDef> clientLibraries = new ArrayList<>();
        Map<String,Set<PropertyReference>> globalReferencesMap = new HashMap<>();
        Set<PropertyReference> mockSet = new HashSet<>();
        globalReferencesMap.put("root", mockSet);
        DependencyEntry de = new DependencyEntry("testUID", dependencies, clientLibraries, false, globalReferencesMap);
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
        Assert.assertEquals(mockSet, definitionService.getGlobalReferences("testUID", "root"));
    }
    
    @Test
    public void testLabelsCacheisBuiltforComponents() throws Exception {
        DefinitionService definitionService = createDefinitionServiceWithMocks();
        Map<DefDescriptor<? extends Definition>, Definition> dependencies = Maps.newHashMap();
        List<ClientLibraryDef> clientLibraries = new ArrayList<>();
        DependencyEntry de = new DependencyEntry("testUID", dependencies, clientLibraries, false, null);
        String name = "test_"+ counter.getAndIncrement();
        @SuppressWarnings("unchecked")
        DefDescriptor<Definition> descriptor = Mockito.mock(DefDescriptor.class);
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.COMPONENT);
        Mockito.when(descriptor.getName()).thenReturn(name);
        Mockito.when(descriptor.getNamespace()).thenReturn(NAMESPACE);
        Mockito.when(descriptor.getQualifiedName()).thenReturn("bah://"+NAMESPACE+":"+name);
        Definition mockDefinition = new MockDefinition(descriptor, AuraContext.Access.PRIVATE);
        registries.setupRegistryFor(descriptor, registry1, mockDefinition);
        AuraContext context = setupContext(definitionService);
        AuraContext mockedContext = Mockito.spy(context);
        Mockito.when(mockedContext.getLocalDependencyEntry("testUID")).thenReturn(de);
        Mockito.when(contextService.getCurrentContext()).thenReturn(mockedContext);
        Assert.assertNotNull(definitionService.getGlobalReferences("testUID", AuraValueProviderType.LABEL.getPrefix()));
    }
    
//void updateLoaded(DefDescriptor<?> loading) throws QuickFixException, ClientOutOfSyncException;

    @Test
    public void testCanCreateResolverContext() {
        DefinitionService service = createDefinitionServiceWithMocks();
        RegistrySet registrySet = Mockito.mock(RegistrySet.class);

        ResolverContext context = service.createResolverContext(registrySet);
        Assert.assertNotNull(context);
        Assert.assertEquals(registrySet, context.getRegistrySet());
    }

    @Test
    public void testSetResolverContextSetsRegistries() {
        DefinitionService service = createDefinitionServiceWithMocks();
        RegistrySet registrySet = Mockito.mock(RegistrySet.class);
        AuraContext auraContext = Mockito.mock(AuraContext.class);
        Mockito.doReturn(auraContext).when(contextService).getCurrentContext();

        ResolverContext context = service.createResolverContext(registrySet);
        service.setResolverContext(context);
        Mockito.verify(auraContext, Mockito.times(1)).setRegistries(registrySet);
        Mockito.verify(auraContext, Mockito.times(1)).setAuraLocalStore(Matchers.any());
    }

    @Test
    public void testTwoSetResolverContextSetsDifferentLocalStores() {
        DefinitionService service = createDefinitionServiceWithMocks();
        RegistrySet registrySet = Mockito.mock(RegistrySet.class);
        RegistrySet registrySet2 = Mockito.mock(RegistrySet.class);
        AuraContext auraContext = Mockito.mock(AuraContext.class);
        Mockito.doReturn(auraContext).when(contextService).getCurrentContext();

        ResolverContext context = service.createResolverContext(registrySet);
        ResolverContext context2 = service.createResolverContext(registrySet2);
        service.setResolverContext(context);
        Mockito.verify(auraContext, Mockito.times(1)).setRegistries(registrySet);
        service.setResolverContext(context2);
        Mockito.verify(auraContext, Mockito.times(1)).setRegistries(registrySet2);
        ArgumentCaptor<AuraLocalStore> captor = ArgumentCaptor.forClass(AuraLocalStore.class);
        Mockito.verify(auraContext, Mockito.times(2)).setAuraLocalStore(captor.capture());
        List<AuraLocalStore> arguments = captor.getAllValues();
        Assert.assertEquals(2, arguments.size());
        Assert.assertFalse("Local stores should be different", arguments.get(0).equals(arguments.get(1)));
    }
}

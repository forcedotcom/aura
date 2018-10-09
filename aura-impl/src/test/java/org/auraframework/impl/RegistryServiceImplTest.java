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

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import javax.inject.Inject;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.controller.AuraGlobalControllerDefRegistry;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.RegistryTrie;
import org.auraframework.service.CachingService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.RegistrySet.RegistrySetKey;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.IOUtil;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class RegistryServiceImplTest extends AuraImplTestCase {

    @Inject
    protected CachingService cachingService;

    @Override
    public void tearDown() throws Exception {
        cachingService.getRegistrySetCache().invalidateAll();
        super.tearDown();
    }

    @Test
    public void testSingleRegistry() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();
        DefRegistry reg = Mockito.mock(DefRegistry.class);
        Mockito.when(reg.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg.getPrefixes()).thenReturn(Sets.newHashSet("test"));
        Mockito.when(reg.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));

        RegistrySet result = rs.getRegistrySet(reg);

        assertEquals(1, result.getAllRegistries().size());
        assertEquals(reg, result.getAllRegistries().iterator().next());
    }

    @Test
    public void testDoubleRegistry() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();
        DefRegistry reg1 = Mockito.mock(DefRegistry.class);
        DefRegistry reg2 = Mockito.mock(DefRegistry.class);
        Mockito.when(reg1.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg1.getPrefixes()).thenReturn(Sets.newHashSet("test"));
        Mockito.when(reg1.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));

        Mockito.when(reg2.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg2.getPrefixes()).thenReturn(Sets.newHashSet("test2"));
        Mockito.when(reg2.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));

        RegistrySet result = rs.getRegistrySet(Lists.newArrayList(reg1, reg2));

        assertEquals(2, result.getAllRegistries().size());
        assertTrue(result.getAllRegistries().contains(reg1));
        assertTrue(result.getAllRegistries().contains(reg2));
    }

    @Test
    public void testDefaultWithProviders() {
        RegistryServiceImpl rs = new RegistryServiceImpl();
        DefRegistry reg = Mockito.mock(DefRegistry.class);
        RegistryAdapter mockAdapter = Mockito.mock(RegistryAdapter.class);
        Mockito.when(reg.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg.getPrefixes()).thenReturn(Sets.newHashSet("test"));
        Mockito.when(reg.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));
        Mockito.when(mockAdapter.getRegistries(null, null, null)).thenReturn(new DefRegistry[] { reg });

        List<RegistryAdapter> adapters = Lists.newArrayList(mockAdapter);
        rs.setAdapters(adapters);
        rs.setLocationAdapters(Lists.newArrayList());
        rs.setAuraGlobalControllerDefRegistry(new AuraGlobalControllerDefRegistry());

        RegistrySet result = rs.getDefaultRegistrySet(null, null);

        assertTrue(result.getAllRegistries().contains(reg));
    }
    // I'd test with CLAs, but that is very painful. Maybe we need to clean that code up and make it testable.

    /**
     * Verify that cache is not used if session cache key is null.
     */
    @Test
    public void testGetDefaultSessionCacheKeyIsNull() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();

        // set the config adapter to return null session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(null);
        rs.setConfigAdapter(mockConfigAdapter);

        // set the caching service to return a mocked cache.
        CachingService mockCachingService = mock(CachingService.class);

        @SuppressWarnings("unchecked")
        Cache<RegistrySetKey, RegistrySet> mockCache = mock(Cache.class);
        when(mockCachingService.getRegistrySetCache()).thenReturn(mockCache);
        rs.setCachingService(mockCachingService);

        // make buildDefaultRegistry do nothing when called.
        RegistryServiceImpl rsSpy = spy(rs);
        RegistryTrie mockRegistryTrie = mock(RegistryTrie.class);
        doReturn(mockRegistryTrie).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // execute method.
        RegistrySet registrySet = rsSpy.getDefaultRegistrySet(AuraContext.Mode.DEV, AuraContext.Authentication.AUTHENTICATED);

        // sanity check. Not needed.
        assertEquals(mockRegistryTrie, registrySet);

        // verify that the registry was built
        verify(rsSpy, times(1)).buildDefaultRegistrySet(any(), any());

        // verify that it didn't ask the cache for the value
        verify(mockCache, never()).get(any(), any());
    }

    /**
     * Verify that cache is used if {@link RegistryServiceImpl#getDefaultRegistrySet(org.auraframework.system.AuraContext.Mode, org.auraframework.system.AuraContext.Authentication)}
     * is called with the same arguments using the same session cache key.
     */
    @Test
    public void testGetDefaultCacheIsUsed() throws Exception {
        final String sessionCacheKey = "123!";
        final Mode mode = AuraContext.Mode.UTEST;
        final Authentication access = AuraContext.Authentication.AUTHENTICATED;
        final RegistrySetKey expectedCacheKey = new RegistrySetKey(mode, access, sessionCacheKey);

        RegistryServiceImpl rs = new RegistryServiceImpl();

        // set the config adapter to return the session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey);
        rs.setConfigAdapter(mockConfigAdapter);

        // use real, spied cache service.
        Cache<RegistrySetKey, RegistrySet> registrySetCacheSpy = spy(cachingService.getRegistrySetCache());
        CachingService mockCachingService = mock(CachingService.class);
        when(mockCachingService.getRegistrySetCache()).thenReturn(registrySetCacheSpy);
        rs.setCachingService(mockCachingService);

        // make buildDefaultRegistry do nothing when called / and returning known RegistryTrie.
        RegistryServiceImpl rsSpy = spy(rs);
        RegistryTrie mockRegistryTrie = mock(RegistryTrie.class);
        doReturn(mockRegistryTrie).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // execute method twice with same arguments.
        RegistrySet registrySet1 = rsSpy.getDefaultRegistrySet(mode, access);
        RegistrySet registrySet2 = rsSpy.getDefaultRegistrySet(mode, access);

        // sanity check. Not needed.
        assertEquals(mockRegistryTrie, registrySet1);
        assertEquals(mockRegistryTrie, registrySet2);

        // verify that it asked cache for the value twice
        verify(registrySetCacheSpy, times(2)).get(eq(expectedCacheKey), any());

        // but the registry was built only once (i.e. used the cached value).
        verify(rsSpy, times(1)).buildDefaultRegistrySet(eq(mode), eq(access));
    }

    /**
     * Verify that cache is not used if {@link RegistryServiceImpl#getDefaultRegistrySet(org.auraframework.system.AuraContext.Mode, org.auraframework.system.AuraContext.Authentication)}
     * is called with the same arguments but with different session cache keys
     */
    @Test
    public void testGetDefaultDifferentSessionCacheKeys() throws Exception {
        final String sessionCacheKey1 = "123!";
        final String sessionCacheKey2 = "!321";
        final Mode mode = AuraContext.Mode.UTEST;
        final Authentication access = AuraContext.Authentication.AUTHENTICATED;
        final RegistrySetKey expectedCacheKey1 = new RegistrySetKey(mode, access, sessionCacheKey1);
        final RegistrySetKey expectedCacheKey2 = new RegistrySetKey(mode, access, sessionCacheKey2);

        RegistryServiceImpl rs = new RegistryServiceImpl();

        // set the config adapter to return the session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey1);
        rs.setConfigAdapter(mockConfigAdapter);

        // use real, spied cache service.
        Cache<RegistrySetKey, RegistrySet> registrySetCacheSpy = spy(cachingService.getRegistrySetCache());
        CachingService mockCachingService = mock(CachingService.class);
        when(mockCachingService.getRegistrySetCache()).thenReturn(registrySetCacheSpy);
        rs.setCachingService(mockCachingService);

        // make buildDefaultRegistry do nothing when called / and returning known RegistryTrie.
        RegistryServiceImpl rsSpy = spy(rs);
        RegistryTrie mockRegistryTrie = mock(RegistryTrie.class);
        doReturn(mockRegistryTrie).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // execute method twice with same arguments.
        RegistrySet registrySet1 = rsSpy.getDefaultRegistrySet(mode, access);

        // change session cache key.
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey2);
        RegistrySet registrySet2 = rsSpy.getDefaultRegistrySet(mode, access);

        // sanity check. Not needed.
        assertEquals(mockRegistryTrie, registrySet1);
        assertEquals(mockRegistryTrie, registrySet2);

        // verify that it asked the cache twice.
        verify(registrySetCacheSpy, times(1)).get(eq(expectedCacheKey1), any());
        verify(registrySetCacheSpy, times(1)).get(eq(expectedCacheKey2), any());

        // and that the registry was built twice (i.e. not cached).
        verify(rsSpy, times(2)).buildDefaultRegistrySet(eq(mode), eq(access));
    }

    /**
     * Verify that cache is not used if {@link RegistryServiceImpl#getDefaultRegistrySet(org.auraframework.system.AuraContext.Mode, org.auraframework.system.AuraContext.Authentication)}
     * is called with different arguments but with the same session cache key.
     */
    @Test
    public void testGetDefaultDifferentArguments() throws Exception {
        final String sessionCacheKey = "cacheKey";
        final Mode mode1 = AuraContext.Mode.UTEST;
        final Authentication access1 = AuraContext.Authentication.AUTHENTICATED;
        final Mode mode2 = AuraContext.Mode.CADENCE;
        final Authentication access2 = AuraContext.Authentication.UNAUTHENTICATED;

        final RegistrySetKey expectedCacheKey1 = new RegistrySetKey(mode1, access1, sessionCacheKey);
        final RegistrySetKey expectedCacheKey2 = new RegistrySetKey(mode1, access2, sessionCacheKey);
        final RegistrySetKey expectedCacheKey3 = new RegistrySetKey(mode2, access1, sessionCacheKey);
        final RegistrySetKey expectedCacheKey4 = new RegistrySetKey(mode2, access2, sessionCacheKey);

        RegistryServiceImpl rs = new RegistryServiceImpl();

        // set the config adapter to return the session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey);
        rs.setConfigAdapter(mockConfigAdapter);

        // use real, spied cache service.
        Cache<RegistrySetKey, RegistrySet> registrySetCacheSpy = spy(cachingService.getRegistrySetCache());
        CachingService mockCachingService = mock(CachingService.class);
        when(mockCachingService.getRegistrySetCache()).thenReturn(registrySetCacheSpy);
        rs.setCachingService(mockCachingService);

        // make buildDefaultRegistry do nothing when called / and returning known RegistryTrie.
        RegistryServiceImpl rsSpy = spy(rs);
        RegistryTrie mockRegistryTrie = mock(RegistryTrie.class);
        doReturn(mockRegistryTrie).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // execute getDefaultRegistrySet 4 times with different arguments (same session cache key)
        RegistrySet registrySet1 = rsSpy.getDefaultRegistrySet(mode1, access1);
        RegistrySet registrySet2 = rsSpy.getDefaultRegistrySet(mode1, access2);
        RegistrySet registrySet3 = rsSpy.getDefaultRegistrySet(mode2, access1);
        RegistrySet registrySet4 = rsSpy.getDefaultRegistrySet(mode2, access2);

        // sanity check. Not needed.
        assertEquals(mockRegistryTrie, registrySet1);
        assertEquals(mockRegistryTrie, registrySet2);
        assertEquals(mockRegistryTrie, registrySet3);
        assertEquals(mockRegistryTrie, registrySet4);

        // verify that it asked the cache four times.
        verify(registrySetCacheSpy, times(1)).get(eq(expectedCacheKey1), any());
        verify(registrySetCacheSpy, times(1)).get(eq(expectedCacheKey2), any());
        verify(registrySetCacheSpy, times(1)).get(eq(expectedCacheKey3), any());
        verify(registrySetCacheSpy, times(1)).get(eq(expectedCacheKey4), any());

        // and that the registry was built twice (i.e. not cached).
        verify(rsSpy, times(1)).buildDefaultRegistrySet(eq(mode1), eq(access1));
        verify(rsSpy, times(1)).buildDefaultRegistrySet(eq(mode1), eq(access2));
        verify(rsSpy, times(1)).buildDefaultRegistrySet(eq(mode2), eq(access1));
        verify(rsSpy, times(1)).buildDefaultRegistrySet(eq(mode2), eq(access2));
    }

    /**
     * Verify nothing bad happens if {@link RegistryServiceImpl#getDefaultRegistrySet(Mode, Authentication)} is called
     * with null mode. Also, that the cache is not used.
     */
    @Test
    public void testGetDefaultModeIsNull() throws Exception {
        final Mode mode = null;
        final Authentication access = AuraContext.Authentication.AUTHENTICATED;
        verifyNullArgument(mode, access);
    }

    /**
     * Verify nothing bad happens if {@link RegistryServiceImpl#getDefaultRegistrySet(Mode, Authentication)} is called
     * with null access. Also, that the cache is not used.
     */
    @Test
    public void testGetDefaultAccessIsNull() throws Exception {
        final Mode mode = Mode.AUTOJSTEST;
        final Authentication access = null;
        verifyNullArgument(mode, access);
    }

    @Test
    public void testInvalidateRegistrySetCache() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();

        final String sessionCacheKey = "a cache key";

        // set the config adapter to return "hello world!" session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey);
        rs.setConfigAdapter(mockConfigAdapter);

        // use real caching service
        rs.setCachingService(cachingService);

        // make buildDefaultRegistry return a mocked registry trie when called
        RegistryServiceImpl rsSpy = spy(rs);
        RegistryTrie mockRegistryTrie = mock(RegistryTrie.class);
        doReturn(mockRegistryTrie).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // expect registry trie to be built first time it is called:
        rsSpy.getDefaultRegistrySet(AuraContext.Mode.UTEST, AuraContext.Authentication.AUTHENTICATED);
        verify(rsSpy, times(1)).buildDefaultRegistrySet(any(), any());

        // expect registry not to be built the second time
        rsSpy.getDefaultRegistrySet(AuraContext.Mode.UTEST, AuraContext.Authentication.AUTHENTICATED);
        // still called only one time.
        verify(rsSpy, times(1)).buildDefaultRegistrySet(any(), any());

        // invalidate the cache
        cachingService.getRegistrySetCache().invalidateAll();
        rsSpy.getDefaultRegistrySet(AuraContext.Mode.UTEST, AuraContext.Authentication.AUTHENTICATED);

        // expect registryTrie to have rebuilt
        verify(rsSpy, times(2)).buildDefaultRegistrySet(any(), any());
    }

    /**
     * Verify that NullPointer exception is thrown if buildRegistrySet returns null.
     */
    @Test
    public void testBuildDefaultRegistrySetReturnsNull() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();

        final String sessionCacheKey = "hello world!";

        // set the config adapter to return "hello world!" session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey);
        rs.setConfigAdapter(mockConfigAdapter);

        // use real caching service
        rs.setCachingService(cachingService);

        // make buildDefaultRegistry return null when called.
        RegistryServiceImpl rsSpy = spy(rs);
        doReturn(null).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // execute method.
        try {
            rsSpy.getDefaultRegistrySet(AuraContext.Mode.UTEST, AuraContext.Authentication.AUTHENTICATED);
            fail("expected NullPointerException to be thrown");
        } catch (NullPointerException e) {
            // expected
        }
    }

    private void verifyNullArgument(final Mode mode, final Authentication access) throws ExecutionException {
        final String sessionCacheKey = "Hello";
        RegistryServiceImpl rs = new RegistryServiceImpl();

        // set the config adapter to return the session key.
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.getSessionCacheKey(Mockito.any())).thenReturn(sessionCacheKey);
        rs.setConfigAdapter(mockConfigAdapter);

        // set the caching service to return a mocked cache.
        CachingService mockCachingService = mock(CachingService.class);

        @SuppressWarnings("unchecked")
        Cache<RegistrySetKey, RegistrySet> mockCache = mock(Cache.class);
        when(mockCachingService.getRegistrySetCache()).thenReturn(mockCache);
        rs.setCachingService(mockCachingService);

        // make buildDefaultRegistry do nothing when called / and returning known RegistryTrie.
        RegistryServiceImpl rsSpy = spy(rs);
        RegistryTrie mockRegistryTrie = mock(RegistryTrie.class);
        doReturn(mockRegistryTrie).when(rsSpy).buildDefaultRegistrySet(any(), any());

        // execute method twice with same arguments.
        RegistrySet registrySet = rsSpy.getDefaultRegistrySet(mode, access);

        // sanity check. Not needed.
        assertEquals(mockRegistryTrie, registrySet);

        // verify that it didn't ask the cache
        verify(mockCache, never()).get(any(), any());

        // and that the registry was built.
        verify(rsSpy, times(1)).buildDefaultRegistrySet(eq(mode), eq(access));
    }

    private File makeFile(File parent, String namespace, String name, String extension, String contents) throws Exception {
        File namespaceDirectory = new File(parent, namespace);
        File bundleDirectory = new File(namespaceDirectory, name);
        bundleDirectory.mkdirs();
        File file = new File(bundleDirectory, name + extension);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(contents.getBytes("UTF-8"));
        }
        return file;
    }

    private RegistryServiceImpl newInstanceForTest() {
        RegistryServiceImpl registryService = new RegistryServiceImpl();
        registryService.setAdapters(ImmutableList.of());

        AuraGlobalControllerDefRegistry mockGlobalControllerReg = mock(AuraGlobalControllerDefRegistry.class);
        when(mockGlobalControllerReg.getDefTypes()).thenReturn(ImmutableSet.of(DefType.CONTROLLER));
        registryService.setAuraGlobalControllerDefRegistry(mockGlobalControllerReg);

        Map<String, String> internalNamespaces = new HashMap<>();
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        registryService.setConfigAdapter(mockConfigAdapter);

        doAnswer(new Answer<Void>() {
            @Override
            public Void answer(InvocationOnMock invocation) throws Throwable {
                // mirror logic in ConfigAdapterImpl
                String namespace = (String)invocation.getArguments()[0];
                if(namespace != null && !namespace.isEmpty()){
                    internalNamespaces.put(namespace.toLowerCase(), namespace);
                }
                return null;
            }
        }).when(mockConfigAdapter).addInternalNamespace(any(String.class));

        when(mockConfigAdapter.isInternalNamespace(any(String.class))).thenAnswer(new Answer<Boolean>() {
            @Override
            public Boolean answer(InvocationOnMock invocation) throws Throwable {
                String namespace = (String)invocation.getArguments()[0];
                return namespace != null && internalNamespaces.containsKey(namespace.toLowerCase());
            }
        });

        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(internalNamespaces);

        return registryService;
    }

    @Test
    public void testCLARegistration() throws Exception {
        RegistryServiceImpl registryService = newInstanceForTest();

        File dir1 = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        makeFile(dir1, "namespace", "component", ".cmp", "<aura:component/>");

        File dir2 = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        makeFile(dir2, "otherNamespace", "component", ".cmp", "<aura:component/>");

        File dir3 = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        makeFile(dir3, "otherNamespace", "module", ".js", "export default class Foo{}");

        ComponentLocationAdapter cla1 = new ComponentLocationAdapter.Impl(dir1, null, null, null);
        ComponentLocationAdapter cla2 = new ComponentLocationAdapter.Impl(dir2, null, dir3, null);
        registryService.setLocationAdapters(Lists.newArrayList(cla1, cla2));

        RegistrySet set = registryService.buildRegistrySet(Mode.DEV, Authentication.UNAUTHENTICATED, null);

        DefDescriptor<?> desc1 = new DefDescriptorImpl<>("markup", "namespace", "component", ComponentDef.class);
        DefRegistry regA = set.getRegistryFor(desc1);
        assertNotNull("did not find registry for namespace:component", regA);

        DefDescriptor<?> desc2 = new DefDescriptorImpl<>("markup", "otherNamespace", "component", ComponentDef.class);
        DefRegistry regB = set.getRegistryFor(desc2);
        assertNotNull("did not find registry for otherNamespace:component", regB);

        DefDescriptor<?> desc3 = new DefDescriptorImpl<>("markup", "otherNamespace", "module", ModuleDef.class);
        DefRegistry regC = set.getRegistryFor(desc3);
        assertNotNull("did not find registry for otherNamespace:module", regC);

        assertEquals("expected registries to be the same for same namespace", regB, regC);
    }

    @Test
    public void testCLASourceDoesntExist() throws Exception {
        RegistryServiceImpl registryService = newInstanceForTest();

        File dir1 = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        makeFile(dir1, "namespace", "component", ".cmp", "<aura:component/>");

        File dir2 = new File("i_dont_exist");

        ComponentLocationAdapter cla1 = new ComponentLocationAdapter.Impl(dir1, null, null, null);
        ComponentLocationAdapter cla2 = new ComponentLocationAdapter.Impl(dir2, null, null, null);
        registryService.setLocationAdapters(Lists.newArrayList(cla1, cla2));

        LoggingService mockLoggingService = mock(LoggingService.class);
        registryService.setLoggingService(mockLoggingService);

        RegistrySet set = registryService.buildRegistrySet(Mode.DEV, Authentication.UNAUTHENTICATED, null);

        ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
        verify(mockLoggingService).warn(message.capture());

        String value = message.getValue();
        assertTrue(value.contains("Unable to find/read components source dir 'i_dont_exist'"));

        DefDescriptor<?> desc = new DefDescriptorImpl<>("markup", "namespace", "component", ComponentDef.class);
        DefRegistry reg = set.getRegistryFor(desc);
        assertNotNull("did not find registry for namespace:component", reg);
    }

    @Test
    public void testAddsDirsToFileMonitor() throws Exception {
        RegistryServiceImpl registryService = newInstanceForTest();

        FileMonitor monitor = mock(FileMonitor.class);
        registryService.setFileMonitor(monitor);

        File dir1 = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        makeFile(dir1, "namespace", "component", ".cmp", "<aura:component/>");

        File dir2 = new File(IOUtil.newTempDir(getClass().getSimpleName()));
        makeFile(dir2, "otherNamespace", "module", ".js", "export default class Foo{}");

        ComponentLocationAdapter cla = new ComponentLocationAdapter.Impl(dir1, null, dir2, null);
        registryService.setLocationAdapters(Lists.newArrayList(cla));

        registryService.buildRegistrySet(Mode.DEV, Authentication.UNAUTHENTICATED, null);

        verify(monitor, Mockito.times(1)).addDirectory(eq(dir1.getCanonicalPath()), any(Long.class));
        verify(monitor, Mockito.times(1)).addDirectory(eq(dir2.getCanonicalPath()), any(Long.class));
    }
}

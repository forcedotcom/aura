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
package test.org.auraframework.impl.adapter;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.TimeZone;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.context.AuraContextServiceImpl;
import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.source.AuraResourcesHashingGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.system.DefRegistry;
import org.auraframework.test.client.UserAgent;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.FileGroup;
import org.auraframework.util.test.util.UnitTestCase;
import org.auraframework.util.text.Hash;
import org.junit.Test;
import org.mockito.Mockito;

/**
 * Tests for {@link ConfigAdapterImpl}.
 * 
 * @since 0.0.245
 */
public class ConfigAdapterImplTest extends UnitTestCase {
    @Inject
    ConfigAdapter configAdapter;

    @Inject
    FileMonitor fileMonitor;

    @Inject
    ContextService contextService;
    
    @Inject
    InstanceService instanceService;
    
    // An exception thrown to test error handling.
    public static class MockException extends RuntimeException {
        private static final long serialVersionUID = -8065118313848222864L;

        public MockException(String string) {
            super(string);
        }
    }

    /**
     * Make sure that version file is available in aura package. If this test fails, then we have a build/packaging
     * issue.
     */
    @SuppressWarnings("static-method")
    @Test
    public void testVersionPropFile() throws Exception {
        String path = "/version.prop";
        final Properties props;
        try (InputStream stream = ConfigAdapterImpl.class.getResourceAsStream(path)) {
            props = new Properties();
            props.load(stream);
        }
        String timestamp = (String) props.get("aura.build.timestamp");
        String timestampFormat = (String) props.get("aura.build.timestamp.format");
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(timestampFormat);
        simpleDateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        simpleDateFormat.parse(timestamp).getTime();
    }

    /**
     * Test we can read the props as resources.
     */
    @Test
    public void testConfigAdapterCtor() {
        String version = configAdapter.getAuraVersion();
        if (!version.equals("development")) {
            assertThat("Unexpected version format. If it is not in a valid Maven format ( https://maven.apache.org/guides/mini/guide-naming-conventions.html ), check the system which is building the code to see if it is correctly generating it",
                    version, matchesPattern("^\\d+(\\.\\d+)+(-SNAPSHOT)?$"));
        }
        assertThat(configAdapter, hasProperty("buildTimestamp", greaterThan(Long.valueOf(0L))));
    }

    /**
     * Test regenerateAuraJS() functionality. For failure testing, the test makes a fake jsGroup which will still act as
     * though it saw an error (and should be handled as such).
     */
    @Test
    public void testRegenerateHandlesErrors() throws Exception {
        // But an error case should fail, and not be swallowed.
        final AuraJavascriptGroup mockJsGroup = mock(AuraJavascriptGroup.class);

        ConfigAdapterImpl mockAdapter = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor) {
            @Override
            public AuraJavascriptGroup newAuraJavascriptGroup() {
                return mockJsGroup;
            }

            @Override
            public boolean isProduction() {
                return false;
            }
        };

        ContextService contextService = mock(AuraContextServiceImpl.class);
        mockAdapter.setContextService(contextService);
        mockAdapter.setFileMonitor(fileMonitor);
        mockAdapter.initialize();
        try {
            when(mockJsGroup.isStale()).thenReturn(true);
            Mockito.doThrow(new MockException("Pretend we had a compile error in regeneration")).when(mockJsGroup)
                    .regenerate(AuraImplFiles.AuraResourceJavascriptDirectory.asFile());
            mockAdapter.regenerateAuraJS();
            fail("Compilation failure should have been caught!");
        } catch (AuraRuntimeException e) {
            assertThat("expected ARTE caused by MockException, not " + e.getCause().toString(), e, hasProperty("cause", instanceOf(MockException.class)));
        }

        // Try again, without changes; it should still fail.
        try {
            when(mockJsGroup.isStale()).thenReturn(false);
            mockAdapter.regenerateAuraJS();
            fail("Second compilation failure should have been caught!");
        } catch (AuraRuntimeException e2) {
            assertThat("expected ARTE caused by MockException, not " + e2.getCause().toString(), e2, hasProperty("cause", instanceOf(MockException.class)));
        }

        // Third time's the charm, we stop pretending there are errors and it
        // should work. Unless
        // we're in a resources-only environment, in which case the copying done
        // after our
        // jsGroup.regenerate() can't work, even though the mock
        // jsGroup.regenerate() will..
        if (!AuraImplFiles.AuraResourceJavascriptDirectory.asFile().exists()) {
            reset(mockJsGroup);
            when(mockJsGroup.isStale()).thenReturn(true);
            mockAdapter.regenerateAuraJS();
        }
    }

    /**
     * getAuraFrameworkNonce() is called a lot. This tests ensures that we aren't computing the final hash between js
     * and resources {@link ConfigAdapterImpl#makeHash(String, String)} unless there are changes.
     * 
     * Also testing the hash results are consistent
     */
    @Test
    public void testFrameworkUid() throws Exception {

        final AuraJavascriptGroup jsGroup = mock(AuraJavascriptGroup.class);
        Hash jsHash = mock(Hash.class);
        when(jsGroup.isStale()).thenReturn(false);
        when(jsGroup.getGroupHash()).thenReturn(jsHash);

        final AuraResourcesHashingGroup resourcesGroup = mock(AuraResourcesHashingGroup.class);
        Hash resourcesHash = mock(Hash.class);
        when(resourcesGroup.isStale()).thenReturn(false);
        when(resourcesGroup.getGroupHash()).thenReturn(resourcesHash);

        ConfigAdapterImpl configAdapter = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor) {
            @Override
            protected AuraJavascriptGroup newAuraJavascriptGroup() {
                return jsGroup;
            }

            @Override
            protected FileGroup newAuraResourcesHashingGroup() {
                return resourcesGroup;
            }
        };

        ContextService contextService = mock(AuraContextServiceImpl.class);
        ConfigAdapterImpl spy = Mockito.spy(configAdapter);
        spy.setContextService(contextService);
        spy.initialize();

        when(jsHash.toString()).thenReturn("jsGroup");
        when(resourcesHash.toString()).thenReturn("resourcesGroup");

        String uid = spy.getAuraFrameworkNonce();
        verify(spy).makeHash(anyString(), anyString());
        assertThat("Framework uid is not correct", uid, equalTo("9YifBh-oLwXkDGW3d3qyDQ"));

        reset(spy);
        uid = spy.getAuraFrameworkNonce();
        // test that makeHash is not called because jsHash and resourcesHash has not changed
        verify(spy, never()).makeHash(anyString(), anyString());
        assertThat("Framework uid is not correct", uid, equalTo("9YifBh-oLwXkDGW3d3qyDQ"));

        // change js hash, verify changes framework nonce
        when(jsHash.toString()).thenReturn("MocKitYMuCK");
        reset(spy);
        uid = spy.getAuraFrameworkNonce();
        verify(spy).makeHash(anyString(), anyString());
        assertThat("Framework uid is not correct", uid, equalTo("ltz-V8xGPGhXbOiTtfSApQ"));

        // change resource hash, verify changes framework nonce
        when(resourcesHash.toString()).thenReturn("MuCkiTyMocK");
        reset(spy);
        uid = spy.getAuraFrameworkNonce();
        verify(spy).makeHash(anyString(), anyString());
        assertThat("Framework uid is not correct", uid, equalTo("BJTaoiCDxoAF4Wbh0iC9lA"));

        reset(spy);
        uid = spy.getAuraFrameworkNonce();
        // test that makeHash is not called because jsHash and resourcesHash has not changed
        verify(spy, never()).makeHash(anyString(), anyString());
        assertThat("Framework uid is not correct", uid, equalTo("BJTaoiCDxoAF4Wbh0iC9lA"));
    }

    @Test
    public void testIsInternalNamespaceWithBadArguments() {
        ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        assertThat("null should not be an internal namespace", impl.isInternalNamespace(null), equalTo(Boolean.FALSE));
        assertThat("Empty string should not be an internal namespace", impl.isInternalNamespace(""), equalTo(Boolean.FALSE));
        assertThat("Wild characters should not be an internal namespace", impl.isInternalNamespace("*"), equalTo(Boolean.FALSE));
        assertThat(impl.isInternalNamespace("?"), equalTo(Boolean.FALSE));
    }

    @Test
    public void testIsInternalNamespaceAfterRegistering() {
        String namespace = this.getName() + System.currentTimeMillis();
        ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        impl.addInternalNamespace(namespace);
        assertThat("Failed to register an internal namespace.", impl.isInternalNamespace(namespace), equalTo(Boolean.TRUE));
        assertThat("Internal namespace checks are case sensitive.",
                impl.isInternalNamespace(namespace.toUpperCase()), equalTo(Boolean.TRUE));
    }

    @Test
    public void testAddInternalNamespacesWithBadArguments() {
        ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        impl.addInternalNamespace(null);
        assertThat(impl.isInternalNamespace(null), equalTo(Boolean.FALSE));

        impl.addInternalNamespace("");
        assertThat(impl.isInternalNamespace(""), equalTo(Boolean.FALSE));
    }

    @Test
    public void testGetInternalNamespacesReturnsSortedNamespaces() {
        ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        impl.getInternalNamespaces().clear();
        String[] namespaces = new String[] {"c", "a", "d", "b", "e"};
        for(String namespace : namespaces) {
            impl.addInternalNamespace(namespace);
        }
        // increasing order
        Arrays.sort(namespaces);
        List<String> expected = Arrays.asList(namespaces);

        // keep the iterate order of the returned collection from getInternalNamespaces()
        List<String> actual = new ArrayList<>(impl.getInternalNamespaces());
        assertThat(actual, equalTo(expected));
    }
    
    @Test
    public void testIsCacheableWithNullDescriptor() {//null descriptor
    	ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        DefRegistry mockReg = mock(DefRegistry.class);
    	assertThat(impl.isCacheable(mockReg, null), equalTo(Boolean.FALSE));
    }
    
    @Test
    public void testIsCacheableWithNullNamespaceNullPrefix() {//when namespace is null, prefix is not null, not cacheable
    	ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        DefRegistry mockRegistry = mock(DefRegistry.class);
    	@SuppressWarnings("rawtypes")
        DefDescriptor mockDescriptor = mock(DefDescriptor.class);
    	when(mockDescriptor.getQualifiedName()).thenReturn("java://testNs:testName");
    	when(mockDescriptor.getPrefix()).thenReturn(null);
    	when(mockDescriptor.getNamespace()).thenReturn(null);
    	when(mockRegistry.isCacheable()).thenReturn(false);
    	
    	assertThat(impl.isCacheable(mockRegistry, mockDescriptor), equalTo(Boolean.FALSE));
    }
    
    @Test
    public void testIsCacheableWithNullNamespaceValidPrefix() {//when namespace is null, prefix is not null, it's up to registry
    	ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        DefRegistry mockRegistry = mock(DefRegistry.class);
    	@SuppressWarnings("rawtypes")
        DefDescriptor mockDescriptor = mock(DefDescriptor.class);
    	when(mockDescriptor.getQualifiedName()).thenReturn("java://testNs:testName");
    	when(mockDescriptor.getPrefix()).thenReturn("prefix");
    	when(mockDescriptor.getNamespace()).thenReturn(null);
    	when(mockRegistry.isCacheable()).thenReturn(false);
    	
    	assertThat(impl.isCacheable(mockRegistry, mockDescriptor), equalTo(Boolean.FALSE));
    }
    
    @Test
    public void testIsCacheableWithNullNamespaceCompoundPrefix() {//when namespace is null, prefix is compound, it's cachable
    	ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        DefRegistry mockRegistry = mock(DefRegistry.class);
    	@SuppressWarnings("rawtypes")
        DefDescriptor mockDescriptor = mock(DefDescriptor.class);
    	when(mockDescriptor.getQualifiedName()).thenReturn("prefix://testNs.testName");
    	when(mockDescriptor.getPrefix()).thenReturn("compound");
    	when(mockDescriptor.getNamespace()).thenReturn(null);
    	when(mockRegistry.isCacheable()).thenReturn(true);
    	
    	assertThat(impl.isCacheable(mockRegistry, mockDescriptor), equalTo(Boolean.TRUE));
    }
    
    @Test
    public void testIsCacheableWithNullPrefixInternalNamespace() {//when prefix is null, namespace is not, it's up to namespace
    	ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        DefRegistry mockRegistry = mock(DefRegistry.class);
    	@SuppressWarnings("rawtypes")
        DefDescriptor mockDescriptor = mock(DefDescriptor.class);
    	when(mockDescriptor.getQualifiedName()).thenReturn("prefix://testNs.testName");
    	when(mockDescriptor.getPrefix()).thenReturn(null);
    	when(mockDescriptor.getNamespace()).thenReturn("testNs");
    	when(mockRegistry.isCacheable()).thenReturn(true);
    	
    	impl.addInternalNamespace("testNs");
    	assertThat(impl.isCacheable(mockRegistry, mockDescriptor), equalTo(Boolean.TRUE));
    }
    
    @Test
    public void testIsCacheableWithInternalNamespaceValidPrefix() {//when both prefix and namespace are not null, either of them is cacheable
    	ConfigAdapterImpl impl = new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
        DefRegistry mockRegistry = mock(DefRegistry.class);
    	@SuppressWarnings("rawtypes")
        DefDescriptor mockDescriptor = mock(DefDescriptor.class);
    	when(mockDescriptor.getPrefix()).thenReturn("java");//java, aura or compound are cachable
    	when(mockDescriptor.getNamespace()).thenReturn("testNs");//not internal
    	when(mockDescriptor.getQualifiedName()).thenReturn("java://testNs:testName");
    	when(mockRegistry.isCacheable()).thenReturn(true);
    	
    	assertThat(impl.isCacheable(mockRegistry, mockDescriptor), equalTo(Boolean.TRUE));
    }
    
    @Test
    public void testIe11DoesntSupportCSSVars() {
        assertFalse(getImpl(new Client(UserAgent.IE11.getUserAgentString())).doesUserAgentSupportCssVars());
    }
    
    @Test
    public void otherBrowsersSupportCSSVars() {
        assertTrue(getImpl(new Client(UserAgent.GOOGLE_CHROME.getUserAgentString())).doesUserAgentSupportCssVars());
        assertTrue(getImpl(new Client(UserAgent.FIREFOX.getUserAgentString())).doesUserAgentSupportCssVars());
        assertTrue(getImpl(new Client(UserAgent.SAFARI5_MAC.getUserAgentString())).doesUserAgentSupportCssVars());
    }

    private ConfigAdapterImpl getImpl(Client client) {
        ContextService contextService = mock(AuraContextServiceImpl.class);
        AuraContext context = mock(AuraContext.class);
        when(contextService.getCurrentContext()).thenReturn(context);
        when(context.getClient()).thenReturn(client);
        return new ConfigAdapterImpl(IOUtil.newTempDir(getName()), instanceService, contextService, fileMonitor);
    }
    
}

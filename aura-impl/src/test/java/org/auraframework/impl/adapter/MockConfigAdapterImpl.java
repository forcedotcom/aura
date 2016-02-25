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
package org.auraframework.impl.adapter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.Aura;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.DefaultContentSecurityPolicy;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.http.CSP;
import org.auraframework.system.AuraContext;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.test.adapter.MockConfigAdapter;
import org.auraframework.test.source.StringSourceLoader;

import com.google.common.collect.ImmutableSortedSet;

/**
 * ConfigAdapter for Aura tests.
 */
public class MockConfigAdapterImpl extends ConfigAdapterImpl implements MockConfigAdapter {

    /**
     * An extension of a ContentSecurityPolicy that adds "odd" test requirements.
     */
    public static class DefaultTestSecurityPolicy implements ContentSecurityPolicy {

        private final ContentSecurityPolicy baseline;

        public DefaultTestSecurityPolicy(ContentSecurityPolicy baseline) {
            this.baseline = baseline;
        }

        @Override
        public String getReportUrl() {
            return baseline.getReportUrl();
        }

        @Override
        public Collection<String> getFrameAncestors() {
            return baseline.getFrameAncestors();
        }

        @Override
        public Collection<String> getFrameSources() {
            return baseline.getFrameSources();
        }

        @Override
        public Collection<String> getScriptSources() {
            List<String> list = (List<String>) baseline.getScriptSources();
            AuraContext context = Aura.getContextService().getCurrentContext();
            if (context != null && context.isTestMode()) {
                list = removeNonceCspEntry(list);
                list.add(CSP.UNSAFE_EVAL);
            }
            return list;
        }

        @Override
        public Collection<String> getStyleSources() {
            List<String> list = (List<String>) baseline.getStyleSources();
            AuraContext context = Aura.getContextService().getCurrentContext();
            if (context != null && context.isTestMode()) {
                list = removeNonceCspEntry(list);
            }
            return list;
        }

        private List<String> removeNonceCspEntry(List<String> csp) {
            for (Iterator<String> iterator = csp.iterator(); iterator.hasNext();) {
                String entry = iterator.next();
                if (entry != null && entry.startsWith("'nonce")) {
                    iterator.remove();
                }
            }
            return csp;
        }

        @Override
        public Collection<String> getFontSources() {
            return baseline.getFontSources();
        }

        @Override
        public Collection<String> getConnectSources() {
            List<String> list = new ArrayList<>(baseline.getConnectSources());
            // Various tests expect extra connect permission
            list.add("http://invalid.salesforce.com");
            list.add("http://offline");
            list.add("https://offline");
            return list;
        }

        @Override
        public Collection<String> getDefaultSources() {
            return baseline.getDefaultSources();
        }

        @Override
        public Collection<String> getObjectSources() {
            return baseline.getObjectSources();
        }

        @Override
        public Collection<String> getImageSources() {
            return baseline.getImageSources();
        }

        @Override
        public Collection<String> getMediaSources() {
            return baseline.getMediaSources();
        }

        @Override
        public String getCspHeaderValue() {
            return DefaultContentSecurityPolicy.buildHeaderNormally(this);
        }
    }

    private static final Set<String> SYSTEM_TEST_NAMESPACES = new ImmutableSortedSet.Builder<>(
            String.CASE_INSENSITIVE_ORDER)
                    .add("auratest", "actionsTest", "attributesTest", "auraStorageTest", "gvpTest", "preloadTest",
                            "clientLibraryTest", "clientApiTest", "clientServiceTest", "componentTest", "docstest",
                            "expressionTest", "forEachDefTest", "forEachTest", "handleEventTest", "ifTest",
                            "iterationTest", "listTest", "loadLevelTest", "perfTest", "performanceTest",
                            "renderingTest", "setAttributesTest", "test", "tokenSanityTest", "uitest", "utilTest",
                            "updateTest", "whitespaceBehaviorTest", "appCache")
                    .build();

    private Boolean isClientAppcacheEnabled = null;
    private Boolean isProduction = null;
    private Boolean isAuraJSStatic = null;
    private Boolean validateCss = null;
    private ContentSecurityPolicy csp;
    private String csrfToken = null;
    private final Set<String> unprivilegedNamespaces = new HashSet<>();
    private Boolean lockerServiceEnabled = null;

    public MockConfigAdapterImpl() {
        super();
    }

    public MockConfigAdapterImpl(String resourceCacheDir) {
        super(resourceCacheDir);
    }

    @Override
    public void reset() {
        isClientAppcacheEnabled = null;
        isProduction = null;
        isAuraJSStatic = null;
        validateCss = null;
        csrfToken = null;
        unprivilegedNamespaces.clear();
        lockerServiceEnabled = null;
    }

    @Override
    public void setIsClientAppcacheEnabled(boolean isClientAppcacheEnabled) {
        this.isClientAppcacheEnabled = isClientAppcacheEnabled;
    }

    @Override
    public boolean isClientAppcacheEnabled() {
        return (isClientAppcacheEnabled == null) ? super.isClientAppcacheEnabled() : isClientAppcacheEnabled;
    }

    @Override
    public void setIsProduction(boolean isProduction) {
        this.isProduction = isProduction;
    }

    @Override
    public boolean isProduction() {
        return (isProduction == null) ? super.isProduction() : isProduction;
    }

    @Override
    public void setIsAuraJSStatic(boolean isAuraJSStatic) {
        this.isAuraJSStatic = isAuraJSStatic;
    }

    @Override
    public boolean isAuraJSStatic() {
        return (isAuraJSStatic == null) ? super.isAuraJSStatic() : isAuraJSStatic;
    }

    @Override
    public void setValidateCss(boolean validateCss) {
        this.validateCss = validateCss;
    }

    @Override
    public boolean validateCss() {
        return (validateCss == null) ? super.validateCss() : validateCss;
    }

    @Override
    public void setContentSecurityPolicy(ContentSecurityPolicy csp) {
        this.csp = csp;
    }

    @Override
    public ContentSecurityPolicy getContentSecurityPolicy(String app, HttpServletRequest request) {
        if (csp != null) {
            return csp;
        }
        ContentSecurityPolicy baseline = super.getContentSecurityPolicy(app, request);
        return new DefaultTestSecurityPolicy(baseline);
    }

    @Override
    public void setUnprivilegedNamespace(String namespace) {
        unprivilegedNamespaces.add(namespace);
    }

    @Override
    public Set<String> getPrivilegedNamespaces() {
        Set<String> namespaces = super.getPrivilegedNamespaces();
        namespaces.removeAll(unprivilegedNamespaces);
        return namespaces;
    }

    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        if (unprivilegedNamespaces.contains(namespace)) {
            return false;
        }

        if (StringSourceLoader.getInstance().isPrivilegedNamespace(namespace)
                || SYSTEM_TEST_NAMESPACES.contains(namespace) || super.isPrivilegedNamespace(namespace)) {
            return true;
        }

        // Check for any local defs with this namespace and consider that as an indicator that we have a privileged
        // namespace
        if (namespace != null) {
            TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
            if (testContextAdapter != null) {
                TestContext testContext = testContextAdapter.getTestContext();
                if (testContext != null) {
                    Set<Definition> localDefs = testContext.getLocalDefs();
                    for (Definition def : localDefs) {
                        DefDescriptor<? extends Definition> defDescriptor = def.getDescriptor();
                        if (defDescriptor != null) {
                            String ns = defDescriptor.getNamespace();
                            if (namespace.equalsIgnoreCase(ns)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    @Override
    public boolean isUnsecuredNamespace(String namespace) {
        return super.isUnsecuredNamespace(namespace) || SYSTEM_TEST_NAMESPACES.contains(namespace);
    }

    @Override
    public void setValidateCSRFTokenException(RuntimeException exception) {
    }

    @Override
    public void setCSRFToken(String token) {
        this.csrfToken = token;
    }

    @Override
    public String getCSRFToken() {
        return (this.csrfToken == null) ? super.getCSRFToken() : this.csrfToken;
    }

    @Override
    public void setLockerServiceEnabled(boolean isLockerServiceEnabled) {
        this.lockerServiceEnabled = isLockerServiceEnabled;
    }

    @Override
    public boolean isLockerServiceEnabled() {
        if (lockerServiceEnabled == null) {
            return super.isLockerServiceEnabled();
        }
        return this.lockerServiceEnabled;
    }
}

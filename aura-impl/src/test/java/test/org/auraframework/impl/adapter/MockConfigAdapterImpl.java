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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Supplier;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.Aura;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.DefaultContentSecurityPolicy;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.http.CSP;
import org.auraframework.system.AuraContext;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.test.adapter.MockConfigAdapter;
import org.auraframework.test.source.StringSourceLoader;
import org.springframework.context.annotation.Primary;

import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Sets;

/**
 * ConfigAdapter for Aura tests.
 */
@ServiceComponent
@Primary
public class MockConfigAdapterImpl extends ConfigAdapterImpl implements MockConfigAdapter {

    @Inject
    StringSourceLoader stringLoader;

    @Inject
    TestContextAdapter testContextAdapter;

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
            AuraContext context = Aura.getContextService().getCurrentContext();
            if (context != null && context.isTestMode()) {
                return  Arrays.asList(CSP.ALL);
            }
            return baseline.getFrameAncestors();
        }

        @Override
        public Collection<String> getFrameSources() {
            return baseline.getFrameSources();
        }

        @Override
        public Collection<String> getScriptSources() {
            List<String> list = (List<String>) baseline.getScriptSources();
            return list;
        }

        @Override
        public Collection<String> getStyleSources() {
            List<String> list = (List<String>) baseline.getStyleSources();
            return list;
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
        public boolean isNonCspInlineEnabled() {
            return baseline.isNonCspInlineEnabled();
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
                            "updateTest", "appCache")
                    .build();

    private static final Set<String> SYSTEM_TEST_PRIVILEGED_NAMESPACES = new ImmutableSortedSet.Builder<>(
            String.CASE_INSENSITIVE_ORDER)
                    .add("privilegedNS", "testPrivilegedNS1", "testPrivilegedNS2")
                    .build();

    private static final Set<String> SYSTEM_TEST_CUSTOM_NAMESPACES = new ImmutableSortedSet.Builder<>(
    		String.CASE_INSENSITIVE_ORDER)
    		.add("testCustomNS1", "testCustomNS2")
                    .build();

    private Boolean isClientAppcacheEnabled = null;
    private Boolean isProduction = null;
    private Boolean isAuraJSStatic = null;
    private Boolean validateCss = null;
    private ContentSecurityPolicy csp;
    private Consumer<String> csrfValidationFunction = null;
    private Supplier<String> csrfTokenFunction = null;
    private Supplier<String> jwtTokenFunction = null;
    private Boolean isLockerServiceEnabledGlobally;
    private Boolean isActionPublicCachingEnabled = null;

    public MockConfigAdapterImpl() {
        super();
    }

    @Override
    public void reset() {
        isClientAppcacheEnabled = null;
        isProduction = null;
        isAuraJSStatic = null;
        validateCss = null;
        csrfValidationFunction = null;
        csrfTokenFunction = null;
        jwtTokenFunction = null;
        isLockerServiceEnabledGlobally = null;
        isActionPublicCachingEnabled = null;
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
    public void setIsProduction(Boolean isProduction) {
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
    public Set<String> getPrivilegedNamespaces() {
        Set<String> namespaces = Sets.newTreeSet(super.getPrivilegedNamespaces());
        namespaces.addAll(SYSTEM_TEST_PRIVILEGED_NAMESPACES);
        return namespaces;
    }

    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        if(stringLoader.isPrivilegedNamespace(namespace) || SYSTEM_TEST_PRIVILEGED_NAMESPACES.contains(namespace)) {
            return true;
        }

        if (super.isPrivilegedNamespace(namespace)) {
            return true;
        }

        return false;
    }

    @Override
    public Set<String> getInternalNamespaces() {
        Set<String> namespaces = Sets.newTreeSet(super.getInternalNamespaces());
        namespaces.removeAll(SYSTEM_TEST_PRIVILEGED_NAMESPACES);
        namespaces.removeAll(SYSTEM_TEST_CUSTOM_NAMESPACES);
        return namespaces;
    }

    @Override
    public boolean isInternalNamespace(String namespace) {
        if(SYSTEM_TEST_CUSTOM_NAMESPACES.contains(namespace) || SYSTEM_TEST_PRIVILEGED_NAMESPACES.contains(namespace)) {
            return false;
        }

        if (stringLoader.isInternalNamespace(namespace)
                || SYSTEM_TEST_NAMESPACES.contains(namespace) || super.isInternalNamespace(namespace)) {
            return true;
        }

        // Check for any local defs with this namespace and consider that as an indicator that we have an internal
        // namespace
        if (namespace != null) {
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
    public void validateCSRFToken(String token) {
        if (this.csrfValidationFunction != null) {
            this.csrfValidationFunction.accept(token);
        } else {
            super.validateCSRFToken(token);
        }
    }

    @Override
    public void setValidateCSRFTokenException(RuntimeException exception) {
        if (exception == null) {
            this.csrfValidationFunction = null;
            return;
        }
        this.setValidateCSRFToken(token -> {
            // Throw only once, since the app should reload and we don't
            // want to throw again on the next calls.
            this.csrfValidationFunction = null;
            throw exception;
        });
    }

    @Override
    public void setValidateCSRFToken(Consumer<String> validationFunction) {
        Consumer<String> value = validationFunction;
        if (validationFunction != null) {
            TestContext expectedTestContext = this.testContextAdapter.getTestContext();
            if (expectedTestContext != null) {
                value = token -> {
                    TestContext testContext = this.testContextAdapter.getTestContext();
                    if (testContext != null && testContext.equals(expectedTestContext)) {
                        validationFunction.accept(token);
                    }
                };
            }
        }

        this.csrfValidationFunction = value;
    }

    @Override
    public void setCSRFToken(String token) {
        this.csrfTokenFunction = () -> token;
    }

    @Override
    public void setCSRFToken(Supplier<String> tokenFunction) {
        this.csrfTokenFunction = tokenFunction;
    }

    @Override
    public String getCSRFToken() {
    	if(this.csrfTokenFunction != null) {
    		return csrfTokenFunction.get();
    	} else {
    		return super.getCSRFToken();
    	}
    }

    @Override
    public String generateJwtToken() {
    	if (this.jwtTokenFunction != null) {
    		return this.jwtTokenFunction.get();
    	} else {
    		return super.generateJwtToken();
    	}
    }

    @Override
    public void setJwtToken(Supplier<String> tokenFunction) {
    	this.jwtTokenFunction = tokenFunction;
    }

    @Override
    public void setLockerServiceEnabled(boolean enabled) {
        isLockerServiceEnabledGlobally = enabled;
    }

    @Override
    public boolean isLockerServiceEnabled() {
        return (isLockerServiceEnabledGlobally == null) ? super.isLockerServiceEnabled() : isLockerServiceEnabledGlobally;
    }

    @Override
    public void setActionPublicCachingEnabled(boolean enabled) {
        isActionPublicCachingEnabled = enabled;
    }

    @Override
    public boolean isActionPublicCachingEnabled() {
        if (isActionPublicCachingEnabled != null) {
            return isActionPublicCachingEnabled;
        }

        if (testContextAdapter.getTestContext() != null) {
            // needed to test action caching in jstests
            return true;
        }

        return super.isActionPublicCachingEnabled();
    }
}

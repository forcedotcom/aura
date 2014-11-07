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
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.Aura;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.DefaultContentSecurityPolicy;
import org.auraframework.adapter.MockConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;

import com.google.common.collect.ImmutableSortedSet;

/**
 * ConfigAdapter for Aura tests.
 * 
 * 
 * @since 0.0.178
 */
public class MockConfigAdapterImpl extends ConfigAdapterImpl implements MockConfigAdapter {

    /**
     * An extension of a ContentSecurityPolicy that adds "odd" test requirements.
     */
    public static class DefaultTestSecurityPolicy implements ContentSecurityPolicy {

        private ContentSecurityPolicy baseline;

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
            return baseline.getFrameAncestors();
        }

        @Override
        public Collection<String> getScriptSources() {
            return baseline.getScriptSources();
        }

        @Override
        public Collection<String> getStyleSources() {
            return baseline.getStyleSources();
        }

        @Override
        public Collection<String> getFontSources() {
            return baseline.getFontSources();
        }

        @Override
        public Collection<String> getConnectSources() {
            List<String> list = new ArrayList<String>(baseline.getConnectSources());
            // Various tests expect extra connect permission
            list.add("http://invalid.salesforce.com");
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

    private static final Set<String> SYSTEM_TEST_NAMESPACES = new ImmutableSortedSet.Builder<>(String.CASE_INSENSITIVE_ORDER).add(
    		"auratest", "actionsTest", "attributesTest", "auraStorageTest", "gvpTest", "preloadTest", "clientLibraryTest", "clientApiTest", 
    	"clientServiceTest", "componentTest", "docstest", "expressionTest", "forEachDefTest", "forEachTest", "handleEventTest", "ifTest", "iterationTest", 
    	"layoutServiceTest", "listTest", "loadLevelTest", "perfTest", "performanceTest", "renderingTest", "setAttributesTest", "test", "themeSanityTest", "uitest", "utilTest",
    	"updateTest", "whitespaceBehaviorTest", "appCache").build();

    
    private Boolean isClientAppcacheEnabled = null;
    private Boolean isProduction = null;
    private Boolean isAuraJSStatic = null;
    private Boolean validateCss = null;
    private ContentSecurityPolicy csp;

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
	public boolean isPrivilegedNamespace(String namespace) {
		if (StringSourceLoader.getInstance().isPrivilegedNamespace(namespace) || SYSTEM_TEST_NAMESPACES.contains(namespace) || super.isPrivilegedNamespace(namespace)) {
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
                    	if(defDescriptor!=null) {
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
}

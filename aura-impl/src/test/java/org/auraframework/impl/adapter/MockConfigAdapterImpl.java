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

import java.util.Set;

import org.auraframework.adapter.MockConfigAdapter;
import org.auraframework.impl.source.StringSourceLoader;

import com.google.common.collect.ImmutableSortedSet;

/**
 * ConfigAdapter for Aura tests.
 * 
 * 
 * @since 0.0.178
 */
public class MockConfigAdapterImpl extends ConfigAdapterImpl implements MockConfigAdapter {
    private static final Set<String> SYSTEM_TEST_NAMESPACES = new ImmutableSortedSet.Builder<String>(String.CASE_INSENSITIVE_ORDER).add(
    		"auradev", "auratest", "actionsTest", "appCache", "attributesTest", "auraStorageTest", "gvpTest", "preloadTest", "clientLibraryTest", "clientApiTest", 
    	"clientServiceTest", "cmpQueryLanguage", "componentTest", "docstest", "expressionTest", "forEachDefTest", "forEachTest", "handleEventTest", "ifTest", "iterationTest", 
    	"layoutServiceTest", "listTest", "loadLevelTest", "performanceTest", "provider", "renderingTest", "setAttributesTest", "test", "themeSanityTest", "uitest", "utilTest", 
    	"updateTest", "valueChange", "whitespaceBehaviorTest").build();

    
    private Boolean isClientAppcacheEnabled = null;
    private Boolean isProduction = null;
    private Boolean isAuraJSStatic = null;
    private Boolean validateCss = null;

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
	public boolean isPrivilegedNamespace(String namespace) {
		Set<String> namespaces = StringSourceLoader.getInstance().getNamespaces();
		return namespaces.contains(namespace) || SYSTEM_TEST_NAMESPACES.contains(namespace) || super.isPrivilegedNamespace(namespace);
	}

	@Override
	public boolean isUnsecuredNamespace(String namespace) {
		Set<String> namespaces = StringSourceLoader.getInstance().getNamespaces();
		return namespaces.contains(namespace) || SYSTEM_TEST_NAMESPACES.contains(namespace) || super.isUnsecuredNamespace(namespace);
	}
}

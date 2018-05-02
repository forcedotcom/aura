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
package org.auraframework.adapter;

import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.auraframework.util.resource.ResourceLoader;

public interface ConfigAdapter extends AuraAdapter {
    boolean isTestAllowed();

    boolean isProduction();

    boolean isFileMonitorEnabled();

    Set<Mode> getAvailableModes();

    Mode getDefaultMode();

    String getAuraJSURL();

    /** Returns a string to identify this unique version of the Aura framework. */
    String getAuraFrameworkNonce();

    String getCSRFToken();

    void validateCSRFToken(String token);

    ResourceLoader getResourceLoader();

    void regenerateAuraJS();

    boolean isClientAppcacheEnabled();

    long getAuraJSLastMod();

    long getBuildTimestamp();

    String getAuraVersion();

    boolean isAuraJSStatic();

    boolean validateCss();

    /**
     * SessionCacheKey is a key that is used for caches that are based typically per customer basis.
     * if this returns null, it mean that caches that uses this key will not be active.
     *
     * @return a String, may be null
     */
    String getSessionCacheKey();

    /**
     * Returns reset css file url
     * @return URL to reset css file
     */
    String getResetCssURL();

    /**
     * Returns URL of GET request for encryption key
     * @return URL for encryption key
     */
    String getEncryptionKeyURL(Boolean jsFormat);

    /**
     * Returns the encryption key for the Crypto Adapter. The key must be a
     * JSON parseable array of numbers.
     * @return encryption key
     */
    String getEncryptionKey();

    /**
     * Returns the token for bootstrap resources
     * @return a token
     */
    String generateJwtToken();

    /**
     * Validate the app.encryptionkey request
     *
     * @return true if the request has a valid jwt token.
     */
    boolean validateGetEncryptionKey(String ssid);

    /**
     * Validate the inline.js request
     *
     * @return true if the request has a valid jwt token.
     */
    boolean validateBootstrap(String ssid);

    boolean isInternalNamespace(String namespace);
    Set<String> getInternalNamespaces();
    void addInternalNamespace(String namespace);
    void removeInternalNamespace(String namespace);
    Map<String, String> getInternalNamespacesMap();

    boolean isPrivilegedNamespace(String namespace);
    Set<String> getPrivilegedNamespaces();
    void addPrivilegedNamespace(String namespace);
    void removePrivilegedNamespace(String namespace);

    String getDefaultNamespace();

    boolean isUnsecuredPrefix(String prefix);

    @Deprecated
    boolean isUnsecuredNamespace(String namespace);

    boolean isDocumentedNamespace(String namespace);

    /**
     * check if a prefix is cacheable.
     *
     * @deprecated use one of the other cacheable calls.
     */
    @Deprecated
    boolean isCacheablePrefix(String prefix);

    /**
     * Check if a descriptor filter should be cached.
     *
     * @param filter the filter to check.
     * @return true if the filter can be cached.
     */
    boolean isCacheable(DescriptorFilter filter);

    /**
     * Check if a descriptor is cacheable.
     *
     * @param registry the registry for the descriptor.
     * @param descriptor the descriptor to check.
     * @return true if the descriptor is cacheable.
     */
    boolean isCacheable(DefRegistry registry, DefDescriptor<?> descriptor);

    /**
     * Gets the Content-Security-Policy and X-FRAME-OPTION whitelist for a
     * given app.  The returned object describes most of what could go into
     * a Content-Security-Policy header, although at time of writing only
     * {@code frame-src} is used.
     *
     * @param app the fully-qualified descriptor string for the app
     * @param request the HTTP request, for checking URI, authenticated user, etc.
     * @return {@code null} to avoid using Content-Security-Policy and X-FRAME-OPTIONS
     *    headers entirely.  Or a {@link ContentSecurityPolicy} object describing the
     *    actual policy desired.
     */
    ContentSecurityPolicy getContentSecurityPolicy(String app, HttpServletRequest request);

    boolean isLockerServiceEnabled();
    boolean requireLocker(RootDefinition def);

    /**
     * Is strict CSP policy enforced:
     *  1. Allow unsafe-eval
     *  2. No unsafe-inline
     * @return
     */
    boolean isStrictCSPEnforced();

    /**
     * Is frozen realm policy enabled: freezing object properties.
     * @return
     */
    boolean isFrozenRealmEnabled();

    /**
     * If true bootstrap.js will not be served but rather it's contents rendered inline (or inline.js as a fallback)
     * @return
     */
    boolean isBootstrapInliningEnabled();

    /**
     * If false then models will not be included in the application instance used when bootstrapping
     * @return
     */
    boolean isBootstrapModelExclusionEnabled();

    /**
     * @return max number of parallel XHRs used to execute server actions, must be 2 or more
     */
    int getMaxParallelXHRCount();

    /**
     * @return whether to use one XHR to send each action (use with HTTP/2 only)
     */
    boolean getXHRExclusivity();

    boolean cdnEnabled();

    /**
     * @return URL with scheme and host, no trailing slash.
     */
    String getCDNDomain();

    /**
     * Module namespace aliases
     *
     * @return map of a module namespace aliases
     */
    Map<String, String> getModuleNamespaceAliases();

    /**
     * Checks whether module is allowed to be used in components
     * that are not internal
     *
     * @param namespace module namespace to check
     * @param name      module name to check
     * @return whether module is allowed by non internal components
     */
    boolean isAllowedModule(String namespace, String name);

    /**
     * @return if public caching of actions is enabled
     */
    boolean isActionPublicCachingEnabled();

    /**
     * @return Cache key to add to the context for action public caching.
     */
    String getActionPublicCacheKey();

    /**
     * @return factory for the nodejs service
     */
    NodeLambdaFactory nodeServiceFactory();
    
    boolean uriAddressableDefsEnabled();

    boolean isSecureRequest(HttpServletRequest request);

    /**
     * Required module services.
     * @return set of require module services
     */
    Set<String> getRequiredServices();

    /**
     * CSP Report Uri.
     * @return the report-uri for CSP directives
     */
    String getCSPReportUri();
}

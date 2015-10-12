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

import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.resource.ResourceLoader;

public interface ConfigAdapter extends AuraAdapter {

    boolean isTestAllowed();

    boolean isProduction();

    boolean isSysAdmin();

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

    String getHTML5ShivURL();

    String getAvailableTimezone(String timezone);

    /**
     * Returns js libs file url
     * @return url of js libs file
     */
    String getJSLibsURL();

    /**
     * Returns reset css file url
     * @return URL to reset css file
     */
    String getResetCssURL();

    /**
     * Returns URL of GET request for encryption key
     * @return URL for encryption key
     */
    String getEncryptionKeyURL();

    /**
     * Returns the encryption key for the Crypto Adapter. The key must be a
     * JSON parseable array of numbers.
     * @return encryption key
     */
    String getEncryptionKey();

    boolean isPrivilegedNamespace(String namespace);
    Set<String> getPrivilegedNamespaces();
    String getDefaultNamespace();
	boolean isUnsecuredPrefix(String prefix);

	@Deprecated
	boolean isUnsecuredNamespace(String namespace);

	void addPrivilegedNamespace(String namespace);
	void removePrivilegedNamespace(String namespace);

	boolean isDocumentedNamespace(String namespace);

	boolean isCacheablePrefix(String prefix);

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
}

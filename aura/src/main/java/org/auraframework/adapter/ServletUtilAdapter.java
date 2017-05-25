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

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.AuraResource;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;

public interface ServletUtilAdapter extends AuraAdapter {
    String AURA_PREFIX = "aura.";
    String CSRF_PROTECT = "while(1);\n";

    /**
     * Hook at the beginning of any resource request.
     *
     * This hook will be called after the initial search for a resource to allow the function to do any special
     * processing based on the resource.
     *
     * @param request the incoming request.
     * @param response the outgoing response.
     * @param resource the resource that we are handling.
     * @return false if the request has already been handled
     */
    boolean resourceServletGetPre(HttpServletRequest request, HttpServletResponse response, AuraResource resource);

    /**
     * Hook for the beginning of 'GET' action requests.
     *
     * @param request the incoming request.
     * @param response the outgoeing response
     * @return false if the request has already been handled
     */
    boolean actionServletGetPre(HttpServletRequest request, HttpServletResponse response) throws IOException;

    /**
     * Hook for the beginning of 'POST' action requests.
     *
     * @param request the incoming request.
     * @param response the outgoeing response
     * @return false if the request has already been handled
     */
    boolean actionServletPostPre(HttpServletRequest request, HttpServletResponse response) throws IOException;

    /**
     * Handle a servlet execption as well as we can.
     *
     * @param t the exception thrown.
     * @param quickfix are we in the middle of writing a quickfix.
     * @param context the current aura context
     * @param request the http request.
     * @param response the http response
     * @param written have we already written to the response.
     */
    void handleServletException(Throwable t, boolean quickfix, AuraContext context, HttpServletRequest request, HttpServletResponse response,
            boolean written) throws IOException;

    /**
     * Send a 404 page to the client.
     */
    void send404(ServletContext servletContext, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

    /**
     * Get the full set of scripts for the current context.
     *
     * @param context the aura context to use.
     * @param safeInlineJs should we include 'inline.js' to allow for CSP protection?
     * @param ignoreNonCacheableScripts Flag to ignore scripts that are dynamic so we don't potentially cache them such as bootstrap.js
     * This parameter will mostly be false but for calls from manifest or other caching calls alike.
     * @return the list of scripts.
     */
    List<String> getScripts(AuraContext context, boolean safeInlineJs, boolean ignoreNonCacheableScripts, Map<String,Object> attributes)
        throws QuickFixException;

    /**
     * Get the manifest url.
     */
    String getManifestUrl(AuraContext context, Map<String,Object> attributes);

    /**
     * Write all urls on the string builder
     *
     * @param context the aura context to use.
     * @param componentAttributes Component attributes.
     * @param sb the string builder to use.
     */
    @Deprecated
    void writeScriptUrls(AuraContext context, Map<String, Object> componentAttributes, StringBuilder sb) throws QuickFixException, IOException;

    /**
     * Write all urls on the string builder
     * @param context the aura context to use.
     * @param templateDef
     * @param componentAttributes Component attributes.
     * @param sb the string builder to use.
     */
    void writeScriptUrls(AuraContext context, ComponentDef templateDef, Map<String, Object> componentAttributes, StringBuilder sb) throws QuickFixException, IOException;

    /**
     * Get bootstrap url.
     */

    String getBootstrapUrl(AuraContext context, Map<String,Object> attributes);

    /**
     * Get inline.js url.
     */

    String getInlineJsUrl(AuraContext context, Map<String,Object> attributes);

    /**
     * get the inline js content
     * @param context
     * @param templateDef
     * @return the script content
     */
    String getInlineJs(AuraContext context, ComponentDef templateDef) throws IOException;

    /**
     * Get app.js url.
     */
    String getAppJsUrl(AuraContext context, Map<String, Object> attributes);

    /**
     * Get app.css url.
     */
    String getAppCssUrl(AuraContext context);

    /**
     * Get JS client libraries urls
     */
    List<String> getJsClientLibraryUrls (AuraContext context) throws QuickFixException;

    /**
     * Get CSS client libraries urls
     */
    List<String> getCssClientLibraryUrls (AuraContext context) throws QuickFixException;

    /**
     * Get aura framework
     */
    String getFrameworkUrl();

    /**
     * Get the full set of styles for the current context.
     *
     * @param context the aura context to use.
     * @return the list of css includes
     */

    List<String> getStyles(AuraContext context) throws QuickFixException;

    /**
     * Get the base set of scripts for the current context.
     *
     * @param context the aura context to use.
     * @return the list of scripts.
     */
    List<String> getBaseScripts(AuraContext context, Map<String,Object> attributes) throws QuickFixException;

    /**
     * Get the framework scripts for the current application.
     *
     * @param context the aura context to use.
     * @param safeInlineJs should we include 'inline.js' to allow for CSP protection?
     * @return the list of scripts.
     */
    List<String> getFrameworkScripts(AuraContext context, boolean safeInlineJs, boolean ignoreBootstrap, Map<String,Object> attributes)
        throws QuickFixException;

    List<String> getFrameworkFallbackScripts(AuraContext context, boolean safeInlineJs, Map<String,Object> attributes)
            throws QuickFixException;

    /**
     * Force a page to not be cached.
     *
     * This probably does not need to be overridden, but fits with the remaining functionality here.
     */
    void setNoCache(HttpServletResponse response);

    /**
     * Set a page to be cached for a 'short' period.
     */
    void setShortCache(HttpServletResponse response);

    /**
     * Set a page to cache for a 'long' time.
     */
    void setLongCache(HttpServletResponse response);

    /**
     * Set cache timeout for a resource in seconds.
     */
    void setCacheTimeout(HttpServletResponse response, long expiration);

    /**
     * are we in production mode?
     */
    boolean isProductionMode(Mode mode);

    /**
     * Setup basic security headers.
     */
    void setCSPHeaders(DefDescriptor<?> top, HttpServletRequest req, HttpServletResponse rsp);

    /**
     * Get a content type for a format.
     */
    String getContentType(Format format);

    /**
     * Check if retrieving a def type is valid for a given mode.
     */
    boolean isValidDefType(DefType defType, Mode mode);

    Set<DefDescriptor<?>> verifyTopLevel(HttpServletRequest request, HttpServletResponse response,
            AuraContext context) throws IOException;

    void checkFrameworkUID(AuraContext context) throws ClientOutOfSyncException;
}

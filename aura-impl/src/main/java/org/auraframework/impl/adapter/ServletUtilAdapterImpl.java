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

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.http.CSP;
import org.auraframework.http.ManifestUtil;
import org.auraframework.http.resource.InlineJSAppender;
import org.auraframework.impl.java.controller.JavaActionDef;
import org.auraframework.impl.util.BrowserUserAgent;
import org.auraframework.impl.util.TemplateUtil;
import org.auraframework.impl.util.TemplateUtil.Script;
import org.auraframework.impl.util.UserAgent;
import org.auraframework.instance.Action;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.CSPInliningService.InlineScriptMode;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.AuraResource;
import org.auraframework.system.Message;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.common.base.MoreObjects;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

@ServiceComponent
public class ServletUtilAdapterImpl implements ServletUtilAdapter {
    private ExceptionAdapter exceptionAdapter;
    private SerializationService serializationService;
    private ClientLibraryService clientLibraryService;
    protected ContextService contextService;
    protected ConfigAdapter configAdapter;
    protected TemplateUtil templateUtil = new TemplateUtil();
    protected DefinitionService definitionService;
    protected ManifestUtil manifestUtil;
    protected List<InlineJSAppender> inlineJsAppenders;
    protected CSPInliningService cspInliningService;

    /**
     * "Short" pages (such as manifest cookies and AuraFrameworkServlet pages) expire in 1 day.
     */
    protected static final long SHORT_EXPIRE_SECONDS = 24L * 60 * 60;
    protected static final long SHORT_EXPIRE = SHORT_EXPIRE_SECONDS * 1000;

    /**
     * "Long" pages (such as resources and cached HTML templates) expire in 45 days. We also use this to "pre-expire"
     * no-cache pages, setting their expiration a month and a half into the past for user agents that don't understand
     * Cache-Control: no-cache.
     * Same as auraBaseServlet.java
     */
    protected static final long LONG_EXPIRE = 45 * SHORT_EXPIRE;
    protected static final String UTF_ENCODING = "UTF-8";
    protected static final String HTML_CONTENT_TYPE = "text/html";
    protected static final String JAVASCRIPT_CONTENT_TYPE = "text/javascript";
    protected static final String MANIFEST_CONTENT_TYPE = "text/cache-manifest";
    protected static final String CSS_CONTENT_TYPE = "text/css";
    protected static final String SVG_CONTENT_TYPE = "image/svg+xml";

    /** Clickjack protection HTTP header */
    protected static final String HDR_FRAME_OPTIONS = "X-FRAME-OPTIONS";
    /** Baseline clickjack protection level for HDR_FRAME_OPTIONS header */
    protected static final String HDR_FRAME_SAMEORIGIN = "SAMEORIGIN";
    /** No-framing-at-all clickjack protection level for HDR_FRAME_OPTIONS header */
    protected static final String HDR_FRAME_DENY = "DENY";
    /** Limited access for HDR_FRAME_OPTIONS */
    protected static final String HDR_FRAME_ALLOWFROM = "ALLOW-FROM ";
    /**
     * Semi-standard HDR_FRAME_OPTIONS to have no restrictions.  Used because no
     * header at all is taken as an invitation for filters to add their own ideas.
     */
    protected static final String HDR_FRAME_ALLOWALL = "ALLOWALL";

    @PostConstruct
    public void createManifestUtil() {
        this.manifestUtil = new ManifestUtil(definitionService, contextService, configAdapter);
    }

    /**
     * Handle an exception in the servlet.
     *
     * This routine should be called whenever an exception has surfaced to the top level of the servlet. It should not be
     * overridden unless Aura is entirely subsumed. Most special cases can be handled by the Aura user by implementing
     * {@link ExceptionAdapter ExceptionAdapter}.
     *
     * @param t the throwable to write out.
     * @param quickfix is this exception a valid quick-fix
     * @param context the aura context.
     * @param request the request.
     * @param response the response.
     * @param written true if we have started writing to the output stream.
     * @throws IOException if the output stream does.
     * @throws ServletException if send404 does (should not generally happen).
     */
    @Override
    public void handleServletException(Throwable t, boolean quickfix, AuraContext context,
            HttpServletRequest request, HttpServletResponse response,
            boolean written) throws IOException {
        Throwable mappedEx = t;
        PrintWriter out = null;
        Format format = context.getFormat();
        boolean map = true;
        int status = 0;

        // First try to set up the status.
        try {
            //
            // First, we make sure we get the status correct.
            //
            status = response.getStatus();
            if (format == Format.JS) {
                // send 500 by default
                status = HttpStatus.SC_INTERNAL_SERVER_ERROR;
                if (!manifestUtil.isManifestEnabled()) {
                    // if browser applicationCache is disabled then send 200 with javascript exception code below
                    status = HttpStatus.SC_OK;
                }
            } else if (format == Format.CSS) {
                status = HttpStatus.SC_INTERNAL_SERVER_ERROR;
            }
            response.setStatus(status);

            // never ever do we want to cache a error response, even if it's a "success" response for the exception
            setNoCache(response);
        } catch (Throwable failStatus) {
            try {
                exceptionAdapter.handleException(failStatus);
            } catch (Throwable doubleFail) {
                // totally ignore. This should never fail.
            }
            try {
                // Is this correct? We probably failed to set no cache headers, so maybe
                // we want to blow away the status to avoid caching anywhere.
                if (status == HttpStatus.SC_OK) {
                    response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                }
            } catch (Throwable doubleFail) {
                // totally ignore. If this fails, it likely failed above as well.
            }
        }

        if (t instanceof IOException) {
            this.contextService.endContext();
            throw (IOException)t;
        }

        try {
            //
            // If we have written out data, We are kinda toast in this case.
            // We really want to roll it all back, but we can't, so we opt
            // for the best we can do. For HTML we can do nothing at all.
            //
            if (format == Format.JSON) {
                out = response.getWriter();
                if (!written) {
                    out.write(CSRF_PROTECT);
                }
                //
                // If an exception happened while we were emitting JSON, we want the
                // client to ignore the now-corrupt data structure. 404s and 500s
                // cause the client to prepend /*, so we can effectively erase the
                // bad data by appending a */ here and then serializing the exception
                // info.
                //
                out.write("*/");
            }
        } catch (Throwable failToClose) {
            // ignore again. If we can't write out the JSON closer, we are pretty much hosed,
            // but in all likelihood we just can't write to the stream.
        }

        try {
            if (mappedEx instanceof NoAccessException) {
                Throwable cause = mappedEx.getCause();
                String denyMessage = mappedEx.getMessage();

                map = false;
                if (cause != null) {
                    //
                    // Note that the exception handler can remap the cause here.
                    //
                    cause = exceptionAdapter.handleException(cause);
                    denyMessage += ": cause = " + cause.getMessage();
                }
                //
                // Is this correct?!?!?!
                // Almost certainly not...
                //
                if (format != Format.JSON) {
                    this.send404(request.getServletContext(), request, response);
                    if (!isProductionMode(context.getMode())) {
                        // Preserve new lines and tabs in the stacktrace since this is directly being written on to the
                        // page
                        denyMessage = "<pre>" + AuraTextUtil.escapeForHTML(denyMessage) + "</pre>";
                        response.getWriter().println(denyMessage);
                    }
                    return;
                }
            } else if (mappedEx instanceof DefinitionNotFoundException && isProductionMode(context.getMode())
                    && format == Format.HTML) {
                DefDescriptor<? extends BaseComponentDef> appDescriptor = context.getApplicationDescriptor();
                if (appDescriptor != null && appDescriptor.equals(((DefinitionNotFoundException) mappedEx).getDescriptor())) {
                    // We're in production and tried to hit an aura app that doesn't exist.
                    // just show the standard 404 page.
                    this.send404(request.getServletContext(), request, response);
                    return;
                }
            }

            if (map) {
                mappedEx = exceptionAdapter.handleException(mappedEx);
            }

            if (out == null) {
                out = response.getWriter();
            }

            if (format == Format.JSON || format == Format.HTML || format == Format.JS || format == Format.CSS) {
                //
                // We only write out exceptions for HTML or JSON.
                // Seems bogus, but here it is.
                //
                // Start out by cleaning out some settings to ensure we don't
                // check too many things, leading to a circular failure. Note
                // that this is still a bit dangerous, as we seem to have a lot
                // of magic in the serializer.
                //
                // Clear the InstanceStack before trying to serialize the exception since the Throwable has likely
                // rendered the stack inaccurate, and may falsely trigger NoAccessExceptions.
                InstanceStack stack = context.getInstanceStack();
                List<String> list = stack.getStackInfo();
                for (int count = list.size(); count > 0; count--) {
                    stack.popInstance(stack.peek());
                }

                serializationService.write(mappedEx, null, out);
                if (format == Format.JSON) {
                    out.write("/*ERROR*/");
                }
            }
        } catch (IOException ioe) {
            throw ioe;
        } catch (Throwable death) {
            //
            // Catch any other exception and log it. This is actually kinda bad, because something has
            // gone horribly wrong. We should write out some sort of generic page other than a 404,
            // but at this point, it is unclear what we can do, as stuff is breaking right and left.
            //
            try {
                exceptionAdapter.handleException(death);
                if (!isProductionMode(context.getMode())) {
                    response.getWriter().println(death.getMessage());
                }
            } catch (IOException ioe) {
                throw ioe;
            } catch (Throwable doubleDeath) {
                // we are totally hosed.
                // We can't even guarantee that this will work...
                try {
                    if (!isProductionMode(context.getMode())) {
                        response.getWriter().println(doubleDeath.getMessage());
                    }
                } catch (Throwable tripleDeath) {
                    // totally ignore, as we have run out of options.
                }
            }
        } finally {
            this.contextService.endContext();
        }
    }

    @Override
    public void send404(ServletContext servletContext, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.getWriter().println("404 Not Found"
                + "<!-- Extra text so IE will display our custom 404 page -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->"
                + "<!--                                                   -->");
        this.contextService.endContext();
    }

    @Override
    public List<String> getScripts(AuraContext context, boolean safeInlineJs, boolean ignoreNonCacheableScripts, Map<String,Object> attributes)
            throws QuickFixException {
        List<String> ret = Lists.newArrayList();
        // Client libraries
        ret.addAll(getJsClientLibraryUrls(context));
        ret.addAll(getBaseScripts(context, attributes));
        ret.addAll(getFrameworkScripts(context, safeInlineJs, ignoreNonCacheableScripts, attributes));
        return ret;
    }

    @Override
    public List<String> getStyles(AuraContext context) throws QuickFixException {
        Set<String> ret = Sets.newLinkedHashSet();

        // Add css client libraries
        ret.addAll(getCssClientLibraryUrls(context));
        ret.add(getAppCssUrl(context));

        return new ArrayList<>(ret);
    }

    /**
     * Gets all client libraries specified. Uses client library service to resolve any urls that weren't specified.
     * Returns list of non empty client library urls.
     *
     *
     * @param context aura context
     * @param type CSS or JS
     * @return list of urls for client libraries
     */
    private List<String> getClientLibraryUrls(AuraContext context, ClientLibraryDef.Type type)
            throws QuickFixException {
        return new ArrayList<>(clientLibraryService.getUrls(context, type));
    }

    /**
     * Gets all client libraries specified. Uses client library service to resolve any urls that weren't specified.
     * Returns list of non empty client library urls.
     *
     *
     * @param context aura context
     * @param type CSS or JS
     * @return list of urls for client libraries
     */
    private List<String> getClientLibraryJSPrefetchUrls(AuraContext context)
            throws QuickFixException {
        return new ArrayList<>(clientLibraryService.getPrefetchUrls(context, ClientLibraryDef.Type.JS));
    }

    /**
     * Get the set of base scripts for a context.
     */
    @Override
    public List<String> getBaseScripts(AuraContext context, Map<String,Object> attributes) throws QuickFixException {
        Set<String> ret = Sets.newLinkedHashSet();

        // Aura framework
        ret.add(getFrameworkUrl());

        return new ArrayList<>(ret);
    }

    @Override
    public List<String> getFrameworkScripts(AuraContext context, boolean safeInlineJs, boolean ignoreNonCacheableScripts, Map<String,Object> attributes)
        throws QuickFixException {
        List<String> ret = Lists.newArrayList();

        if (safeInlineJs && !ignoreNonCacheableScripts && cspInliningService.getInlineMode() == InlineScriptMode.UNSUPPORTED) {
            ret.add(getInlineJsUrl(context, attributes));
        }

        if (context.isAppJsSplitEnabled()) {
            ret.add(getAppCoreJsUrl(context, null));
        }

        ret.add(getAppJsUrl(context, null));

        if (!ignoreNonCacheableScripts) {
            ret.add(getBootstrapUrl(context, attributes));
        }


        return ret;
    }

    @Override
    public List<String> getFrameworkFallbackScripts(AuraContext context, boolean safeInlineJs, Map<String,Object> attributes)
        throws QuickFixException {
        List<String> ret = Lists.newArrayList();
        return ret;
    }

    @Override
    public List <String> getJsClientLibraryUrls(AuraContext context) throws QuickFixException {
        return getClientLibraryUrls(context, ClientLibraryDef.Type.JS);
    }

    @Override
    public List <String> getJsPrefetchUrls(AuraContext context) throws QuickFixException {
        return getClientLibraryJSPrefetchUrls(context);
    }

	@Override
	public List<String> getCssPreloadUrls(AuraContext context) throws QuickFixException {
		return Arrays.asList(this.getAppCssUrl(context));
	}

	@Override
	public List<String> getJsPreloadUrls(AuraContext context) throws QuickFixException {
		final List<String> urls = Lists.newArrayList();
		if(context.isAppJsSplitEnabled()) {
			urls.add(this.getAppJsUrl(context, null));
			urls.add(this.getAppCoreJsUrl(context, null));
		} else {
			urls.add(this.getAppJsUrl(context, null));
		}
		return urls;
	}

    @Override
    @Deprecated
    public void writeScriptUrls(AuraContext context, Map<String, Object> componentAttributes, StringBuilder sb) throws QuickFixException, IOException {
            writeScriptUrls(context, null, componentAttributes, sb);
    }

    @Override
    public void writeScriptUrls(AuraContext context, BaseComponentDef def, Map<String, Object> componentAttributes, StringBuilder sb) throws QuickFixException, IOException {
        templateUtil.writeHtmlScripts(context, this.getJsClientLibraryUrls(context), Script.LAZY, sb);

        if (cspInliningService.getInlineMode() != InlineScriptMode.UNSUPPORTED && def != null) {
            cspInliningService.writeInlineScript(this.getInlineJs(context, def), sb);
        } else {
            templateUtil.writeHtmlScript(context, this.getInlineJsUrl(context, componentAttributes), Script.SYNC, sb);
        }

        templateUtil.writeHtmlScript(context, this.getFrameworkUrl(), Script.SYNC, sb);
        if (context.isAppJsSplitEnabled()) {
            templateUtil.writeHtmlScript(context, this.getAppCoreJsUrl(context, null), Script.SYNC, sb);
        }

        templateUtil.writeHtmlScript(context, this.getAppJsUrl(context, null), Script.SYNC, sb);
        if (!configAdapter.isBootstrapInliningEnabled()) {
            templateUtil.writeHtmlScript(context, this.getBootstrapUrl(context, componentAttributes), Script.SYNC, sb);
        }
    }

    public String getInteropEngineUrl(AuraContext context) {
        return clientLibraryService.getResolverRegistry().get("engine", Type.JS).getUrl();
    }

    @Override
    public List <String> getCssClientLibraryUrls (AuraContext context) throws QuickFixException {
        return new ArrayList<>(getClientLibraryUrls(context, ClientLibraryDef.Type.CSS));
    }

    @Override
    public String getFrameworkUrl() {
        return configAdapter.getAuraJSURL();
    }


    private void addAttributes(StringBuilder builder, Map<String,Object> attributes) {
        //
        // This feels a lot like a hack.
        //
        if (attributes != null && !attributes.isEmpty()) {
            builder.append("?aura.attributes=");
            builder.append(AuraTextUtil.urlencode(JsonEncoder.serialize(attributes, false)));
        }
    }
    /**
     * Get the set of base scripts for a context.
     */
    @Override
    public String getBootstrapUrl(AuraContext context, Map<String,Object> attributes) {
        String ret = commonJsUrl("/bootstrap.js", context, attributes);
        ret += ret.endsWith("bootstrap.js") ? "?jwt=" : "&jwt=";
        ret += configAdapter.generateJwtToken();
        return ret;
    }

    @Override
    public String getInlineJs(AuraContext context, BaseComponentDef def) throws IOException {
        StringBuilder out = new StringBuilder();
        for(InlineJSAppender appender : MoreObjects.firstNonNull(inlineJsAppenders, ImmutableList.<InlineJSAppender>of())){
            appender.append(def, context, out);
        }
        return out.toString();
    }

    @Override
    public String getInlineJsUrl(AuraContext context, Map<String,Object> attributes) {
        String ret = commonJsUrl("/inline.js", context, attributes);

        // The way we render the appcache manifest does not handle the ampersand in urls. For appcached apps, we don't
        // need the token in inline anyways.
        if (!manifestUtil.isManifestEnabled()) {
            ret += ret.endsWith("inline.js") ? "?jwt=" : "&jwt=";
            ret += configAdapter.generateJwtToken();
        }
        return ret;
    }

    @Override
    public String getAppCoreJsUrl(AuraContext context, Map<String,Object> attributes) {
        return commonJsUrl("/appcore.js", context, attributes, AuraContext.EncodingStyle.AppResource);
    }

    @Override
    public String getAppJsUrl(AuraContext context, Map<String,Object> attributes) {
        return commonJsUrl("/app.js", context, attributes, AuraContext.EncodingStyle.AppResource);
    }

    @Override
    public String getAppCssUrl(AuraContext context) {
        String contextPath = context.getContextPath();
        StringBuilder defs = new StringBuilder(contextPath).append("/l/");
        defs.append(context.getEncodedURL(AuraContext.EncodingStyle.Css));
        defs.append("/app.css");
        return defs.toString();
    }

    protected String commonJsUrl (String filepath, AuraContext context, Map<String,Object> attributes) {
        return commonJsUrl(filepath, context, attributes, AuraContext.EncodingStyle.Normal);
    }

    protected String commonJsUrl (String filepath, AuraContext context, Map<String,Object> attributes, AuraContext.EncodingStyle encodingStyle) {
        StringBuilder url = new StringBuilder(context.getContextPath()).append("/l/");
        url.append(context.getEncodedURL(encodingStyle));
        url.append(filepath);
        if (attributes != null) {
            addAttributes(url, attributes);
        }
        return url.toString();
    }

    /**
     * Tell the browser to not cache.
     *
     * This sets several headers to try to ensure that the page will not be cached. Not sure if last modified matters
     * -goliver
     *
     * @param response the HTTP response to which we will add headers.
     */
    @Override
    public void setNoCache(HttpServletResponse response) {
        long past = System.currentTimeMillis() - LONG_EXPIRE;
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache,no-store");
        response.setDateHeader(HttpHeaders.EXPIRES, past);
        response.setDateHeader(HttpHeaders.LAST_MODIFIED, past);
    }

    /**
     * Check to see if we are in production mode.
     */
    @Override
    public boolean isProductionMode(Mode mode) {
        return mode == Mode.PROD || configAdapter.isProduction();
    }

    private JavaActionDef getPubliclyCacheableAction(Message message) throws QuickFixException {
        if (message.getActions().size() == 1) {
            Action action = message.getActions().get(0);

            Definition def = definitionService.getDefinition(action.getDescriptor());

            if (def instanceof JavaActionDef) {
                JavaActionDef javaActionDef = (JavaActionDef) def;

                if (javaActionDef.isPublicCachingEnabled() && javaActionDef.getPublicCachingExpiration() > 0) {
                    return javaActionDef;
                }
            }
        }

        return null;
    }
    /**
     * Check to see if the incoming message is for a publicly cacheable action
     */
    @Override
    public boolean isPubliclyCacheableAction(Message message) throws QuickFixException {
        return getPubliclyCacheableAction(message) != null;
    }

    /**
     * Return the cacheable action expiration time (in seconds) OR -1 if the action is not publicly cacheable
     */
    @Override
    public long getPubliclyCacheableActionExpiration(Message message) throws QuickFixException {
        JavaActionDef publiclyCacheableJavaActionDef = getPubliclyCacheableAction(message);

        if (publiclyCacheableJavaActionDef != null) {
            return publiclyCacheableJavaActionDef.getPublicCachingExpiration();
        }

        return -1;
    }

    /**
     * Sets mandatory headers, notably for anti-clickjacking.
     */
    @Override
    public final void setCSPHeaders(DefDescriptor<?> top, HttpServletRequest req, HttpServletResponse rsp) {
        if (canSkipCSPHeader(req)) {
            return;
        }

        ContentSecurityPolicy csp = configAdapter.getContentSecurityPolicy(
                top == null ? null : top.getQualifiedName(), req);

        if (csp != null) {

            rsp.addHeader(CSP.Header.SECURE, csp.getCspHeaderValue());
            Collection<String> terms = csp.getFrameAncestors();
            if (terms != null) {
                // not open to the world; figure whether we can express an X-FRAME-OPTIONS header:
                if (terms.size() == 0) {
                    // closed to any framing at all
                    rsp.setHeader(HDR_FRAME_OPTIONS, HDR_FRAME_DENY);
                } else if (terms.size() == 1) {
                    // With one ancestor term, we're either SAMEORIGIN or ALLOWFROM
                    for (String site : terms) {
                        if (site == null) {
                            // Add same-origin headers and policy terms
                            rsp.addHeader(HDR_FRAME_OPTIONS, HDR_FRAME_SAMEORIGIN);
                        } else if (!site.contains("*") && !site.matches("^[a-z]+:$")) {
                            // XFO can't express wildcards or protocol-only, so set only for a specific site:
                            rsp.addHeader(HDR_FRAME_OPTIONS, HDR_FRAME_ALLOWFROM + site);
                        } else {
                            // When XFO can't express it, still set an ALLOWALL so filters don't jump in
                            rsp.addHeader(HDR_FRAME_OPTIONS, HDR_FRAME_ALLOWALL);
                        }
                    }
                }
            }
        }
    }

    /**
     * Check if CSP Header setting is already inherited from one.app (top level context)
     * See https://www.w3.org/TR/CSP2/#which-policy-applies
     * @param defDesc
     * @param req
     * @return true if CSP header setting can be skipped
     */
    private boolean canSkipCSPHeader(final HttpServletRequest req) {
        if(req == null) {
            return false;
        }

        // CSP inheritance is supported starting from CSP2
        if(!isCSP2Supported(req)) {
            return false;
        }

        final String auraFormat = req.getParameter("aura.format");
        if(auraFormat != null && !auraFormat.equals("HTML")) {
            return true;
        }

        return false;
    }

    /**
     * Check if Content Security Policy Level 2 is supported by the browser
     * Currently, IE, Edge and Opera Mini browsers don't support CSP2 as per http://caniuse.com/#feat=contentsecuritypolicy2
     * @return true if user agent used in req supports CSP2
     */
    private boolean isCSP2Supported(final HttpServletRequest req) {
        final String userAgent = req.getHeader("User-Agent");
        if(userAgent == null) {
            return false;
        }

        final int browser = BrowserUserAgent.parseBrowser(userAgent);
        if(UserAgent.IE.match(browser)) { // UserAgent.IE is used for IE11 and IE12 (Edge)
            return false;
        }

        return true;
    }

    /**
     * Set a long cache timeout.
     *
     * This sets several headers to try to ensure that the page will be cached for a reasonable length of time. Of note
     * is the last-modified header, which is set to a day ago so that browsers consider it to be safe.
     *
     * @param response the HTTP response to which we will add headers.
     */
    @Override
    public void setLongCache(HttpServletResponse response) {
        this.setCacheTimeout(response, LONG_EXPIRE, true);
    }

    /**
     * Set a long cache timeout and proxy cache setting.
     *
     * This sets headers like the setLongCache method.  But it also setting proxy the proxy cache definition for the request.
     *
     * @param response the HTTP response to which we will add headers.
     * @param cacheAtProxy if true, response will be cached by the proxy
     */
    @Override
    public void setLongCachePrivate(HttpServletResponse response) {
        setCacheTimeoutPriv(response, LONG_EXPIRE, true, "private");
    }

    /**
     * Set a 'short' cache timeout.
     *
     * This sets several headers to try to ensure that the page will be cached for a shortish length of time. Of note is
     * the last-modified header, which is set to a day ago so that browsers consider it to be safe.
     *
     * @param response the HTTP response to which we will add headers.
     */
    @Override
    public void setShortCache(HttpServletResponse response) {
        this.setCacheTimeout(response, SHORT_EXPIRE, false);
    }

    /**
     * Set a 'short' cache timeout and proxy cache setting.
     *
     * This sets headers like the setShortCache method. But it also setting proxy the proxy cache definition for the request.
     *
     * @param response the HTTP response to which we will add headers.
     * @param cacheAtProxy if true, response will be cached by the proxy
     */
    @Override
    public void setShortCachePrivate(HttpServletResponse response) {
        setCacheTimeoutPriv(response, SHORT_EXPIRE, false, "private");
    }

    /**
     * Sets cache timeout to a given value.
     *
     * This sets several headers to try to ensure that the page will be cached for the given length of time. Of note is
     * the last-modified header, which is set to a day ago so that browsers consider it to be safe.
     *
     * @param response - the HTTP response to which we will add headers.
     * @param expiration - timeout value in milliseconds.
     * @param immutable - if true, includes immutable header
     */
    @Override
    public void setCacheTimeout(HttpServletResponse response, long expiration, boolean immutable) {
        setCacheTimeoutPriv(response, expiration, immutable, "public");
    }

    private void setCacheTimeoutPriv(HttpServletResponse response, long expiration, boolean immutable, String proxyCacheSetting) {
        response.setHeader(HttpHeaders.VARY, "Accept-Encoding");
        String cacheHeader = String.format("max-age=%s,%s", expiration / 1000, proxyCacheSetting);
        if (immutable) {
            cacheHeader += ",immutable";
        }
        response.setHeader(HttpHeaders.CACHE_CONTROL, cacheHeader.toString());

        long now = System.currentTimeMillis();
        response.setDateHeader(HttpHeaders.EXPIRES, now + expiration);
        response.setDateHeader(HttpHeaders.LAST_MODIFIED, now - SHORT_EXPIRE);
    }

    @Override
    public String getContentType(AuraContext.Format format) {
        switch (format) {
        case MANIFEST:
            return MANIFEST_CONTENT_TYPE;
        case CSS:
            return CSS_CONTENT_TYPE;
        case JS:
            return JAVASCRIPT_CONTENT_TYPE;
        case JSON:
            return JsonEncoder.MIME_TYPE;
        case HTML:
            return HTML_CONTENT_TYPE;
        case SVG:
            return SVG_CONTENT_TYPE;
        default:
        }
        return ("text/plain");
    }

    @Override
    public boolean isValidDefType(DefType defType, Mode mode) {
        return (defType == DefType.APPLICATION || defType == DefType.COMPONENT);
    }

    @Override
    public boolean resourceServletGetPre(HttpServletRequest request, HttpServletResponse response, AuraResource resource) {
        return false;
    }

    @Override
    public boolean actionServletGetPre(HttpServletRequest request, HttpServletResponse response) throws IOException {
        return false;
    }

    @Override
    public boolean actionServletPostPre(HttpServletRequest request, HttpServletResponse response) throws IOException {
        return false;
    }

    /**
     * check the top level component/app and get dependencies.
     *
     * This routine checks to see that we have a valid top level component. If our top level component is out of sync,
     * we have to ignore it here, but we _must_ force the client to not cache the response.
     *
     * If there is a QFE, we substitute the QFE descriptor for the one given us, and continue. Again, we cannot allow
     * caching.
     *
     * Finally, if there is no descriptor given, we simply ignore the request and give them an empty response. Which is
     * done here by returning null.
     *
     * Also note that this handles the 'if-modified-since' header, as we want to tell the browser that nothing changed
     * in that case.
     *
     * @param request the request (for exception handling)
     * @param response the response (for exception handling)
     * @param context the context to get the definition.
     * @return the set of descriptors we are sending back, or null in the case that we handled the response.
     * @throws IOException if there was an IO exception handling a client out of sync exception
     * @throws ServletException if there was a problem handling the out of sync
     */
    @Override
    public Set<DefDescriptor<?>> verifyTopLevel(HttpServletRequest request, HttpServletResponse response,
            AuraContext context) throws IOException {
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();

        context.setPreloading(true);
        if (appDesc == null) {
            //
            // This means we have nothing to say to the client, so the response is
            // left completely empty.
            //
            return null;
        }
        long ifModifiedSince = request.getDateHeader(HttpHeaders.IF_MODIFIED_SINCE);
        String uid = context.getUid(appDesc);
        try {
            try {
                definitionService.updateLoaded(appDesc);
                if (uid != null && ifModifiedSince != -1) {
                    //
                    // In this case, we have an unmodified descriptor, so just tell
                    // the client that.
                    //
                    response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
                    return null;
                }
            } catch (ClientOutOfSyncException coose) {
                //
                // We can't actually handle an out of sync here, since we are doing a
                // resource load. We have to ignore it, and continue as if nothing happened.
                // But in the process, we make sure to set 'no-cache' so that the result
                // is thrown away. This may actually not give the right result in bizarre
                // corner cases... beware cache inconsistencies on revert after a QFE.
                //
                // We actually probably should do something different, like send a minimalist
                // set of stuff to make the client re-try.
                //
                this.setNoCache(response);
                String oosUid = definitionService.getUid(null, appDesc);
                return definitionService.getDependencies(oosUid);
            }
        } catch (QuickFixException qfe) {
            //
            // A quickfix exception means that we couldn't compile something.
            // In this case, we still want to preload things, but we want to preload
            // quick fix values, note that we force NoCache here.
            //
            this.setNoCache(response);
            this.handleServletException(qfe, true, context, request, response, true);
            return null;
        }
        this.setLongCache(response);
        if (uid == null) {
            uid = context.getUid(appDesc);
        }
        return definitionService.getDependencies(uid);
    }

    /**
     * get the manifest URL.
     *
     * This routine will simply return the string, it does not check to see if the manifest is
     * enabled first.
     *
     * @return a string for the manifest URL.
     */
    @Override
    public String getManifestUrl(AuraContext context, Map<String,Object> attributes) {
        String contextPath = context.getContextPath();
        String ret = "";

        StringBuilder defs = new StringBuilder(contextPath).append("/l/");
        defs.append(context.getEncodedURL(AuraContext.EncodingStyle.Bare));
        defs.append("/app.manifest");
        addAttributes(defs, attributes);
        ret = defs.toString();
        return ret;
    }

    /**
     * Checks current framework UID to one in provided AuraContext.
     * Throws ClientOutOfSyncException if they don't match.
     *
     * @param context AuraContext
     * @throws ClientOutOfSyncException
     */
    @Override
    public void checkFrameworkUID(AuraContext context) throws ClientOutOfSyncException {
        String fwUID = configAdapter.getAuraFrameworkNonce();
        String ctxUID = context.getFrameworkUID();
        if (!fwUID.equals(ctxUID)) {
            throw new ClientOutOfSyncException("Framework UID mismatch. Expected: " + fwUID +
                    " Actual: " + ctxUID);
        }
    }

    /**
     * @param definitionService the definitionService to set
     */
    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    /**
     * Injection override.
     */
    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    /**
     * Injection override.
     */
    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    /**
     * Injection override.
     */
    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter) {
        this.exceptionAdapter = exceptionAdapter;
    }

    /**
     * Injection override.
     */
    @Inject
    public void setSerializationService(SerializationService serializationService) {
        this.serializationService = serializationService;
    }

    /**
     * Injection override.
     */
    @Inject
    public void setClientLibraryService(ClientLibraryService clientLibraryService) {
        this.clientLibraryService = clientLibraryService;
    }

    @Autowired(required = false)
    public void setInlineJSAppenders(List<InlineJSAppender> inlineJsAppenders) {
        this.inlineJsAppenders = inlineJsAppenders;
    }

    @Inject
    public void setCspInliningService(CSPInliningService service) {
        this.cspInliningService = service;
    }
    /**
     * Exposed for testing
     */
    public void setManifestUtil(ManifestUtil manifestUtil) {
        this.manifestUtil = manifestUtil;
    }

}

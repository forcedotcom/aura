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
import java.util.Collection;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.http.CSP;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.AuraResource;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import aQute.bnd.annotation.component.Component;

@Component (provide=AuraServiceProvider.class)
public class ServletUtilAdapterImpl implements ServletUtilAdapter {
    protected DefinitionService definitionService = Aura.getDefinitionService();

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
        try {
            Throwable mappedEx = t;
            boolean map = !quickfix;
            Format format = context.getFormat();

            //
            // This seems to fail, though the documentation implies that you can do
            // it.
            //
            // if (written && !response.isCommitted()) {
            // response.resetBuffer();
            // written = false;
            // }
            if (!written) {
                // Should we only delete for JSON?
                setNoCache(response);
            }
            if (mappedEx instanceof IOException) {
                //
                // Just re-throw IOExceptions.
                //
                throw (IOException) mappedEx;
            } else if (mappedEx instanceof NoAccessException) {
                Throwable cause = mappedEx.getCause();
                String denyMessage = mappedEx.getMessage();

                map = false;
                if (cause != null) {
                    //
                    // Note that the exception handler can remap the cause here.
                    //
                    cause = Aura.getExceptionAdapter().handleException(cause);
                    denyMessage += ": cause = " + cause.getMessage();
                }
                //
                // Is this correct?!?!?!
                //
                if (format != Format.JSON) {
                    send404(request, response);
                    if (!isProductionMode(context.getMode())) {
                        // Preserve new lines and tabs in the stacktrace since this is directly being written on to the
                        // page
                        denyMessage = "<pre>" + AuraTextUtil.escapeForHTML(denyMessage) + "</pre>";
                        response.getWriter().println(denyMessage);
                    }
                    return;
                }
            } else if (mappedEx instanceof QuickFixException) {
                if (isProductionMode(context.getMode())) {
                    //
                    // In production environments, we want wrap the quick-fix. But be a little careful here.
                    // We should never mark the top level as a quick-fix, because that means that we gack
                    // on every mis-spelled app. In this case we simply send a 404 and bolt.
                    //
                    if (mappedEx instanceof DefinitionNotFoundException) {
                        DefinitionNotFoundException dnfe = (DefinitionNotFoundException) mappedEx;

                        if (dnfe.getDescriptor() != null
                                && dnfe.getDescriptor().equals(context.getApplicationDescriptor())) {
                            send404(request, response);
                            return;
                        }
                    }
                    map = true;
                    mappedEx = new AuraUnhandledException("404 Not Found (Application Error)", mappedEx);
                }
            }
            if (map) {
                mappedEx = Aura.getExceptionAdapter().handleException(mappedEx);
            }

            PrintWriter out = response.getWriter();

            //
            // If we have written out data, We are kinda toast in this case.
            // We really want to roll it all back, but we can't, so we opt
            // for the best we can do. For HTML we can do nothing at all.
            //
            if (format == Format.JSON) {
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
                //
                // Unfortunately we can't do the following now. It might be possible
                // in some cases, but we don't want to go there unless we have to.
                //
            }
            if (format == Format.JS || format == Format.CSS) {
                // Make sure js and css doesn't get cached in browser, appcache, etc
                response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
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
                InstanceStack stack = Aura.getContextService().getCurrentContext().getInstanceStack();
                List<String> list = stack.getStackInfo();
                for (int count = list.size(); count > 0; count--) {
                    stack.popInstance(stack.peek());
                }

                Aura.getSerializationService().write(mappedEx, null, out);
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
                response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                Aura.getExceptionAdapter().handleException(death);
                if (!isProductionMode(context.getMode())) {
                    response.getWriter().println(death.getMessage());
                }
            } catch (IOException ioe) {
                throw ioe;
            } catch (Throwable doubleDeath) {
                // we are totally hosed.
                if (!isProductionMode(context.getMode())) {
                    response.getWriter().println(doubleDeath.getMessage());
                }
            }
        } finally {
            Aura.getContextService().endContext();
        }
    }

    @Override
    public void send404(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
        Aura.getContextService().endContext();
    }

    @Override
    public List<String> getScripts(AuraContext context) throws QuickFixException {
        List<String> ret = Lists.newArrayList();
        ret.addAll(getBaseScripts(context));
        ret.addAll(getNamespacesScripts(context));
        return ret;
    }

    @Override
    public List<String> getStyles(AuraContext context) throws QuickFixException {
        String contextPath = context.getContextPath();

        Set<String> ret = Sets.newLinkedHashSet();

        // add css client libraries
        ret.addAll(getClientLibraryUrls(context, ClientLibraryDef.Type.CSS));

        StringBuilder defs = new StringBuilder(contextPath).append("/l/");
        defs.append(context.getEncodedURL(AuraContext.EncodingStyle.Css));
        defs.append("/app.css");
        ret.add(defs.toString());

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
    private Set<String> getClientLibraryUrls(AuraContext context, ClientLibraryDef.Type type)
            throws QuickFixException {
        return Aura.getClientLibraryService().getUrls(context, type);
    }

    /**
     * Get the set of base scripts for a context.
     */
    @Override
    public List<String> getBaseScripts(AuraContext context) throws QuickFixException {
        ConfigAdapter config = Aura.getConfigAdapter();
        Set<String> ret = Sets.newLinkedHashSet();

        String html5ShivURL = config.getHTML5ShivURL();
        if (html5ShivURL != null) {
            ret.add(html5ShivURL);
        }

        ret.add(config.getJSLibsURL());

        ret.addAll(getClientLibraryUrls(context, ClientLibraryDef.Type.JS));
        // framework js should be after other client libraries
        ret.add(config.getAuraJSURL());

        return new ArrayList<>(ret);
    }

    /**
     * Get the set of base scripts for a context.
     */
    @Override
    public List<String> getNamespacesScripts(AuraContext context) throws QuickFixException {
        String contextPath = context.getContextPath();
        List<String> ret = Lists.newArrayList();

        StringBuilder defs = new StringBuilder(contextPath).append("/l/");
        defs.append(context.getEncodedURL(AuraContext.EncodingStyle.Normal));
        defs.append("/app.js");

        ret.add(defs.toString());

        return ret;
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
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.setDateHeader(HttpHeaders.EXPIRES, past);
        response.setDateHeader(HttpHeaders.LAST_MODIFIED, past);
    }

    /**
     * Check to see if we are in production mode.
     */
    @Override
    public boolean isProductionMode(Mode mode) {
        return mode == Mode.PROD || Aura.getConfigAdapter().isProduction();
    }

    /**
     * Sets mandatory headers, notably for anti-clickjacking.
     */
    @Override
    public void setCSPHeaders(DefDescriptor<?> top, HttpServletRequest req, HttpServletResponse rsp) {
        ContentSecurityPolicy csp = Aura.getConfigAdapter().getContentSecurityPolicy(
                top == null ? null : top.getQualifiedName(), req);

        if (csp != null) {
            rsp.setHeader(CSP.Header.SECURE, csp.getCspHeaderValue());
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
     * Set a long cache timeout.
     *
     * This sets several headers to try to ensure that the page will be cached for a reasonable length of time. Of note
     * is the last-modified header, which is set to a day ago so that browsers consider it to be safe.
     *
     * @param response the HTTP response to which we will add headers.
     */
    @Override
    public void setLongCache(HttpServletResponse response) {
        long now = System.currentTimeMillis();
        response.setHeader(HttpHeaders.VARY, "Accept-Encoding");
        response.setHeader(HttpHeaders.CACHE_CONTROL, String.format("max-age=%s, public", LONG_EXPIRE / 1000));
        response.setDateHeader(HttpHeaders.EXPIRES, now + LONG_EXPIRE);
        response.setDateHeader(HttpHeaders.LAST_MODIFIED, now - SHORT_EXPIRE);
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
        long now = System.currentTimeMillis();
        response.setHeader(HttpHeaders.VARY, "Accept-Encoding");
        response.setHeader(HttpHeaders.CACHE_CONTROL, String.format("max-age=%s, public", SHORT_EXPIRE / 1000));
        response.setDateHeader(HttpHeaders.EXPIRES, now + SHORT_EXPIRE);
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
    public boolean actionServletGetPre(HttpServletRequest request, HttpServletResponse response) {
        return false;
    }

    @Override
    public boolean actionServletPostPre(HttpServletRequest request, HttpServletResponse response) {
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
        MasterDefRegistry mdr = context.getDefRegistry();

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
                String oosUid = mdr.getUid(null, appDesc);
                return mdr.getDependencies(oosUid);
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
        return mdr.getDependencies(uid);
    }

    /**
     * @param definitionService the definitionService to set
     */
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
}

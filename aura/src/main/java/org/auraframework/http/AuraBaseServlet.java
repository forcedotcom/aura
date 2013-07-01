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
package org.auraframework.http;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

@SuppressWarnings("serial")
public abstract class AuraBaseServlet extends HttpServlet {
    public static final String AURA_PREFIX = "aura.";
    public static final String CSRF_PROTECT = "while(1);\n";

    /**
     * "Short" pages (such as manifest cookies and AuraFrameworkServlet pages) expire in 1 day.
     */
    public static final long SHORT_EXPIRE_SECONDS = 24L * 60 * 60;
    public static final long SHORT_EXPIRE = SHORT_EXPIRE_SECONDS * 1000;

    /**
     * "Long" pages (such as resources and cached HTML templates) expire in 45 days. We also use this to "pre-expire"
     * no-cache pages, setting their expiration a month and a half into the past for user agents that don't understand
     * Cache-Control: no-cache.
     */
    public static final long LONG_EXPIRE = 45 * SHORT_EXPIRE;
    public static final String UTF_ENCODING = "UTF-8";
    public static final String HTML_CONTENT_TYPE = "text/html";
    public static final String JAVASCRIPT_CONTENT_TYPE = "text/javascript";
    public static final String MANIFEST_CONTENT_TYPE = "text/cache-manifest";
    public static final String CSS_CONTENT_TYPE = "text/css";
    protected static MimetypesFileTypeMap mimeTypesMap;
    public static final String OUTDATED_MESSAGE = "OUTDATED";
    protected final static StringParam csrfToken = new StringParam(AURA_PREFIX + "token", 0, true);
    private static SourceNotifier sourceNotifier = new SourceNotifier();

    static {
        mimeTypesMap = new MimetypesFileTypeMap();
        // the default MIME map is apparently circa 1992, so add some types we
        // might need
        mimeTypesMap.addMimeTypes(AuraBaseServlet.JAVASCRIPT_CONTENT_TYPE + " js");
        mimeTypesMap.addMimeTypes("text/css css");
        mimeTypesMap.addMimeTypes("audio/mpeg mp3 mpeg3");
        mimeTypesMap.addMimeTypes("image/png png");
        mimeTypesMap.addMimeTypes("video/mpeg mpeg mpg mpe mpv vbs mpegv");
        Aura.getDefinitionService().subscribeToChangeNotification(sourceNotifier);
    }

    protected static void addCookie(HttpServletResponse response, String name, String value, long expiry) {
        if (name != null) {
            Cookie cookie = new Cookie(name, value);
            cookie.setPath("/");
            cookie.setMaxAge((int) expiry);
            response.addCookie(cookie);
        }
    }

    public static String getToken() {
        return Aura.getConfigAdapter().getCSRFToken();
    }

    public static void validateCSRF(String token) {
        Aura.getConfigAdapter().validateCSRFToken(token);
    }

    /**
     * Tell the browser to not cache.
     *
     * This sets several headers to try to ensure that the page will not be cached.
     * Not sure if last modified matters -goliver
     *
     * @param response the HTTP response to which we will add headers.
     */
    public static void setNoCache(HttpServletResponse response) {
        long past = System.currentTimeMillis() - LONG_EXPIRE;
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.setDateHeader(HttpHeaders.EXPIRES, past);
        response.setDateHeader(HttpHeaders.LAST_MODIFIED, past);
    }

    /**
     * Set a long cache timeout.
     *
     * This sets several headers to try to ensure that the page will be cached for a reasonable
     * length of time. Of note is the last-modified header, which is set to a day ago so that
     * browsers consider it to be safe.
     *
     * @param response the HTTP response to which we will add headers.
     */
    public static void setLongCache(HttpServletResponse response) {
        long now = System.currentTimeMillis();
        response.setHeader(HttpHeaders.VARY, "Accept-Encoding");
        response.setHeader(HttpHeaders.CACHE_CONTROL, String.format("max-age=%s, public", LONG_EXPIRE / 1000));
        response.setDateHeader(HttpHeaders.EXPIRES, now + LONG_EXPIRE);
        response.setDateHeader(HttpHeaders.LAST_MODIFIED, now - SHORT_EXPIRE);
    }

    public static String addCacheBuster(String url) {
        // This method should be moved to HttpUtil class in the future
        String uri = url;
        if (uri == null) {
            return null;
        }
        int hashLoc = uri.indexOf('#');
        String hash = "";
        if (hashLoc >= 0) {
            hash = uri.substring(hashLoc);
            uri = uri.substring(0, hashLoc);
        }
        StringBuilder sb = new StringBuilder(uri);
        sb.append((uri.contains("?")) ? "&" : "?");
        sb.append("aura.cb=");
        sb.append(Aura.getConfigAdapter().getBuildTimestamp());
        return sb.toString() + hash;
    }

    public AuraBaseServlet() {
        super();
    }

    protected void send404(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.getWriter().println("404 Not Found");
        Aura.getContextService().endContext();
    }

    /**
     * Check to see if we are in production mode.
     */
    protected boolean isProductionMode(Mode mode) {
        return mode == Mode.PROD || Aura.getConfigAdapter().isProduction();
    }

    /**
     * Handle an exception in the servlet.
     * 
     * This routine shold be called whenever an exception has surfaced to the top level of the servlet. It should not be
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
    protected void handleServletException(Throwable t, boolean quickfix, AuraContext context,
            HttpServletRequest request, HttpServletResponse response,
            boolean written) throws IOException, ServletException {
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
                        response.getWriter().println(denyMessage);
                    }
                    return;
                }
            } else if (mappedEx instanceof QuickFixException) {
                if (quickfix && !isProductionMode(context.getMode())) {
                    map = false;
                } else {
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
                context.setSerializeLastMod(false);
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
                Aura.getExceptionAdapter().handleException(death);
                send404(request, response);
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
        }
    }

    public static boolean shouldCacheHTMLTemplate(HttpServletRequest request) {
        AuraContext context = Aura.getContextService().getCurrentContext();
        try {
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getApplicationDescriptor();
            if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
                Boolean isOnePageApp = ((ApplicationDef) appDefDesc.getDef()).isOnePageApp();
                if (isOnePageApp != null) {
                    return isOnePageApp.booleanValue();
                }
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
        return !ManifestUtil.isManifestEnabled(request);
    }

    private final static ConcurrentHashMap<String, Long> lastModMap = new ConcurrentHashMap<String, Long>();

    public String getContentType(AuraContext.Format format) {
        switch (format) {
        case MANIFEST:
            return (AuraBaseServlet.MANIFEST_CONTENT_TYPE);
        case CSS:
            return (AuraBaseServlet.CSS_CONTENT_TYPE);
        case JS:
            return (AuraBaseServlet.JAVASCRIPT_CONTENT_TYPE);
        case JSON:
            return (Json.MIME_TYPE);
        case HTML:
            return (AuraBaseServlet.HTML_CONTENT_TYPE);
        }
        return ("text/plain");
    }

    /**
     * Gets the UID for the application descriptor of the current context, or {@code null} if there is no application
     * (probably because of a compile error).
     */
    public static String getContextAppUid() {
        DefinitionService definitionService = Aura.getDefinitionService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();

        if (app != null) {
            try {
                return definitionService.getDefRegistry().getUid(null, app);
            } catch (QuickFixException e) {
                // This is perfectly possible, but the error is handled in more
                // contextually-sensible places. For here, we know there's no
                // meaningful uid, so we fall through and return null.
            }
        }
        return null;
    }

    // This routine is about to die!
    public static long getLastMod() {
        DefinitionService definitionService = Aura.getDefinitionService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
        Mode mode = context.getMode();
        long appLastMod = -1;

        // if there are conditions where cache must be disabled, set this boolean false
        boolean useCache = (Aura.getConfigAdapter().isProduction() || (mode == Mode.PROD || mode == Mode.PTEST || mode == Mode.CADENCE));

        if (app != null) {
            if (useCache) {
                Long tmp = lastModMap.get(app.getQualifiedName());
                if (tmp != null) {
                    appLastMod = tmp.longValue();
                }
            }
            if (appLastMod == -1) {
                try {
                    String uid = definitionService.getDefRegistry().getUid(null, app);
                    appLastMod = definitionService.getLastMod(uid);
                    lastModMap.put(app.getQualifiedName(), Long.valueOf(appLastMod));
                } catch (QuickFixException qfe) {
                    // ignore. the QFE will get thrown elsewhere.
                }
            }
        }
        long lastMod = Aura.getConfigAdapter().getAuraJSLastMod();
        if (appLastMod > lastMod) {
            lastMod = appLastMod;
        }
        return lastMod;
    }

    protected DefDescriptor<?> setupQuickFix(AuraContext context, boolean preload) {
        DefinitionService ds = Aura.getDefinitionService();
        MasterDefRegistry mdr = context.getDefRegistry();

        try {
            DefDescriptor<?> qfdesc = ds.getDefDescriptor("auradev:quickFixException", ComponentDef.class);
            String uid = mdr.getUid(null, qfdesc);
            // if (!preload) {
            // Set<DefDescriptor<?>> loaded = Sets.newHashSet();
            // loaded.addAll(mdr.getDependencies(uid));
            // context.setPreloadedDeps(loaded);
            // }
            context.addLoaded(qfdesc, uid);
            context.setPreloading(qfdesc);
            return qfdesc;
        } catch (QuickFixException death) {
            //
            // DOH! something is seriously wrong, just die!
            // This should _never_ happen, but if you muck up basic aura stuff, it might.
            //
            throw new AuraError(death);
        }
    }

    public static List<String> getScripts() throws QuickFixException {
        List<String> ret = Lists.newArrayList();
        ret.addAll(getBaseScripts());
        ret.addAll(getNamespacesScripts());
        return ret;
    }

    public static List<String> getStyles() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> preloads = context.getPreloads();
        Mode mode = context.getMode();
        String contextPath = context.getContextPath();
        ConfigAdapter config = Aura.getConfigAdapter();

        List<String> ret = Lists.newArrayList();

        if (preloads != null && !preloads.isEmpty()) {
            StringBuilder defs = new StringBuilder(contextPath).append("/l/");
            StringBuilder sb = new StringBuilder();

            try {
                Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
            String contextJson = AuraTextUtil.urlencode(sb.toString());
            defs.append(contextJson);
            defs.append("/app.css");
            ret.add(defs.toString());
        }

        if (mode == Mode.PTEST) {
            ret.add(config.getJiffyCSSURL());
        }

        return ret;
    }

    public static List<String> getBaseScripts() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String contextPath = context.getContextPath();
        Mode mode = context.getMode();

        ConfigAdapter config = Aura.getConfigAdapter();

        List<String> ret = Lists.newArrayList();

        switch (mode) {
        case PTEST:
            ret.add(config.getJiffyJSURL());
            ret.add(config.getJiffyUIJSURL());
            break;
        case CADENCE:
            ret.add(config.getJiffyJSURL());
            break;
        default:
        }

        ret.add(contextPath + config.getAuraJSURL());

        return ret;
    }

    public static List<String> getNamespacesScripts() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> preloads = context.getPreloads();
        String contextPath = context.getContextPath();
        List<String> ret = Lists.newArrayList();

        if (preloads != null && !preloads.isEmpty()) {
            StringBuilder defs = new StringBuilder(contextPath).append("/l/");
            StringBuilder sb = new StringBuilder();

            try {
                Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }

            String contextJson = AuraTextUtil.urlencode(sb.toString());
            defs.append(contextJson);
            defs.append("/app.js");

            ret.add(defs.toString());
        }

        return ret;
    }

    @Override
    public void init(ServletConfig config) {
    }

    /**
     * Singleton class to manage external calls to the parent class' static cache
     */
    private static class SourceNotifier implements SourceListener {
        @Override
        public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event) {
            lastModMap.clear();
        }
    }

}

/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

@SuppressWarnings("serial")
public abstract class AuraBaseServlet extends HttpServlet {
    public static final String AURA_PREFIX = "aura.";
    public static final String CSRF_PROTECT = "while(1);\n";
    public static final long SHORT_EXPIRE_SECONDS = 24L * 60 * 60;
    public static final long SHORT_EXPIRE = SHORT_EXPIRE_SECONDS * 1000;
    public static final long LONG_EXPIRE = 45 * SHORT_EXPIRE;
    public static final String UTF_ENCODING = "UTF-8";
    public static final String HTML_CONTENT_TYPE = "text/html";
    public static final String JAVASCRIPT_CONTENT_TYPE = "text/javascript";
    public static final String MANIFEST_CONTENT_TYPE = "text/cache-manifest";
    public static final String CSS_CONTENT_TYPE = "text/css";
    protected static MimetypesFileTypeMap mimeTypesMap;
    protected static final String lastModCookieName = "_lm";
    public static final String MANIFEST_ERROR = "error";
    public static final String OUTDATED_MESSAGE = "OUTDATED";
    protected final static StringParam csrfToken = new StringParam(AURA_PREFIX + "token", 0, true);

    static {
        mimeTypesMap = new MimetypesFileTypeMap();
        // the default MIME map is apparently circa 1992, so add some types we
        // might need
        mimeTypesMap.addMimeTypes(AuraBaseServlet.JAVASCRIPT_CONTENT_TYPE + " js");
        mimeTypesMap.addMimeTypes("text/css css");
        mimeTypesMap.addMimeTypes("audio/mpeg mp3 mpeg3");
        mimeTypesMap.addMimeTypes("image/png png");
        mimeTypesMap.addMimeTypes("video/mpeg mpeg mpg mpe mpv vbs mpegv");
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

    public static void setNoCache(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", System.currentTimeMillis() - LONG_EXPIRE);
        response.setDateHeader("Last-Modified", System.currentTimeMillis() - LONG_EXPIRE);
    }

    public static void setLongCache(HttpServletResponse response) {
        response.setHeader("Vary", "Accept-Encoding");
        response.setHeader("Cache-Control", String.format("max-age=%s, public", LONG_EXPIRE / 1000));
        response.setDateHeader("Expires", System.currentTimeMillis() + LONG_EXPIRE);
        response.setDateHeader("Last-Modified", System.currentTimeMillis() + LONG_EXPIRE);
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
    private boolean isProductionMode(Mode mode) {
        return mode == Mode.PROD || Aura.getConfigAdapter().isProduction();
    }

    /**
     * Handle an exception in the servlet.
     * 
     * This routine shold be called whenever an exception has surfaced to the
     * top level of the servlet. It should not be overridden unless Aura is
     * entirely subsumed. Most special cases can be handled by the Aura user by
     * implementing {@link ExceptionAdapter ExceptionAdapter}.
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
            HttpServletRequest request, HttpServletResponse response, boolean written) throws IOException,
            ServletException {
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
            deleteManifestCookie(response);
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
                // In production environments, we want wrap the quick-fix.
                //
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
            // client to ignore the
            // now-corrupt data structure. 404s and 500s cause the client to
            // prepend /*, so we can effectively
            // erase the bad data by appending a */ here and then serializing
            // the exception info.
            //
            out.write("*/");
            //
            // Unfortunately we can't do the following now. It might be possible
            // in some cases, but we don't
            // want to go there unless we have to.
            //
            // response.setHeader("ser", "1");
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
            if (!(mappedEx instanceof QuickFixException)) {
                context.setPreloading(true);
                context.clearPreloads();
                //
                // Don't serialize preloads.
                //
                context.setSerializePreLoad(false);
            }
            // last mod makes no sense here
            context.setSerializeLastMod(false);
            try {
                Aura.getSerializationService().write(mappedEx, null, out);
            } catch (QuickFixException qfe) {
                // TODO emit boilerplate "something bad happened" response
                Aura.getExceptionAdapter().handleException(qfe);
            }
            if (format == Format.JSON) {
                out.write("/*ERROR*/");
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
        return !isManifestEnabled(request);
    }

    public static boolean isManifestEnabled(HttpServletRequest request) {
        if (!Aura.getConfigAdapter().isClientAppcacheEnabled()) {
            return false;
        }
        if (!request.getHeader("user-agent").contains("AppleWebKit")) {
            return false;
        }
        AuraContext context = Aura.getContextService().getCurrentContext();
        try {
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getApplicationDescriptor();
            if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
                Boolean useAppcache = ((ApplicationDef) appDefDesc.getDef()).isAppcacheEnabled();
                if (useAppcache != null) {
                    return useAppcache.booleanValue();
                }
                return false;
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }

        return false;
    }

    private static String getManifestCookieName() {
        AuraContext context = Aura.getContextService().getCurrentContext();
        if (context.getApplicationDescriptor() != null) {
            StringBuilder sb = new StringBuilder();
            if (context.getMode() != Mode.PROD) {
                sb.append(context.getMode());
                sb.append("_");
            }
            sb.append(context.getApplicationDescriptor().getNamespace());
            sb.append("_");
            sb.append(context.getApplicationDescriptor().getName());
            sb.append(lastModCookieName);
            return sb.toString();
        }
        return null;
    }

    public static void addManifestCookie(HttpServletResponse response, String value, long expiry) {
        String cookieName = getManifestCookieName();
        if (cookieName != null) {
            addCookie(response, cookieName, value, expiry);
        }
    }

    public static void addManifestCookie(HttpServletResponse response, long expiry) {
        try {
            addManifestCookie(response, Long.toString(getManifestLastMod()), expiry);
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }

    public static void addManifestErrorCookie(HttpServletResponse response) {
        addManifestCookie(response, MANIFEST_ERROR, SHORT_EXPIRE_SECONDS);
    }

    public static void addManifestCookie(HttpServletResponse response) {
        addManifestCookie(response, SHORT_EXPIRE_SECONDS);
    }

    public static void deleteManifestCookie(HttpServletResponse response) {
        addManifestCookie(response, "", 0);
    }

    public static Cookie getManifestCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            String cookieName = getManifestCookieName();
            if (cookieName != null) {
                for (int i = 0; i < cookies.length; i++) {
                    Cookie cookie = cookies[i];
                    if (cookieName.equals(cookie.getName())) {
                        return cookie;
                    }
                }
            }
        }
        return null;
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

    public static long getLastMod() {
        DefinitionService definitionService = Aura.getDefinitionService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
        Mode mode = context.getMode();
        List<String> preloads;
        String preloadsName;
        long appLastMod = -1, preloadsLastMod = -1;
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
                    // ignore.
                }
            }
        }

        preloads = new ArrayList<String>(context.getPreloads());

        if (preloads.size() > 0) {
            Collections.sort(preloads);
            preloadsName = preloads.toString();
            if (useCache) {
                Long tmp = lastModMap.get(preloadsName);
                if (tmp != null) {
                    preloadsLastMod = tmp.longValue();
                }
            }
            if (preloadsLastMod == -1) {
                try {
                    preloadsLastMod = definitionService.getNamespaceLastMod(preloads);
                    lastModMap.put(preloadsName, Long.valueOf(preloadsLastMod));
                } catch (QuickFixException qfe) {
                    // ignore
                }
            }
        }
        long lastMod = Aura.getConfigAdapter().getAuraJSLastMod();
        if (appLastMod > lastMod) {
            lastMod = appLastMod;
        }
        if (preloadsLastMod > lastMod) {
            lastMod = preloadsLastMod;
        }
        return lastMod;
    }

    public static long getManifestLastMod() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Mode mode = context.getMode();
        if (!(mode == Mode.PROD || mode == Mode.PTEST || mode == Mode.CADENCE)) {
            long auraJSLastMod = Aura.getConfigAdapter().getAuraJSLastMod();
            long lastMod = getLastMod();
            return (auraJSLastMod > lastMod) ? auraJSLastMod : lastMod;
        }
        return getLastMod();
    }

    public static String getManifest() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<String> preloads = context.getPreloads();
        String contextPath = context.getContextPath();
        String ret = "";

        if (preloads != null && !preloads.isEmpty()) {
            boolean serPreloads = context.getSerializePreLoad();
            boolean serLastMod = context.getSerializeLastMod();
            context.setSerializePreLoad(false);
            context.setSerializeLastMod(false);
            StringBuilder defs = new StringBuilder(contextPath).append("/l/");
            StringBuilder sb = new StringBuilder();
            try {
                Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
            context.setSerializePreLoad(serPreloads);
            context.setSerializeLastMod(serLastMod);
            String contextJson = AuraTextUtil.urlencode(sb.toString());
            defs.append(contextJson);
            defs.append("/app.manifest");
            ret = defs.toString();
        }
        return ret;
    }
}

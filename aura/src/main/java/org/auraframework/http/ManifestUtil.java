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
import java.util.List;
import java.util.Set;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 * A set of static http servlet utilities.
 *
 * No state is kept in this utility class, and it cannot be instantiated.
 */
public abstract class ManifestUtil {
    /**
     * An error parameter that causes a double fail.
     */
    private final static StringParam errorParam = new StringParam(AuraBaseServlet.AURA_PREFIX + "error", 128, false);

    /**
     * How many requests we accept before guessing that there is a loop.
     */
    private static final int MAX_MANIFEST_COUNT = 8;

    /**
     * The time allowed before we reset the count.
     */
    private static final int MAX_MANIFEST_TIME = 60 * 1000;
    public static final String MANIFEST_ERROR = "error";
    public static final String MANIFEST_COOKIE_TAIL = "_lm";

    /**
     * "Short" pages (such as manifest cookies and AuraFrameworkServlet pages)
     * expire in 1 day.
     */
    public static final long SHORT_EXPIRE_SECONDS = 24L * 60 * 60;
    public static final long SHORT_EXPIRE = SHORT_EXPIRE_SECONDS * 1000;

    /**
     * "Long" pages (such as resources and cached HTML templates) expire in 45
     * days. We also use this to "pre-expire" no-cache pages, setting their
     * expiration a month and a half into the past for user agents that don't
     * understand Cache-Control: no-cache.
     */
    public static final long LONG_EXPIRE = 45 * SHORT_EXPIRE;

    /**
     * Check to see if we allow appcache on the current request.
     */
    public static boolean isManifestEnabled(HttpServletRequest request) {
        //
        // TODO: this is rather bogus.
        //
        if (!request.getHeader("user-agent").contains("AppleWebKit")) {
            return false;
        }
        return isManifestEnabled();
    }

    /**
     * Is AppCache allowed by the current configuration?
     */
    public static boolean isManifestEnabled() {
        if (!Aura.getConfigAdapter().isClientAppcacheEnabled()) {
            return false;
        }

        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getApplicationDescriptor();
        Set<String> preloads = context.getPreloads();

        if (preloads == null || preloads.isEmpty()) {
            return false;
        }

        if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
            try {
                Boolean useAppcache = ((ApplicationDef) appDefDesc.getDef()).isAppcacheEnabled();
                if (useAppcache != null) {
                    return useAppcache.booleanValue();
                }
                return false;
            } catch (QuickFixException e) {
                return false;
            }
        }
        return false;
    }

    /**
     * Check a manifest cookie and update.
     *
     * This routine will check and update a manifest cookie value to ensure
     * that we are not looping. If the incoming cookie is null, it simply
     * initializes, othewise, it parses the cookie and returns null if it
     * requires a reset.
     *
     * @param incoming the cookie from the client.
     * @return either an updated cookie, or null if it was invalid.
     */
    public static String updateManifestCookieValue(String incoming) {
        int manifestRequestCount = 0;
        long now = System.currentTimeMillis();
        long cookieTime = now;

        if (MANIFEST_ERROR.equals(incoming)) {
            return null;
        } else {
            List<String> parts = AuraTextUtil.splitSimple(":", incoming, 2);

            if (parts != null && parts.size() == 2) {
                String count = parts.get(0);
                String date = parts.get(1);
                try {
                    manifestRequestCount = Integer.parseInt(count);
                    cookieTime = Long.parseLong(date);
                    if (now - cookieTime > MAX_MANIFEST_TIME) {
                        //
                        // If we have gone off by more than 60 seconds,
                        // reset everything to start the counter.
                        //
                        manifestRequestCount = 0;
                        cookieTime = now;
                    }
                    if (manifestRequestCount >= MAX_MANIFEST_COUNT) {
                        // We have had 5 requests in 60 seconds. bolt.
                        return null;
                    }
                } catch (NumberFormatException e) {
                    //
                    // Bad cookie!
                    // This should actually be very hard to have happen,
                    // since it requires a cookie to have a ':' in it,
                    // and also to have unparseable numbers, so just punt
                    //
                    return null;
                }
            }
        }
        manifestRequestCount += 1;
        return manifestRequestCount + ":" + cookieTime;
    }

    /**
     * Get the expected name for the manifest cookie.
     *
     * @return the name (null if none)
     */
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
            sb.append(MANIFEST_COOKIE_TAIL);
            return sb.toString();
        }
        return null;
    }

    private static void addCookie(HttpServletResponse response, String name, String value, long expiry) {
        if (name != null) {
            Cookie cookie = new Cookie(name, value);
            cookie.setPath("/");
            cookie.setMaxAge((int) expiry);
            response.addCookie(cookie);
        }
    }

    /**
     * Sets the manifest cookie on response.
     *
     * @param response the response
     * @param value the value to set.
     * @param expiry the expiry time for the cookie.
     */
    private static void addManifestCookie(HttpServletResponse response, String value, long expiry) {
        String cookieName = getManifestCookieName();
        if (cookieName != null) {
            addCookie(response, cookieName, value, expiry);
        }
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

    public static void addManifestErrorCookie(HttpServletResponse response) {
        addManifestCookie(response, MANIFEST_ERROR, SHORT_EXPIRE_SECONDS);
    }

    public static void deleteManifestCookie(HttpServletResponse response) {
        addManifestCookie(response, "", 0);
    }

    /**
     * Check the manifest cookie.
     *
     * This routine checks the cookie and parameter on the request and sets the
     * response code appropriately if we should not send back a manifest.
     *
     * @param request the request (for the incoming cookie).
     * @param response the response (for the outgoing cookie and status)
     * @return false if the caller should bolt because we already set the status.
     */
    public static boolean checkManifestCookie(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = getManifestCookie(request);
        String cookieString = null;

        if (cookie != null) {
            cookieString = cookie.getValue();
        }
        cookieString = updateManifestCookieValue(cookieString);
        if (cookieString == null) {
            deleteManifestCookie(response);
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return false;
        }
        //
        // Now we look for the client telling us we need to break a cycle, in which case we set a cookie
        // and give the client no content.
        //
        if (errorParam.get(request) != null) {
            addManifestErrorCookie(response);
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return false;
        }

        addManifestCookie(response, cookieString, SHORT_EXPIRE_SECONDS);
        return true;
    }

    /**
     * get the manifest URL.
     *
     * This routine will simply return the string, it does not check to see if the manifest is
     * enabled first.
     *
     * @return a string for the manifest URL.
     */
    public static String getManifestUrl() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String contextPath = context.getContextPath();
        String ret = "";

        boolean serLastMod = context.getSerializeLastMod();
        StringBuilder defs = new StringBuilder(contextPath).append("/l/");
        StringBuilder sb = new StringBuilder();
        context.setSerializeLastMod(false);
        try {
            Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
        context.setSerializeLastMod(serLastMod);
        String contextJson = AuraTextUtil.urlencode(sb.toString());
        defs.append(contextJson);
        defs.append("/app.manifest");
        ret = defs.toString();
        return ret;
    }
}

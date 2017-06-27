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

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A set of manifest utilities.
 *
 * No state is kept in this utility class, and it cannot be instantiated.
 */
public class ManifestUtil {
    /**
     * An error parameter that causes a double fail.
     */
    private final static StringParam errorParam = new StringParam(AuraBaseServlet.AURA_PREFIX + "error", 128, false);

    public static final String MANIFEST_ERROR = "error";
    public static final String MANIFEST_COOKIE_TAIL = "_lm";

    /**
     * "Short" pages (such as manifest cookies and AuraFrameworkServlet pages)
     * expire in 1 day.
     */
    public static final long SHORT_EXPIRE_SECONDS = 24L * 60 * 60;

    private final ContextService contextService;
    private final ConfigAdapter configAdapter;
    private final DefinitionService definitionService;

    public ManifestUtil(DefinitionService definitionService, ContextService contextService, ConfigAdapter configAdapter) {
        this.definitionService = definitionService;
        this.contextService = contextService;
        this.configAdapter = configAdapter;
    }

    /**
     * Is AppCache allowed by the current configuration?
     */
    public boolean isManifestEnabled() {
        if (!configAdapter.isClientAppcacheEnabled()) {
            return false;
        }

        AuraContext context = contextService.getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> desc = context.getApplicationDescriptor();

        if (desc != null && desc.getDefType().equals(DefType.APPLICATION)) {
            @SuppressWarnings("unchecked")
            DefDescriptor<ApplicationDef> appDefDesc = (DefDescriptor<ApplicationDef>)desc;
            try {
            	ApplicationDef appDef = definitionService.getUnlinkedDefinition(appDefDesc);
            	if(appDef != null) {
	                Boolean useAppcache = appDef.isAppcacheEnabled();
	                if (useAppcache != null) {
	                    return useAppcache.booleanValue();
	                }
            	}
                return false;
            } catch (QuickFixException e) {
                return false;
            }
        }
        return false;
    }

    /**
     * Get the expected name for the manifest cookie.
     *
     * @return the name (null if none)
     */
    private String getManifestCookieName() {
        AuraContext context = contextService.getCurrentContext();
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

    /**
     * Sets the manifest cookie on response.
     *
     * @param response the response
     * @param value the value to set.
     * @param expiry the expiry time for the cookie.
     */
    private void addManifestCookie(HttpServletResponse response, String value, long expiry) {
        String cookieName = getManifestCookieName();
        if (cookieName != null) {
            Cookie cookie = new Cookie(cookieName, value);
            cookie.setPath("/");
            cookie.setMaxAge((int) expiry);
            response.addCookie(cookie);
        }
    }

    public Cookie getManifestCookie(HttpServletRequest request) {
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
    public boolean checkManifestCookie(HttpServletRequest request, HttpServletResponse response) {
        //
        // Now we look for the client telling us we need to break a cycle, in which case we set a cookie
        // and give the client no content.
        //
        if (errorParam.get(request) != null) {
            addManifestCookie(response, "error", SHORT_EXPIRE_SECONDS);
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return false;
        }
        
        Cookie cookie = getManifestCookie(request);
        if (cookie != null) {
            addManifestCookie(response, "", 0);
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return false;
        }
        return true;
    }
}

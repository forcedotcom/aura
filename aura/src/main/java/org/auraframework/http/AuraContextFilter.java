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
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;
import javax.inject.Inject;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.AuraDeprecated;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.RequestParam.BooleanParam;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Maps;

@SuppressWarnings("deprecation")
public class AuraContextFilter implements Filter {
    public static final EnumParam<AuraContext.Mode> mode = new EnumParam<>(AuraServlet.AURA_PREFIX
            + "mode", false, AuraContext.Mode.class);

    private static final EnumParam<Format> format = new EnumParam<>(AuraServlet.AURA_PREFIX + "format", false,
            Format.class);

    private static final EnumParam<Authentication> access = new EnumParam<>(AuraServlet.AURA_PREFIX
            + "access", false, Authentication.class);

    private static final BooleanParam isActionParam = new BooleanParam(AuraServlet.AURA_PREFIX + "isAction", false);
    private static final StringParam app = new StringParam(AuraServlet.AURA_PREFIX + "app", 0, false);
    private static final StringParam num = new StringParam(AuraServlet.AURA_PREFIX + "num", 0, false);
    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);
    protected static final StringParam pageURI = new StringParam(AuraServlet.AURA_PREFIX + "pageURI", 0, false);
    protected static final BooleanParam compatParam = new BooleanParam(AuraServlet.AURA_PREFIX + "compat", false);

    private AuraTestFilter testFilter;

    private AuraDeprecated auraDeprecated; // force initialization of Aura

    protected ContextService contextService;
    private LoggingService loggingService;
    private DefinitionService definitionService;
    protected ConfigAdapter configAdapter;
    protected SerializationService serializationService;
    private BrowserCompatibilityService browserCompatibilityService;
    protected ServletUtilAdapter servletUtilAdapter;

    @Inject
    public void setContextService(ContextService service) {
        contextService = service;
    }

    protected ContextService getContextService() {
        return contextService;
    }

    @Inject
    public void setLoggingService(LoggingService service) {
        loggingService = service;
    }

    protected LoggingService getLoggingService() {
        return loggingService;
    }

    @Inject
    public void setDefinitionService(DefinitionService service) {
        definitionService = service;
    }

    protected DefinitionService getDefinitionService() {
        return definitionService;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter adapter) {
        configAdapter = adapter;
    }

    @Inject
    public void setSerializationService(SerializationService service) {
        serializationService = service;
    }

    @Inject
    public void setAuraTestFilter(AuraTestFilter testFilter) {
        this.testFilter = testFilter;
    }

    @Inject
    public void setServletUtilAdapter(ServletUtilAdapter servletUtilAdapter) {
        this.servletUtilAdapter = servletUtilAdapter;
    }

    public void setLocalizationAdapter(Object ignored) {
    }

    @Inject
    public void setBrowserCompatibilityService(BrowserCompatibilityService browserCompatibilityService) {
        this.browserCompatibilityService = browserCompatibilityService;
    }

    public AuraTestFilter getAuraTestFilter() {
        return testFilter;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException, IOException {

        if (contextService.isEstablished()) {
            loggingService.error("Aura context was not released correctly! New context will NOT be created.");
            chain.doFilter(req, res);
            return;
        }

        try {
            AuraContext context = startContext(req, res, chain);
            HttpServletRequest request = (HttpServletRequest) req;
            loggingService.setValue(LoggingService.REQUEST_METHOD, request.getMethod());
            loggingService.setValue(LoggingService.AURA_REQUEST_URI, request.getRequestURI());
            loggingService.setValue(LoggingService.AURA_REQUEST_QUERY, request.getQueryString());

            loggingService.setValue(LoggingService.PAGE_URI, pageURI.get(request, request.getHeader("Referer")));
            DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
            if (app != null) {
                loggingService.setValue(LoggingService.APP, app.getDescriptorName());
            }

            if (testFilter != null) {
                testFilter.doFilter(req, res, chain);
            } else {
                chain.doFilter(req, res);
            }
        } catch (InvalidParamException ipe) {
            HttpServletResponse response = (HttpServletResponse) res;
            response.setStatus(HttpStatus.SC_BAD_REQUEST);
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache,no-store");
            Appendable out = response.getWriter();
            if (getFormat((HttpServletRequest)req) == Format.JSON) {
                out.append(String.format("{\"message\":\"%s\"}", AuraTextUtil.escapeForJSONString(ipe.getMessage())));
            } else {
                out.append(ipe.getMessage());
            }
        } catch (Throwable e) {
            handleException(req, res, e);
        } finally {
            try {
                if (loggingService != null) {
                    try {
                        loggingService.setValue(LoggingService.STATUS,
                                String.valueOf(((HttpServletResponse) res).getStatus()));
                    } catch (Throwable t) {
                        // ignore.
                    }
                    loggingService.flush(); // flush out logging values
                }
            } finally {
                endContext();
            }
        }
    }

    protected void handleException(ServletRequest req, ServletResponse res, Throwable t) throws ServletException, IOException {
        try {
            AuraContext context = contextService.getCurrentContext();
            if (context != null) {
                servletUtilAdapter.handleServletException(t, false, context, (HttpServletRequest) req, (HttpServletResponse) res, false);
                res.flushBuffer();
            } else {
                throw new Exception();
            }
        } catch (Throwable ignored) {
            // something really bad happened. Fall back as best we can.
            if (getFormat((HttpServletRequest)req) == Format.JSON) {
                HttpServletResponse response = (HttpServletResponse) res;
                response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache,no-store");
                response.getWriter().append(String.format("{\"message\":\"%s\"}", AuraTextUtil.escapeForJSONString(t.getMessage())));
                response.flushBuffer();
            } else {
                // if we're not JSON, then the generic error handler can serialize as HTML
                throw new ServletException(t);
            }
        }
        if (t instanceof Error) {
            throw new ServletException(t);
        }
    }

    protected AuraContext startContext(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;

        Format f = getFormat(request);
        Authentication a = access.get(request, Authentication.AUTHENTICATED);

        Map<String, Object> configMap = getConfigMap(request);
        Mode m = getMode(request, configMap);

        DefDescriptor<? extends BaseComponentDef> appDesc = getAppParam(request, configMap);

        AuraContext context = contextService.startContext(m, f, a, appDesc);

        String contextPath = request.getContextPath();
        // some appservers (like tomcat) use "/" as the root path, others ""
        if (contextPath == null || "/".equals(contextPath)) {
            contextPath = "";
        }
        context.setContextPath(contextPath);
        context.setNum(num.get(request));
        context.setRequestedLocales(Collections.list(request.getLocales()));
        
        context.setClient(new Client(request.getHeader(HttpHeaders.USER_AGENT)));

        context.setForceCompat(forceCompat(request, m));
        context.setUseCompatSource(context.forceCompat() || useCompatSource(request, configMap, m));

        context.setActionPublicCacheKey(getActionPublicCacheKey(configMap));
        if (configMap != null) {
            getLoaded(context, configMap.get("loaded"));
            @SuppressWarnings("unchecked")
            List<Object> dns = (List<Object>) configMap.get("dn");
            if (dns != null) {
                for (Object dn : dns) {
                    context.addDynamicNamespace((String) dn);
                }
            }
            context.setFrameworkUID((String) configMap.get("fwuid"));

            @SuppressWarnings("unchecked")
            Map<String, Object> styleContext = (Map<String, Object>) configMap.get("styleContext");
            if (styleContext != null) {
                context.setStyleContext(styleContext);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> gvp = (Map<String, Object>) configMap.get("globals");
            if (gvp != null) {
                for (Map.Entry<String, Object> entry : gvp.entrySet()) {
                    try {
                        context.setGlobalValue(entry.getKey(), entry.getValue());
                    } catch (AuraRuntimeException are) {
                        throw new ClientOutOfSyncException(are.getMessage(), are);
                    }
                }
            }

            if (configMap.containsKey("uad")) {
                if (configMap.get("uad") instanceof Number) {
                    context.setUriDefsEnabled(((Number)configMap.get("uad")).intValue() != 0);
                } else if (configMap.get("uad") instanceof Boolean) {
                    context.setUriDefsEnabled((Boolean) configMap.get("uad"));
                }
            }
        }

        return context;
    }

    protected Format getFormat(HttpServletRequest request) {
        Format f = format.get(request);

        //
        // FIXME: our usage of format should be revisited. Most URLs have
        // a fixed format, so we should have a way of getting that.
        //
        if (f == null) {
            if (AuraComponentDefinitionServlet.URI_DEFINITIONS_PATH.equals(request.getServletPath())) {
                f = Format.JSON;
            } else if ("GET".equals(request.getMethod()) && !isActionParam.get(request, Boolean.FALSE).booleanValue()) {
                f = Format.HTML;
            } else {
                f = Format.JSON;
            }
        }

        return f;
    }

    /**
     * Pull in the map of loaded defDescriptors and uids from the context.
     */
    private void getLoaded(AuraContext context, Object loadedEntry) {
        if (loadedEntry == null || !(loadedEntry instanceof Map)) {
            //
            // If someone gives us bogus input, just ignore it.
            //
            return;
        }
        @SuppressWarnings("unchecked")
        Map<String, String> loaded = (Map<String, String>) loadedEntry;
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMapWithExpectedSize(loaded.size() * 3/2);

        for (Map.Entry<String, String> entry : loaded.entrySet()) {
            String uid = entry.getValue();
            if (uid != null && !uid.equals("null")) {
                String key = entry.getKey();
                int posn = key.indexOf("@");
                if (posn > 0) {
                    String typeStr = key.substring(0, posn);
                    String defStr = key.substring(posn + 1);
                    DefType type = null;
                    try {
                        type = DefType.valueOf(typeStr);
                    } catch (Throwable t) {
                        // ignore unknown types...
                        // We really should log these at a level where we can
                        // see them, but, well, we don't have that now.
                    }
                    if (type != null) {
                        DefDescriptor<?> ld = definitionService.getDefDescriptor(defStr, type.getPrimaryInterface());
                        clientLoaded.put(ld, uid);
                    }
                }
            }
        }
        context.setClientLoaded(clientLoaded);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getConfigMap(HttpServletRequest request) {
        Map<String, Object> configMap = null;
        String config = contextConfig.get(request);
        if (!StringUtils.isBlank(config)) {
            if (config.startsWith(AuraTextUtil.urlencode("{"))) {
                // Decode encoded context json. Serialized AuraContext json always starts with "{"
                config = AuraTextUtil.urldecode(config);
            }
            try {
                configMap = (Map<String, Object>) new JsonReader().read(config);
            } catch (Throwable throwable) {
                //config map was invalid. log the bad json and move on. Callers are protected against null.
                loggingService.warn("aura.config was invalid JSON:" + config, throwable);
            }
        }
        return configMap;
    }

    /**
     * Returns the aura mode from one of the following
     * <ol>
     *   <li>the request parameter "{@value AuraServlet#AURA_PREFIX}mode"</li>
     *   <li>the "mode" key from the passed in {@code configMap}</li>
     * </ol>
     * 
     * @param request The request to retrieve the mode from.
     * @param configMap The config used to initialize aura for the current session.
     * @param allowedModes The modes that are allowed for the request.
     * @return The matching {@link Mode}
     */
    @VisibleForTesting
    static final Mode getModeParam(final HttpServletRequest request, final Map<String, Object> configMap, final Collection<Mode> allowedModes) {
        // Get the passed in mode param.
        // Check the aura.mode param first then fall back to the mode value
        // embedded in the aura.context param
        Mode m = mode.get(request, allowedModes);
        if ((m == null) && (configMap != null) && configMap.containsKey("mode")) {
            try {
                m = Mode.valueOf((String) configMap.get("mode"));
            } catch (Throwable e) {
                throw new InvalidParamException(contextConfig.name + " -> mode", allowedModes);
            }
        }
        return m;
    }

    protected Mode getModeParam(HttpServletRequest request) {
        Map<String, Object> configMap = getConfigMap(request);
        return getModeParam(request, configMap, configAdapter.getAvailableModes());
    }

    protected Mode getMode(HttpServletRequest request, Map<String, Object> configMap) {
        Set<Mode> allowedModes = configAdapter.getAvailableModes();
        Mode m = getModeParam(request, configMap, allowedModes);

        if (m == null) {
            m = configAdapter.getDefaultMode();
        }
        boolean forceProdMode = !allowedModes.contains(m) && allowedModes.contains(Mode.PROD);
        if (forceProdMode) {
            m = Mode.PROD;
        }

        return m;
    }

    /**
     * Whether compat module should be served based on browser
     *
     * @param request http request
     * @param configMap The configs containing the context.
     * @param mode Aura context mode
     * @return whether compat module should be served
     */
    protected boolean useCompatSource(HttpServletRequest request, Map<String, Object> configMap, Mode mode) {
        if (configMap != null) {
            // when c is present, it's a request to fetch module compiled code in compatibility mode
            return configMapContains(Json.ApplicationKey.COMPAT.toString(), "1", configMap);
        }

        String uaHeader = request.getHeader(HttpHeaders.USER_AGENT);
        return !this.browserCompatibilityService.isCompatible(uaHeader);
    }

    /**
     * force compat mode by specifying aura.compat url param
     *
     * @param request http request
     * @param mode Aura context mode
     * @return whether compat module should be served
     */
    protected boolean forceCompat(HttpServletRequest request, Mode mode) {
        if (mode == Mode.DEV || mode == Mode.SELENIUM) {
            // DO NOT allow url param override in prod
            String forceCompatEnabledParam = request.getParameter(AuraServlet.AURA_PREFIX + "compat");
            if (forceCompatEnabledParam != null) {
                // Uses BooleanParam which is true for "1", "true", "yes". Anything else is false.
                return compatParam.get(request);
            }
        }
        return false;
    }

    private static boolean configMapContains(@Nonnull String key, @Nonnull String value, @Nonnull Map<String, Object> configMap) {
        // configMap is present when processing requests with url encoded AuraContext ie app.js
        if (configMap.containsKey(key)) {
            String configValue = String.valueOf(configMap.get(key));
            return value.equals(configValue);
        }
        return false;
    }

    /**
     * Retrieve the matching {@link ApplicationDef} from one of the following
     * <ol>
     *   <li>"aura.app" request parameter</li>
     *   <li>"app" key in the passed in {@code configMap} map</li>
     * </ol>
     * or if the {@code ApplicationDef} is not present,
     * {@link ComponentDef} from the "cmp" key in the passed in {@code configMap} map.
     * 
     * @param request The request to get the param from
     * @param configMap
     * @return The matching {@link DefDescriptor} or {@code null} if the value was not found.
     */
    @VisibleForTesting
    final DefDescriptor<? extends BaseComponentDef> getAppParam(final HttpServletRequest request, final Map<String, Object> configMap) {
        String appName = app.get(request, null);
        String cmpName = null;

        if (appName == null && configMap != null) {
            appName = (String) configMap.get("app");
            if (appName == null) {
                cmpName = (String) configMap.get("cmp");
            }
        }
        try {
            if (appName != null) {
                return definitionService.getDefDescriptor(appName, ApplicationDef.class);
            } else if (cmpName != null) {
                return definitionService.getDefDescriptor(cmpName, ComponentDef.class);
            }
        } catch (final AuraRuntimeException are) {
            // We report it in the exception as "app.name" even though it may be "contextConfig.name -> app"
            // because we don't want to initialize another variable to maintain where the value actually came
            // from.
            final InvalidParamException ipe = new InvalidParamException((appName == null) ? (contextConfig.name + " -> cmp") : app.name, are);
            loggingService.warn(ipe.getMessage(), are);
            throw ipe;
        }
        return null;
    }

    protected Mode getMode(HttpServletRequest request) {
        Map<String, Object> configMap = getConfigMap(request);
        return getMode(request, configMap);
    }
    
    protected String getActionPublicCacheKey(Map<String, Object> configMap) {
        if (configMap != null) {
            if (configMap.containsKey("apck")) {
                return (String) configMap.get("apck");
            }
            return null;
        }
        return configAdapter.getActionPublicCacheKey();
    }

    protected void endContext() {
        contextService.endContext();
    }

    @Override
    public void destroy() {
        // Nothing needs to be destroyed
    }

    @Override
    public void init(FilterConfig filterConfig) {
        processInjection(filterConfig);
        if (testFilter != null) {
            testFilter.init(filterConfig);
        }
    }

    public void processInjection(FilterConfig filterConfig) {
        SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, filterConfig.getServletContext());
    }

    public AuraDeprecated getAuraDeprecated() {
        return auraDeprecated;
    }

    @Inject
    public void setAuraDeprecated(AuraDeprecated auraDeprecated) {
        this.auraDeprecated = auraDeprecated;
    }
}

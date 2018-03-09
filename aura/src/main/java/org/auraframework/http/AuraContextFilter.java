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

import com.google.common.collect.Maps;

import java.io.IOException;
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

import org.apache.http.HttpHeaders;
import org.auraframework.AuraDeprecated;
import org.auraframework.adapter.ConfigAdapter;
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
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonReader;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

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
    protected static final BooleanParam modulesParam = new BooleanParam(AuraServlet.AURA_PREFIX + "modules", false);
    protected static final BooleanParam compatParam = new BooleanParam(AuraServlet.AURA_PREFIX + "compat", false);

    private AuraTestFilter testFilter;

    private AuraDeprecated auraDeprecated; // force initialization of Aura

    private ContextService contextService;
    private LoggingService loggingService;
    private DefinitionService definitionService;
    protected ConfigAdapter configAdapter;
    protected SerializationService serializationService;
    private BrowserCompatibilityService browserCompatibilityService;

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
        } catch (InvalidParamException e) {
            HttpServletResponse response = (HttpServletResponse) res;
            response.setStatus(500);
            Appendable out = response.getWriter();
            out.append(e.getMessage());
            return;
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

    protected AuraContext startContext(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,ServletException {
        HttpServletRequest request = (HttpServletRequest) req;

        Format f = format.get(request);
        Authentication a = access.get(request, Authentication.AUTHENTICATED);

        Map<String, Object> configMap = getConfigMap(request);
        Mode m = getMode(request, configMap);

        DefDescriptor<? extends BaseComponentDef> appDesc = getAppParam(request, configMap);

        //
        // FIXME: our usage of format should be revisited. Most URLs have
        // a fixed format, so we should have a way of getting that.
        //
        if (f == null) {
            if (AuraComponentDefinitionServlet.URI_DEFINITIONS_PATH.equals(request.getServletPath())) {
                f = Format.JSON;
            } else if ("GET".equals(request.getMethod()) && !isActionParam.get(request, false)) {
                f = Format.HTML;
            } else {
                f = Format.JSON;
            }
        }

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

        context.setForceCompat(forceCompat(request, configMap, m));
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
                    context.setGlobalValue(entry.getKey(), entry.getValue());
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
        if (!AuraTextUtil.isNullEmptyOrWhitespace(config)) {
            if (config.startsWith(AuraTextUtil.urlencode("{"))) {
                // Decode encoded context json. Serialized AuraContext json always starts with "{"
                config = AuraTextUtil.urldecode(config);
            }
            try {
                configMap = (Map<String, Object>) new JsonReader().read(config);
            } catch (Throwable throwable){
                //config map was invalid. log the bad json and move on. Callers are protected against null.
                loggingService.warn("aura.config was invalid JSON:" + config, throwable);
            }
        }
        return configMap;
    }

    private Mode getModeParam(HttpServletRequest request, Map<String, Object> configMap) {
        // Get the passed in mode param.
        // Check the aura.mode param first then fall back to the mode value
        // embedded in the aura.context param
        Mode m = mode.get(request);
        if (m == null && configMap != null && configMap.containsKey("mode")) {
            m = Mode.valueOf((String) configMap.get("mode"));
        }
        return m;
    }

    protected Mode getModeParam(HttpServletRequest request) {
        Map<String, Object> configMap = getConfigMap(request);
        return getModeParam(request, configMap);
    }

    protected Mode getMode(HttpServletRequest request, Map<String, Object> configMap) {
        Mode m = getModeParam(request, configMap);

        if (m == null) {
            m = configAdapter.getDefaultMode();
        }
        Set<Mode> allowedModes = configAdapter.getAvailableModes();
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
     * @param mode Aura context mode
     * @return whether compat module should be served
     */
    protected boolean useCompatSource(HttpServletRequest request, Map<String, Object> configMap, Mode mode) {
        if (configMap != null) {
            // when c is present, it's a request to fetch module compiled code in compatibility mode
            return configMapContains("c", "1", configMap);
        }

        String uaHeader = request.getHeader(HttpHeaders.USER_AGENT);
        return !this.browserCompatibilityService.isCompatible(uaHeader);
    }

    /**
     * force compat mode
     *
     * @param request http request
     * @param mode Aura context mode
     * @return whether compat module should be served
     */
    protected boolean forceCompat(HttpServletRequest request, Map<String, Object> configMap, Mode mode) {
        if (configMap != null) {
            // when fc is present, it's a request to fetch module compiled code in compatibility mode
            return configMapContains("fc", "1", configMap);
        }

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

    private boolean configMapContains(@Nonnull String key, @Nonnull String value, @Nonnull Map<String, Object> configMap) {
        // configMap is present when processing requests with url encoded AuraContext ie app.js
        if (configMap.containsKey(key)) {
            String configValue = String.valueOf(configMap.get(key));
            return value.equals(configValue);
        } else {
            return false;
        }
    }

    private DefDescriptor<? extends BaseComponentDef> getAppParam(HttpServletRequest request, Map<String, Object> configMap) {
        String appName = app.get(request, null);
        String cmpName = null;

        if (appName == null && configMap != null) {
            appName = (String) configMap.get("app");
            if (appName == null) {
                cmpName = (String) configMap.get("cmp");
            }
        }
        if (appName != null) {
            return definitionService.getDefDescriptor(appName, ApplicationDef.class);
        } else if (cmpName != null) {
            return definitionService.getDefDescriptor(cmpName, ComponentDef.class);
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
            } else {
                return null;
            }
        }
        return configAdapter.getActionPublicCacheKey();
    }

    protected void endContext() {
        contextService.endContext();
    }

    @Override
    public void destroy() {
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
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

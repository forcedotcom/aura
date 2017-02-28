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
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpHeaders;
import org.auraframework.AuraDeprecated;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.LocalizationAdapter;
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

import com.google.common.collect.Maps;

public class AuraContextFilter implements Filter {
    public static final EnumParam<AuraContext.Mode> mode = new EnumParam<>(AuraServlet.AURA_PREFIX
            + "mode", false, AuraContext.Mode.class);

    private static final EnumParam<Format> format = new EnumParam<>(AuraServlet.AURA_PREFIX + "format", false,
            Format.class);

    private static final EnumParam<Authentication> access = new EnumParam<>(AuraServlet.AURA_PREFIX
            + "access", false, Authentication.class);

    private static final StringParam app = new StringParam(AuraServlet.AURA_PREFIX + "app", 0, false);
    private static final StringParam num = new StringParam(AuraServlet.AURA_PREFIX + "num", 0, false);
    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);
    protected static final BooleanParam modulesParam = new BooleanParam(AuraServlet.AURA_PREFIX + "modules", false);

    private String componentDir = null;

    private static final Log LOG = LogFactory.getLog(AuraContextFilter.class);

    private AuraTestFilter testFilter;

    private AuraDeprecated auraDeprecated; // force initialization of Aura

    private ContextService contextService;
    private LoggingService loggingService;
    private DefinitionService definitionService;
    protected ConfigAdapter configAdapter;
    protected SerializationService serializationService;
    private LocalizationAdapter localizationAdapter;

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
    public void setLocalizationAdapter(LocalizationAdapter localizationAdapter) {
        this.localizationAdapter = localizationAdapter;
    }

    public AuraTestFilter getAuraTestFilter() {
        return testFilter;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException, IOException {

        if (contextService.isEstablished()) {
            LOG.error("Aura context was not released correctly! New context will NOT be created.");
            chain.doFilter(req, res);
            return;
        }

        try {
            startContext(req, res, chain);
            HttpServletRequest request = (HttpServletRequest) req;
            loggingService.setValue(LoggingService.REQUEST_METHOD, request.getMethod());
            loggingService.setValue(LoggingService.AURA_REQUEST_URI, request.getRequestURI());
            loggingService.setValue(LoggingService.AURA_REQUEST_QUERY, request.getQueryString());
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

        if (componentDir != null) {
            System.setProperty("aura.componentDir", componentDir);
        }
        //
        // FIXME: our usage of format should be revisited. Most URLs have
        // a fixed format, so we should have a way of getting that.
        //
        if (f == null) {
            if ("GET".equals(request.getMethod())) {
                f = Format.HTML;
            } else {
                f = Format.JSON;
            }
        }

        List<Locale> requestedLocales = Collections.list(request.getLocales());

        //
        // When a context is starting, LocalizationAdapter does not have a valid
        // context to get the requested locales to create appropriate
        // AuraLocale.
        // So, we pass the locales to LocalizationAdapter
        //
        localizationAdapter.setRequestedLocales(requestedLocales);

        AuraContext context = contextService.startContext(m, f, a, appDesc);

        //
        // Reset it after the context is started (created)
        //
        localizationAdapter.setRequestedLocales(null);

        String contextPath = request.getContextPath();
        // some appservers (like tomcat) use "/" as the root path, others ""
        if (contextPath == null || "/".equals(contextPath)) {
            contextPath = "";
        }
        context.setContextPath(contextPath);
        context.setNum(num.get(request));
        context.setRequestedLocales(requestedLocales);
        context.setClient(new Client(request.getHeader(HttpHeaders.USER_AGENT)));
        context.setModulesEnabled(isModulesEnabled(request, configMap, m));
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
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();

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
                        DefDescriptor<?> ld = null;

                        ld = definitionService.getDefDescriptor(defStr, type.getPrimaryInterface());
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
            configMap = (Map<String, Object>) new JsonReader().read(config);
        }
        return configMap;
    }

    private Mode getModeParam(HttpServletRequest request, Map<String, Object> configMap) {
        // Get the passed in mode param.
        // Check the aura.mode param first then fall back to the mode value
        // embedded in the aura.context param
        Mode m = null;
        m = mode.get(request);
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
     * Whether modules should be enabled based on ConfigAdapter, URL param, or context config from URL
     *
     * @param request http request
     * @param configMap context config from encoded url
     * @return whether modules should be enabled
     */
    protected boolean isModulesEnabled(HttpServletRequest request, Map<String, Object> configMap, Mode mode) {
        if (configMap != null) {
            // configMap is present when processing requests with url encoded AuraContext ie app.js
            if (configMap.containsKey("m")) {
                // when m is present, it's a request to fetch module enabled content
                // hence, this AuraContext should also be module enabled
                String configValue = String.valueOf(configMap.get("m"));
                return "1".equals(configValue);
            } else {
                return false;
            }
        }

        if (mode != Mode.PROD) {
            // DO NOT allow url param override in prod
            String modulesEnabledParam = request.getParameter(AuraServlet.AURA_PREFIX + "modules");
            if (modulesEnabledParam != null) {
                // Uses BooleanParam which is true for "1", "true", "yes". Anything else is false.
                return modulesParam.get(request);
            }
        }

        return configAdapter.isModulesEnabled();
    }

    private DefDescriptor<? extends BaseComponentDef> getAppParam(HttpServletRequest request, Map<String, Object> configMap) {
        String appName = null;
        String cmpName = null;

        appName = app.get(request, null);
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

    protected void endContext() {
        contextService.endContext();
    }

    @Override
    public void destroy() {
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        processInjection(filterConfig);
        String dirConfig = filterConfig.getInitParameter("componentDir");
        if (!AuraTextUtil.isNullEmptyOrWhitespace(dirConfig)) {
            componentDir = filterConfig.getServletContext().getRealPath("/") + dirConfig;
        }
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

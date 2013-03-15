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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonReader;

/**
 */
public class AuraContextFilter implements Filter {
    private static final boolean isProduction = Aura.getConfigAdapter().isProduction();

    public static final EnumParam<AuraContext.Mode> mode = new EnumParam<AuraContext.Mode>(AuraServlet.AURA_PREFIX
            + "mode", false, AuraContext.Mode.class);

    private static final EnumParam<Format> format = new EnumParam<Format>(AuraServlet.AURA_PREFIX + "format", false,
            Format.class);

    private static final EnumParam<Access> access = new EnumParam<Access>(AuraServlet.AURA_PREFIX + "access", false,
            Access.class);

    private static final StringParam app = new StringParam(AuraServlet.AURA_PREFIX + "app", 0, false);
    private static final StringParam num = new StringParam(AuraServlet.AURA_PREFIX + "num", 0, false);
    private static final StringParam test = new StringParam(AuraServlet.AURA_PREFIX + "test", 0, false);
    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);

    private String componentDir = null;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {
        LoggingService loggingService = Aura.getLoggingService();
        try {
            startContext(req, res, chain);
            HttpServletRequest request = (HttpServletRequest) req;
            loggingService.setValue(LoggingService.REQUEST_METHOD, request.getMethod());
            loggingService.setValue(LoggingService.AURA_REQUEST_URI, request.getRequestURI());
            loggingService.setValue(LoggingService.AURA_REQUEST_QUERY, request.getQueryString());

            chain.doFilter(req, res);
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
                    loggingService.doLog(); // flush out logging values
                }
            } finally {
                endContext();
            }
        }
    }

    @SuppressWarnings("unchecked")
    protected AuraContext startContext(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,
            ServletException {
        HttpServletRequest request = (HttpServletRequest) req;

        Format f = format.get(request, Format.JSON);
        Access a = access.get(request, Access.AUTHENTICATED);

        Map<String, Object> configMap = getConfigMap(request);
        Mode m = getMode(request, configMap);

        DefDescriptor<? extends BaseComponentDef> appDesc = getAppParam(request, configMap);

        if (componentDir != null) {
            System.setProperty("aura.componentDir", componentDir);
        }
        AuraContext context = Aura.getContextService().startContext(m, f, a, appDesc);

        String contextPath = request.getContextPath();
        // some appservers (like tomcat) use "/" as the root path, others ""
        if ("/".equals(contextPath)) {
            contextPath = "";
        }
        context.setContextPath(contextPath);
        context.setNum(num.get(request));
        context.setRequestedLocales(Collections.list(request.getLocales()));
        context.setClient(new Client(request.getHeader("User-Agent")));

        if (configMap != null) {
            String lastMod = (String) configMap.get("lastmod");
            if (lastMod != null && !lastMod.isEmpty()) {
                context.setLastMod(lastMod);
            }
            List<Object> preloads = (List<Object>) configMap.get("preloads");
            if (preloads != null) {
                for (Object preload : preloads) {
                    context.addPreload((String) preload);
                }
            }
            getLoaded(context, configMap.get("loaded"));
            context.setFrameworkUID((String) configMap.get("fwuid"));
        }

        if (!isProduction) {
            TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
            if (testContextAdapter != null) {
                String testName = null;
                // config takes precedence over param because the value is not expected to change during a test and it
                // is less likely to have been modified unintentionally when from the config
                if (configMap != null) {
                    testName = (String) configMap.get("test");
                }
                if (testName == null) {
                    testName = test.get(request);
                }
                if (testName != null) {
                    TestContext testContext = testContextAdapter.getTestContext(testName);
                    if (testContext != null) {
                        MasterDefRegistry registry = context.getDefRegistry();
                        Set<Definition> mocks = testContext.getLocalDefs();
                        if (mocks != null) {
                            for (Definition def : mocks) {
                                registry.addLocalDef(def);
                            }
                        }
                    }
                } else {
                    // if this thread was recycled from a prior test (mostly dev mode), clear out the old context
                    testContextAdapter.release();
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
        DefinitionService definitionService = Aura.getDefinitionService();

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
                        context.addLoaded(ld, uid);
                    }
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getConfigMap(HttpServletRequest request) {
        Map<String, Object> configMap = null;
        String config = contextConfig.get(request);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(config)) {
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
            m = Aura.getConfigAdapter().getDefaultMode();
        }
        Set<Mode> allowedModes = Aura.getConfigAdapter().getAvailableModes();
        boolean forceProdMode = !allowedModes.contains(m) && allowedModes.contains(Mode.PROD);
        if (forceProdMode) {
            m = Mode.PROD;
        }

        return m;
    }

    private DefDescriptor<? extends BaseComponentDef> getAppParam(HttpServletRequest request,
            Map<String, Object> configMap) {
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
            return Aura.getDefinitionService().getDefDescriptor(appName, ApplicationDef.class);
        } else if (cmpName != null) {
            return Aura.getDefinitionService().getDefDescriptor(cmpName, ComponentDef.class);
        }
        return null;
    }

    protected Mode getMode(HttpServletRequest request) {
        Map<String, Object> configMap = getConfigMap(request);
        return getMode(request, configMap);
    }

    protected void endContext() {
        Aura.getContextService().endContext();
    }

    @Override
    public void destroy() {
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        String dirConfig = filterConfig.getInitParameter("componentDir");
        if (!AuraTextUtil.isNullEmptyOrWhitespace(dirConfig)) {
            componentDir = filterConfig.getServletContext().getRealPath("/") + dirConfig;
        }
    }
}

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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpHeaders;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.ThemeDef;
import org.auraframework.http.RequestParam.BooleanParam;
import org.auraframework.http.RequestParam.EnumParam;
import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.test.Resettable;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Maps;

public class AuraContextFilter implements Filter {
    private static final boolean isProduction = Aura.getConfigAdapter().isProduction();

    public static final EnumParam<AuraContext.Mode> mode = new EnumParam<AuraContext.Mode>(AuraServlet.AURA_PREFIX
            + "mode", false, AuraContext.Mode.class);

    public static final BooleanParam isDebugToolEnabled = new BooleanParam(AuraServlet.AURA_PREFIX
            + "debugtool", false);

    private static final EnumParam<Format> format = new EnumParam<Format>(AuraServlet.AURA_PREFIX + "format", false,
            Format.class);

    private static final EnumParam<Authentication> access = new EnumParam<Authentication>(AuraServlet.AURA_PREFIX
            + "access", false,
            Authentication.class);

    private static final StringParam app = new StringParam(AuraServlet.AURA_PREFIX + "app", 0, false);
    private static final StringParam num = new StringParam(AuraServlet.AURA_PREFIX + "num", 0, false);
    private static final StringParam test = new StringParam(AuraServlet.AURA_PREFIX + "test", 0, false);
    private static final BooleanParam testReset = new BooleanParam(AuraServlet.AURA_PREFIX + "testReset", false);
    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);

    private String componentDir = null;

    private static final Log LOG = LogFactory.getLog(AuraContextFilter.class);

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        if (Aura.getContextService().isEstablished()) {
            LOG.error("Aura context was not released correctly! New context will NOT be created.");
            chain.doFilter(req, res);
            return;
        }

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
                    loggingService.flush(); // flush out logging values
                }
            } finally {
                endContext();
            }
        }
    }

    protected AuraContext startContext(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,
            ServletException {
        HttpServletRequest request = (HttpServletRequest) req;

        Format f = format.get(request);
        Authentication a = access.get(request, Authentication.AUTHENTICATED);

        Map<String, Object> configMap = getConfigMap(request);
        Mode m = getMode(request, configMap);
        boolean d = getDebugToolParam(request);

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
        AuraContext context = Aura.getContextService().startContext(m, f, a, appDesc, d);

        String contextPath = request.getContextPath();
        // some appservers (like tomcat) use "/" as the root path, others ""
        if ("/".equals(contextPath)) {
            contextPath = "";
        }
        context.setContextPath(contextPath);
        context.setNum(num.get(request));
        context.setRequestedLocales(Collections.list(request.getLocales()));
        context.setClient(new Client(request.getHeader(HttpHeaders.USER_AGENT)));
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
            List<String> themes = (List<String>) configMap.get("themes");
            if (themes != null) {
                try {
                    DefinitionService ds = Aura.getDefinitionService();
                    for (String theme : themes) {
                        context.appendThemeDescriptor(ds.getDefDescriptor(theme, ThemeDef.class));
                    }
                } catch (QuickFixException e) {
                    throw new AuraRuntimeException(e);
                }
            }
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
                            boolean doReset = testReset.get(request);
                            for (Definition def : mocks) {
                                if (doReset && def instanceof Resettable) {
                                    ((Resettable) def).reset();
                                }
                                registry.addLocalDef(def);
                            }
                        }
                    }
                } else {
                    testContextAdapter.clear();
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
        ConfigAdapter configAdapter = Aura.getConfigAdapter();
        
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

    protected Boolean getDebugToolParam(HttpServletRequest request) {
        // Get Passed in aura.debugtool param
        return isDebugToolEnabled.get(request);
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

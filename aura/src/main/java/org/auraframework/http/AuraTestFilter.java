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
import java.util.Map;
import java.util.Set;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.def.Definition;
import org.auraframework.http.RequestParam.BooleanParam;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.test.Resettable;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonReader;

/**
 * Handle requests for JS Component tests
 */
public class AuraTestFilter implements Filter {
    private static final Log LOG = LogFactory.getLog(AuraTestFilter.class);

    private static final StringParam test = new StringParam(AuraServlet.AURA_PREFIX + "test", 0, false);
    private static final BooleanParam testReset = new BooleanParam(AuraServlet.AURA_PREFIX + "testReset", false);
    private static final StringParam contextConfig = new StringParam(AuraServlet.AURA_PREFIX + "context", 0, false);

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        if (!Aura.getConfigAdapter().isTestAllowed()) {
            chain.doFilter(req, res);
            return;
        }

        if (!Aura.getContextService().isEstablished()) {
            LOG.error("Aura context is not established! New context will NOT be created.");
            chain.doFilter(req, res);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) req;
        
        // handle mocks
        TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
        if (testContextAdapter != null) {
            Map<String, Object> configMap = getConfigMap(request);

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
                    AuraContext context = Aura.getContextService().getCurrentContext();
                    MasterDefRegistry registry = context.getDefRegistry();
                    Set<Definition> mocks = testContext.getLocalDefs();
                    if (mocks != null) {
                        boolean error = false;
                        boolean doReset = testReset.get(request);
                        for (Definition def : mocks) {
                            try {
                                if (doReset && def instanceof Resettable) {
                                    ((Resettable) def).reset();
                                }
                                registry.addLocalDef(def);
                            } catch (Throwable t) {
                                LOG.error("Failed to add mock " + def, t);
                                error = true;
                            }
                        }
                        if (error) {
                            testContextAdapter.release();
                        }
                    }
                }
            } else {
                testContextAdapter.clear();
            }
        }

        chain.doFilter(req, res);
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

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }
}

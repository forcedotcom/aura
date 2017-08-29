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
package org.auraframework.test.perf.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.inject.Inject;

import org.auraframework.AuraDeprecated;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.PerfTestSuite;
import org.auraframework.util.test.perf.metrics.PerfMetricsComparator;

import com.google.common.collect.ImmutableList;

import junit.framework.TestCase;
import junit.framework.TestSuite;

@PerfTestSuite
public abstract class PerfEngineBaseTestSuite extends TestSuite implements PerfTestFramework {

    private static String DB_INSTANCE = System.getProperty("dbURI");
    private static final Logger LOG = Logger.getLogger(PerfEngineBaseTestSuite.class.getSimpleName());

    @Inject
    protected AuraDeprecated auraDeprecated; // used to boot Aura services from command-line execution of these tests
    
    @Inject
    private ContextService contextService;

    @Inject
    private PerfConfigUtil perfConfigUtil;
    
    protected PerfEngineBaseTestSuite(String name) throws Exception {
        LOG.info("ComponentPerfTestEngine: " + name);
        setName(name);
        init();
    }

    private void init() throws Exception {
        initializeBeans();
        Map<DefDescriptor<BaseComponentDef>, PerfConfig> tests = discoverTests();
        runTests(tests);
    }

    abstract protected void initializeBeans() throws Exception;
    
    @Override
    public void runTests(Map<DefDescriptor<BaseComponentDef>, PerfConfig> tests) throws Exception {
        // Map component def to component config options.
        for (Map.Entry<DefDescriptor<BaseComponentDef>, PerfConfig> entry : tests.entrySet()) {
            addTest(new ComponentTestSuite(entry.getKey(), entry.getValue()));
        }
    }

    @Override
    public Map<DefDescriptor<BaseComponentDef>, PerfConfig> discoverTests() {
        return perfConfigUtil.getComponentTestsToRun(getNamespaces());
    }
    
    public List<DefDescriptor<BaseComponentDef>> getComponentDefs(Map<DefDescriptor<BaseComponentDef>, PerfConfig> configMap) {
        List<DefDescriptor<BaseComponentDef>> defs = new ArrayList<>();
        for (DefDescriptor<BaseComponentDef> def : configMap.keySet())
            defs.add(def);
        return defs;
    }

	private class ComponentTestSuite extends TestSuite {
        ComponentTestSuite(DefDescriptor<BaseComponentDef> defDescriptor, final PerfConfig config) throws Exception {
            super(defDescriptor.getName());
            boolean doEndContext = false;
            if (!contextService.isEstablished()) {
                contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
                doEndContext = true;
            }
            try {

                PerfExecutorTestCase test = new PerfExecutorTestCase(defDescriptor, config, DB_INSTANCE);
                test.setPerfMetricsComparator(new PerfMetricsComparator() {
                    @Override
                    protected int getAllowedVariability(String metricName) {
                        if (config.getVariability(metricName) != null) { return config.getVariability(metricName); }
                        // Use default variability, if variability is
                        // not set in config
                        return super.getAllowedVariability(metricName);
                    }
                });
                addTest(patchPerfComponentTestCase(test, defDescriptor));
            } finally {
                if (doEndContext) {
                    contextService.endContext();
                }
            }
        }
	}

    /**
     * @return the list of namespaces to create tests for
     */
    public List<String> getNamespaces() {
        return ImmutableList.of("PerformanceTest");
    }
    
    private String resolveGoldFilePath(PerfExecutorTestCase test) {
        String path = AuraUtil.getAuraHome() + "/aura-components/src/test/components/";
        String componentPath = test.getComponentDef().getNamespace() + "/" + test.getComponentDef().getName();
        String fullPath = path + componentPath;
        return fullPath;
    }
    
    /**
     * Sfdc specific tweaks can be made here to tests running in core.
     * @param test
     * @param descriptor
     * @return return test
     */
	protected TestCase patchPerfComponentTestCase(PerfExecutorTestCase test,
			DefDescriptor<BaseComponentDef> descriptor) throws Exception {
		test.setExplicitGoldResultsFolder(resolveGoldFilePath(test));
		return test;
	}
}

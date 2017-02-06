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

import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.system.AuraContext.Mode;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Maps;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

/**
 * Unit tests for AuraContextFilter
 */
public class AuraContextFilterUnitTest {

    @Test
    public void testModulesEnabledWithConfigAdapterDEV() throws Exception {
        assertTrue("modules should be enabled with config adapter enabled", isModulesEnabledSetup(true, null, null, Mode.DEV));
    }

    @Test
    public void testModulesEnabledWithConfigAdapterParamDisablePROD() throws Exception {
        assertTrue("modules should be enabled with config adapter enabled", isModulesEnabledSetup(true, "0", null, Mode.PROD));
    }

    @Test
    public void testModulesEnabledWithURLParamDEV() throws Exception {
        assertTrue("modules should be enabled with url param", isModulesEnabledSetup(false, "1", null, Mode.DEV));
    }

    @Test
    public void testModulesEnabledWithURLParamInvalidValueDEV() throws Exception {
        assertFalse("modules should not be enabled with wrong url param value", isModulesEnabledSetup(false, "yes", null, Mode.DEV));
    }

    @Test
    public void testModulesEnabledWithConfigMapDEV() throws Exception {
        assertTrue("modules should be enabled with correct config map", isModulesEnabledSetup(false, null, 1, Mode.DEV));
    }

    @Test
    public void testModulesEnabledURLParamOverridesDEV() throws Exception {
        assertFalse("modules should not be enabled with URL param override", isModulesEnabledSetup(true, "0", true, Mode.DEV));
    }

    @Test
    public void testModulesEnabledURLParamOverridePROD() throws Exception {
        assertFalse("modules should not be enabled with URL param override in PROD", isModulesEnabledSetup(false, "1", false, Mode.PROD));
    }

    private boolean isModulesEnabledSetup(boolean configAdapterValue, String urlParamValue, Object configMapValue, Mode mode) {
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        Mockito.when(configAdapter.isModulesEnabled()).thenReturn(configAdapterValue);
        Mockito.when(request.getParameter(AuraServlet.AURA_PREFIX + "modules")).thenReturn(urlParamValue);

        AuraContextFilter contextFilter = new AuraContextFilter();
        contextFilter.setConfigAdapter(configAdapter);

        Map<String, Object> configMap = Maps.newHashMap();
        if (configMapValue != null) {
            configMap.put("m", configMapValue);
        }

        return contextFilter.isModulesEnabled(request, configMap, mode);
    }
}
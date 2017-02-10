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
package org.auraframework.components.auradocs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.docs.ApiContentsModel;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.system.Annotations.AuraEnabled;

@ServiceComponent
public class LockerApiController implements Controller {

    private ConfigAdapter configAdapter;

    /**
     * Get a map of all APIs we document for external use.
     * 
     * @return a map of Objects and their corresponding @platform APIs. For example `{ $A: ["createComponent", "get"] }`.
     * @throws Exception
     */
    @AuraEnabled
    public Map<String, List<String>> getPlatformApis() throws Exception {
        Map<String, List<String>> ret = new HashMap<>();

        ApiContentsModel.refreshSymbols(configAdapter.getResourceLoader());

        // jsdoc generates a huge object, all we care about is the top level API ($A, Component, etc.) and the
        // @platform methods exposed on those APIs.
        Map<String, Map<String, Object>> symbols = ApiContentsModel.getSymbols();
        for (Map.Entry<String,Map<String,Object>> entry : symbols.entrySet()) {
            String topLevelApi = entry.getKey();
            ArrayList<String> names = new ArrayList<>();
            Map<String, Object> symbol = ApiContentsModel.getSymbol(entry.getKey());
            for (Map.Entry<String, Object> symbolEntry : symbol.entrySet()) {
                String key = symbolEntry.getKey();
                if (key.equals("methods")) {
                    ArrayList<?> methods = (ArrayList<?>) symbolEntry.getValue();
                    for (int i = 0; i < methods.size(); i++) {
                        Map<?, ?> method = (Map<?, ?>) methods.get(i);
                        String name = (String) method.get("name");
                        names.add(name);
                    }
                }
            }
            ret.put(topLevelApi, names);
        }
        return ret;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }
}

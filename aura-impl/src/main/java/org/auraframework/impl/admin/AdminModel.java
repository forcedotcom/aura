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
/**
 */
package org.auraframework.impl.admin;

import java.lang.management.ManagementFactory;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.management.JMException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.system.MasterDefRegistryImpl;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;

import com.google.common.base.Optional;

import com.google.common.cache.CacheStats;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * @since 0.0.177
 */
@Model
public class AdminModel {

    private final Mode m;
    private final List<Map<String, Object>> beanData;
    private final List<Map<String, Object>> registryData;
    private final Map<String,Object> defsData;
    private final Map<String,Object> existsData;
    private final Map<String,Object> stringsData;

    private Map<String,Object> getStats(CacheStats stats) {
        Map<String, Object> data = Maps.newHashMap();

        data.put("evictionCount", String.valueOf(stats.evictionCount()));
        data.put("hitCount", String.valueOf(stats.hitCount()));
        data.put("hitRate", String.valueOf(stats.hitRate()));
        data.put("missCount", String.valueOf(stats.missCount()));
        data.put("missRate", String.valueOf(stats.missRate()));
        data.put("requestCount", String.valueOf(stats.requestCount()));
        return data;
    }

    private void addDefsStats(Map<String, Object> data, Collection<Optional<? extends Definition>> defs) {
        List<Map<String, Object>> defsData = Lists.newArrayListWithCapacity(defs.size());
        int nulls = 0;

        data.put("defs", defsData);
        for (Optional<? extends Definition> odef : defs) {
            Definition def = odef.orNull();
            if (def != null) {
                Map<String, Object> defData = Maps.newHashMap();
                defData.put("class", def.getClass().getName());
                defData.put("descriptor", def.getDescriptor().getQualifiedName());
                defData.put("type", def.getDescriptor().getDefType());
                defData.put("location", def.getLocation());
                defsData.add(defData);
            } else {
                nulls += 1;
            }
        }
        data.put("nulls", nulls);
    }

    public AdminModel() throws JMException {
        AuraContext c = AuraImpl.getContextAdapter().getCurrentContext();
        m = c.getMode();
        MasterDefRegistryImpl mdr = (MasterDefRegistryImpl) c.getDefRegistry();
        DefRegistry<?>[] regs = mdr.getAllRegistries();

        defsData = getStats(MasterDefRegistryImpl.getDefsCacheStats());
        addDefsStats(defsData, MasterDefRegistryImpl.getCachedDefs());
        existsData = getStats(MasterDefRegistryImpl.getExistsCacheStats());
        stringsData = getStats(MasterDefRegistryImpl.getStringsCacheStats());

        registryData = Lists.newArrayListWithCapacity(regs.length);
        for (DefRegistry<?> dr : regs) {
            Map<String, Object> data = Maps.newHashMap();
            data.put("class", dr.getClass().getName());
            data.put("deftypes", dr.getDefTypes().toString());
            data.put("prefixes", dr.getPrefixes().toString());
            data.put("namespaces", dr.getNamespaces().toString());
            registryData.add(data);
        }

        MBeanServer server = ManagementFactory.getPlatformMBeanServer();
        Set<ObjectName> blah = server.queryNames(new ObjectName("aura", "name", "*"), null);
        beanData = Lists.newArrayListWithCapacity(blah.size());
        for (ObjectName on : blah) {
            Map<String, Object> data = Maps.newHashMap();
            data.put("name", on.getKeyProperty("name"));
            data.put("count", server.getAttribute(on, "Count"));
            data.put("maxValue", server.getAttribute(on, "MaxValue"));
            data.put("minValue", server.getAttribute(on, "MinValue"));
            data.put("mostRecentValue", server.getAttribute(on, "MostRecentValue"));
            data.put("totalValue", server.getAttribute(on, "TotalValue"));
            beanData.add(data);
        }

    }

    @AuraEnabled
    public Mode getMode() {
        return m;
    }

    @AuraEnabled
    public Map<String, Object> getDefsData() {
        return defsData;
    }
    
    @AuraEnabled
    public Map<String, Object> getExistsData() {
        return existsData;
    }

    @AuraEnabled
    public Map<String, Object> getStringsData() {
        return stringsData;
    }

    @AuraEnabled
    public List<Map<String, Object>> getRegistryData() {
        return registryData;
    }

    @AuraEnabled
    public List<Map<String, Object>> getBeanData() {
        return beanData;
    }
}

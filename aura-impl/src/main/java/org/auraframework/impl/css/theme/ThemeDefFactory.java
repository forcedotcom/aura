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
package org.auraframework.impl.css.theme;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.system.CacheableDefFactoryImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 */
public class ThemeDefFactory extends CacheableDefFactoryImpl<ThemeDef> {

    public ThemeDefFactory(SourceFactory sourceFactory) {
        super(sourceFactory);
    }

    @Override
    public void save(ThemeDef def) {
        Source<?> source = getSource(def.getDescriptor());
        Writer out = source.getWriter();
        try {
            Map<String, Object> attributes = Maps.newHashMap();
            attributes.put("def", def);
            InstanceService instanceService = Aura.getInstanceService();
            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> tmplDesc = definitionService.getDefDescriptor("auradev:saveTheme",
                    ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attributes);
            Aura.getRenderingService().render(tmpl, out);
        } catch (QuickFixException x) {
            throw new AuraError(x);
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        } finally {
            try {
                out.close();
            } catch (IOException x) {
                throw new AuraRuntimeException(x);
            }
        }
    }
}

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
package org.auraframework.impl.adapter.format.css;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.StyleDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.salesforce.omakase.plugin.Plugin;

import aQute.bnd.annotation.component.Component;

/**
 */
@ThreadSafe
@Component (provide=AuraServiceProvider.class)
public class StyleDefCSSFormatAdapter extends CSSFormatAdapter<StyleDef> {

    @Override
    public Class<StyleDef> getType() {
        return StyleDef.class;
    }

    @Override
    public void writeCollection(Collection<? extends StyleDef> values, Appendable out)
            throws IOException, QuickFixException {
        // get the list of plugins that should be run contextually, e.g., where the plugins have access to the full set
        // of StyleDefs to be combined together. This is important for plugins that need to make decisions based on the
        // aggregate, e.g., a validator that allows at most one occurrence of a particular thing.
        List<Plugin> contextualPlugins = Aura.getStyleAdapter().getContextualRuntimePlugins();

        for (StyleDef def : values) {
            if (def != null) {
                out.append(def.getCode(contextualPlugins));
            }
        }
    }
}

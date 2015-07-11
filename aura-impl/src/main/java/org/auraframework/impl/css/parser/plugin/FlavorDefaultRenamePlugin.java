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
package org.auraframework.impl.css.parser.plugin;

import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Enables renaming .THIS to .THIS--default.
 * <p>
 * If used, this plugin should be registered before any other flavor plugin.
 *
 * @see FlavorPlugin
 */
public final class FlavorDefaultRenamePlugin implements Plugin {
    private static final String DEFAULT_RENAME = FlavorPluginUtil.FLAVORED_THIS + "default";

    @Rework
    public void process(ClassSelector selector) {
        if (selector.name().equals(FlavorPluginUtil.THIS)) {
            selector.name(DEFAULT_RENAME); // rename to THIS--default
        }
    }
}

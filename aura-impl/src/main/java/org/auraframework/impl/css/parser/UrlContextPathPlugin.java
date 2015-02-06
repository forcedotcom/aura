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
package org.auraframework.impl.css.parser;

import com.salesforce.omakase.ast.declaration.UrlFunctionValue;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.Plugin;
import org.auraframework.Aura;

/**
 * Rewrites url() CSS to prepend servlet context path
 */
final class UrlContextPathPlugin implements Plugin {
    @Rework
    public void rework(UrlFunctionValue value) {
        if (value.url().startsWith("/auraFW")) {
            value.url(Aura.getContextService().getCurrentContext().getContextPath() + value.url());
        }
    }
}

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
/*
 * Copyright, 1999-2009, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.impl.javascript.renderer;

import org.auraframework.def.RendererDef;
import org.auraframework.impl.javascript.BaseJavascriptDef;

public class JavascriptRendererDef extends BaseJavascriptDef<RendererDef> implements RendererDef {
    private static final long serialVersionUID = -6937625695562864219L;

    protected JavascriptRendererDef(Builder builder) {
        super(builder);
    }

    public static class Builder extends BaseJavascriptDef.Builder<RendererDef> {

        public Builder() {
            super(RendererDef.class);
        }

        @Override
        public JavascriptRendererDef build() {
            return new JavascriptRendererDef(this);
        }
    }
}

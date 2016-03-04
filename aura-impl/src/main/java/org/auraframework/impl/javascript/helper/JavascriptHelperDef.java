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
package org.auraframework.impl.javascript.helper;


import org.auraframework.def.HelperDef;
import org.auraframework.impl.javascript.BaseJavascriptDef;

public class JavascriptHelperDef extends BaseJavascriptDef<HelperDef> implements HelperDef {
    private static final long serialVersionUID = 1967445547376133339L;

	protected JavascriptHelperDef(Builder builder) {
		super(builder);
	}

    public static class Builder extends BaseJavascriptDef.Builder<HelperDef> {

        public Builder() {
            super(HelperDef.class);
        }

        @Override
        public JavascriptHelperDef build() {
            return new JavascriptHelperDef(this);
        }
    }
}

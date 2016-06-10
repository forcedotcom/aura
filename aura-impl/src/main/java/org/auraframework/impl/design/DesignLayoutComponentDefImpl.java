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
package org.auraframework.impl.design;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.design.DesignLayoutComponentDef;
import org.auraframework.impl.system.BaseXmlElementImpl;
import org.auraframework.throwable.quickfix.QuickFixException;

public class DesignLayoutComponentDefImpl extends BaseXmlElementImpl implements DesignLayoutComponentDef {

    private static final long serialVersionUID = 1323281135124425825L;
    private final DefDescriptor<ComponentDef> cmp;
    protected DesignLayoutComponentDefImpl(Builder builder) {
        super(builder);
        this.cmp = builder.cmp;
    }

    @Override
    public DefDescriptor<ComponentDef> getComponentDef() {
        return cmp;
    }

    public static class Builder extends BaseBuilderImpl {
        private DefDescriptor<ComponentDef> cmp;

        public Builder() {
            super(DesignLayoutComponentDef.class);
        }

        public void setComponent(DefDescriptor<ComponentDef> cmp) {
            this.cmp = cmp;
        }

        public DesignLayoutComponentDef build() throws QuickFixException {
            return new DesignLayoutComponentDefImpl(this);
        }
    }
}

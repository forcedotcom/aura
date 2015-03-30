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

import org.auraframework.def.design.DesignLayoutAttributeDef;
import org.auraframework.def.design.DesignLayoutComponentDef;
import org.auraframework.def.design.DesignLayoutItemDef;

public class DesignLayoutItemDefImpl implements  DesignLayoutItemDef{
    private final DesignLayoutComponentDef cmp;
    private final DesignLayoutAttributeDef attr;
    private boolean isAttribute;

    public DesignLayoutItemDefImpl(DesignLayoutComponentDef cmp) {
        this.cmp = cmp;
        isAttribute = false;
        this.attr = null;
    }

    public DesignLayoutItemDefImpl(DesignLayoutAttributeDef attr) {
        this.attr = attr;
        this.cmp = null;
        isAttribute = true;
    }

    @Override
    public boolean isAttribute() {
        return isAttribute;
    }

    @Override
    public DesignLayoutAttributeDef getAttribute() {
        return attr;
    }

    @Override
    public DesignLayoutComponentDef getComponent() {
        return cmp;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) {
            return false;
        } else if (o.getClass() == getClass()) {
            DesignLayoutItemDefImpl that = (DesignLayoutItemDefImpl)o;
            return (attr != null && that.getAttribute().equals(attr)) || (cmp != null && that.getComponent().equals(cmp));
        } else if (attr != null && o.getClass() == attr.getClass()) {
            return attr.equals(o);
        } else if (cmp != null && o.getClass() == cmp.getClass()) {
            return cmp.equals(o);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return cmp != null ? cmp.hashCode() :
                attr != null ? attr.hashCode() : 0;
    }
}

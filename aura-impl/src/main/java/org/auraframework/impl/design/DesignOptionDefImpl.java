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

import org.auraframework.def.design.DesignOptionDef;
import org.auraframework.def.genericxml.GenericXmlElement;

public class DesignOptionDefImpl implements DesignOptionDef {

    private static final long serialVersionUID = -990356785176000885L;
    private final GenericXmlElement tag;

    protected DesignOptionDefImpl(GenericXmlElement tag) {
        this.tag = tag;
    }

    @Override
    public String getKey() {
        return tag.getAttributes().get(NAME);
    }

    @Override
    public String getValue() {
        return tag.getAttributes().get(VALUE);
    }

    @Override
    public String getAccessString() {
        return tag.getAttributes().get(ACCESS);
    }
}

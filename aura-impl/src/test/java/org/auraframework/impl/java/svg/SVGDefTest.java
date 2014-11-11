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
package org.auraframework.impl.java.svg;

import org.auraframework.Aura;
import org.auraframework.def.SVGDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

public class SVGDefTest extends AuraImplTestCase {

    public SVGDefTest(String name) {
        super(name);
    }

    public void testGetSVGDef() throws Exception {
        SVGDef svg = Aura.getDefinitionService().getDefinition("test:fakeComponent", SVGDef.class);
        assertNotNull("SVGDef not found!", svg);
        assertNotNull("SVGDef source should not be null!", svg.getSource());
        String contents = svg.getSource().getContents();
        assertTrue("SVGDef source should not be empty!", contents != null && contents.length() > 0);
    }

    public void testGetNonExistentSVGDef() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("this:doesNotExist", SVGDef.class);
        } catch (Exception t) {
            assertExceptionMessageStartsWith(t, DefinitionNotFoundException.class,
                    "No SVG named markup://this:doesNotExist found");
        }
    }
}

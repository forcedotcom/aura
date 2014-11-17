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
import org.auraframework.throwable.quickfix.SVGParserException;

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
        assertTrue("SVGDef source should contain reference to SVG!", contents.contains("SVG"));
    }

    public void testGetNonExistentSVGDef() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("this:doesNotExist", SVGDef.class);
            fail("SVGDef for 'this:doesNotExist' should not exist.");
        } catch (Exception t) {
            assertExceptionMessageStartsWith(t, DefinitionNotFoundException.class,
                    "No SVG named markup://this:doesNotExist found");
        }
    }

    public void testSvgParsingLimit() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("test:svgIsTooLarge", SVGDef.class);
            fail("SVGDef for 'test:svgIsTooLarge' should be too large.");
        } catch (Exception t) {
            assertExceptionMessageStartsWith(t, SVGParserException.class,
                    "SVGDef length must be less than");
        }
    }
}

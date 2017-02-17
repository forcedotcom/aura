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
package org.auraframework.impl.svg.parser;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SVGDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.SVGParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

public class SVGParserTest extends AuraImplTestCase {
    private static final String INVALID_ATTR = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n"+
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n"+
            "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n"+
            "<svg xmlns:svg=\"http://www.w3.org/2000/svg\"\n"+
            "       xmlns=\"http://www.w3.org/2000/svg\"\n"+
            "       version=\"1.0\"\n"+
            "       width=\"1350\"\n"+
            "       height=\"900\"\n"+
            "       id=\"svg2\"\n"+
            "       xml:space=\"preserve\">\n"+
            " <line onclick=\"alert(Hacked)\"/>\n"+
            "</svg>";
    private static final String INVALID_CHAR = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
            "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
            "<svg xmlns:svg=\"http://www.w3.org/2000/svg\"\n" +
            "       xmlns=\"http://www.w3.org/2000/svg\"\n" +
            "       version=\"1.0\"\n" +
            "       width=\"1350\"\n" +
            "       height=\"900\"\n" +
            "       id=\"svg2\"\n" +
            "       xml:space=\"preserve\">\n" +
            "     <!--We disallow &,/,<,> from content, the XML parser will convert &lt; to <-->\n" +
            "     &lt;g&gt;\n" +
            "</svg>";
    private static final String INVALID_SCRIPT = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
            "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
            "<svg xmlns:svg=\"http://www.w3.org/2000/svg\"\n" +
            "       xmlns=\"http://www.w3.org/2000/svg\"\n" +
            "       version=\"1.0\"\n" +
            "       width=\"1350\"\n" +
            "       height=\"900\"\n" +
            "       id=\"svg2\"\n" +
            "       xml:space=\"preserve\">\n" +
            "     <script>alert(\"Script tag\")</script>\n" +
            "</svg>";
    private static final String INVALID_XML = "</body>\n" +
            "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
            "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
            "<svg xmlns:svg=\"http://www.w3.org/2000/svg\"\n" +
            "       xmlns=\"http://www.w3.org/2000/svg\"\n" +
            "       version=\"1.0\"\n" +
            "       width=\"1350\"\n" +
            "       height=\"900\"\n" +
            "       id=\"svg2\"\n" +
            "       xml:space=\"preserve\">\n" +
            "     <script>alert(\"Script tag\")</script>\n" +
            "</svg>";
    private static final String VALID_SVG = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
            "<!--I can have comments before-->\n" +
            "<!--And xml start-->\n" +
            "<!--A doctype is good too-->\n" +
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
            "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
            "<svg xmlns:svg=\"http://www.w3.org/2000/svg\"\n" +
            "       xmlns=\"http://www.w3.org/2000/svg\"\n" +
            "       version=\"1.0\"\n" +
            "       width=\"1350\"\n" +
            "       height=\"900\"\n" +
            "       id=\"svg2\"\n" +
            "       xml:space=\"preserve\">\n" +
            "<!--Im being lazy but these should all work-->\n" +
            "  <a/>\n" +
            "  <altglyph/>\n" +
            "  <altglyphdef/>\n" +
            "  <altglyphitem/>\n" +
            "  <circle/>\n" +
            "  <defs/>\n" +
            "  <desc/>\n" +
            "  <ellipse/>\n" +
            "  <g/>\n" +
            "  <image/>\n" +
            "  <line/>\n" +
            "  <lineargradient/>\n" +
            "  <marker/>\n" +
            "  <mask/>\n" +
            "  <path/>\n" +
            "  <pattern/>\n" +
            "  <polygon/>\n" +
            "  <polyline/>\n" +
            "  <radialgradient/>\n" +
            "  <rect/>\n" +
            "  <stop/>\n" +
            "  <svg/>\n" +
            "  <text/>\n" +
            "  <style/>\n" +
            "  <filter/>\n" +
            "  <tspan/>\n" +
            "  <use/>\n" +
            "  <feoffset/>\n" +
            "  <feflood/>\n" +
            "  <fecomposite/>\n" +
            "  <grid/>\n" +
            "  <feblend/>\n" +
            "<!--End being lazy-->\n" +
            "<!--This is pretty much a valid svg-->\n" +
            "<defs\n" +
            "     id=\"defs10\" /><rect\n" +
            "     width=\"1350\"\n" +
            "     height=\"900\"\n" +
            "     x=\"0\"\n" +
            "     y=\"0\"\n" +
            "     style=\"fill:#ffffff\"\n" +
            "     id=\"rect4117\" /><path\n" +
            "     d=\"\"\n" +
            "     style=\"fill:#000066\"\n" +
            "     id=\"path2128\" /><path\n" +
            "     d=\"\"\n" +
            "     style=\"fill:#ffffff\"\n" +
            "     id=\"path6\" /><path\n" +
            "     d=\" \"\n" +
            "     style=\"fill:#000066\"\n" +
            "     id=\"path2132\" /><rect\n" +
            "     width=\"1350\"\n" +
            "     height=\"300\"\n" +
            "     x=\"0\"\n" +
            "     y=\"0\"\n" +
            "     style=\"fill:#ff9933\"\n" +
            "     id=\"rect2172\" /><rect\n" +
            "     width=\"1350\"\n" +
            "     height=\"300\"\n" +
            "     x=\"0\"\n" +
            "     y=\"600\"\n" +
            "     style=\"fill:#138808\"\n" +
            "     id=\"rect3146\" />\n" +
            "</svg>";

    @Inject
    private SVGParser parser;

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    @Test
    public void testValidTags() throws QuickFixException {
        DefDescriptor<SVGDef> descriptor = getAuraTestingUtil().createStringSourceDescriptor(null, SVGDef.class, null);
        TextSource<SVGDef> source = new StringSource<>(descriptor, VALID_SVG, "test", null);
        parser.getDefinition(descriptor,source);
    }

    @Test
    public void testInvalidTags() {
        QuickFixException qfe = null;
        DefDescriptor<SVGDef> descriptor = getAuraTestingUtil().createStringSourceDescriptor(null, SVGDef.class, null);
        TextSource<SVGDef> source = new StringSource<>(descriptor, INVALID_SCRIPT, "test", null);
        try {
            parser.getDefinition(descriptor,source);
        } catch (QuickFixException e) {
            qfe = e;
        }
        assertNotNull("SVG can not contain script tags", qfe);
        assertTrue("Message should contain 'script': "+qfe.getMessage(), qfe.getMessage().contains("script"));
    }

    @Test
    public void testInvalidCharacters() {
        QuickFixException qfe = null;
        DefDescriptor<SVGDef> descriptor = getAuraTestingUtil().createStringSourceDescriptor(null, SVGDef.class, null);
        TextSource<SVGDef> source = new StringSource<>(descriptor, INVALID_CHAR, "test", null);
        try {
            parser.getDefinition(descriptor,source);
        } catch (QuickFixException e) {
            qfe = e;
        }
        assertNotNull("SVG can not contain characters, &, /, <, > ", qfe);
        assertTrue("Message should contain '<': "+qfe.getMessage(), qfe.getMessage().contains("<"));
    }

    @Test
    public void testInvalidXML() {
        QuickFixException qfe = null;
        DefDescriptor<SVGDef> descriptor = getAuraTestingUtil().createStringSourceDescriptor(null, SVGDef.class, null);
        TextSource<SVGDef> source = new StringSource<>(descriptor, INVALID_XML, "test", null);
        try {
            parser.getDefinition(descriptor,source);
        } catch (QuickFixException e) {
            qfe = e;
        }
        assertNotNull("SVG Should not be able to parse invalid xml", qfe);
        assertTrue("Message should contain 'ParseError': "+qfe.getMessage(), qfe.getMessage().contains("ParseError"));
    }

    @Test
    public void testInvalidAttribute() {
        QuickFixException qfe = null;
        DefDescriptor<SVGDef> descriptor = getAuraTestingUtil().createStringSourceDescriptor(null, SVGDef.class, null);
        TextSource<SVGDef> source = new StringSource<>(descriptor, INVALID_ATTR, "test", null);
        try {
            parser.getDefinition(descriptor,source);
        } catch (QuickFixException e) {
            qfe = e;
        }
        assertNotNull("SVG should not allow on* event listeners", qfe);
        assertTrue("Message should contain 'onclick': "+qfe.getMessage(), qfe.getMessage().contains("onclick"));
    }
}

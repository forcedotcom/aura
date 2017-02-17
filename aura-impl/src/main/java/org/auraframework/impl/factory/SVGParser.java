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
package org.auraframework.impl.factory;


import java.io.StringReader;
import java.util.Arrays;
import java.util.HashSet;
import java.util.regex.Pattern;

import javax.xml.namespace.QName;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.apache.commons.lang3.StringEscapeUtils;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.SVGDef;
import org.auraframework.impl.root.parser.handler.SVGDefHandler;
import org.auraframework.impl.source.AbstractTextSourceImpl;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.SVGParserException;

@ServiceComponent
public class SVGParser implements DefinitionFactory<TextSource<SVGDef>, SVGDef> {
    private static final XMLInputFactory xmlInputFactory;
    private static final Pattern DISSALOWED_LIST = Pattern.compile(".*(&|/|<|>).*", Pattern.DOTALL | Pattern.MULTILINE);

    //SVG whitelist values. All lowercase to ensure any variation works (we call tag.tolowercase() when parsing)
    private static final HashSet<String> SVG_TAG_WHITELIST = new HashSet<>(Arrays.asList("a", "altglyph", "altglyphdef",
            "altglyphitem", "circle", "clippath", "color-profile", "defs", "desc", "ellipse","feblend", "fecolormatrix",
            "fecomponenttransfer", "fecomposite", "feconvolvematrix", "fediffuselighting", "fedisplacementmap",
            "fedistantlight", "feflood", "fefunca", "fefuncb","fefuncg","fefuncr", "fegaussianblur", "feimage",
            "femerge", "femergenode", "femorphology", "feoffset", "fepointlight", "fespecularlighting", "fespotlight",
            "fetitle", "feturbulence", "filter", "font", "font-face", "font-face-format", "font-face-name",
            "font-face-src", "font-face-uri", "foreignobject", "g", "glyph", "glyphref", "grid", "hkern", "image", "line",
            "lineargradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon",
            "polyline", "radialgradient", "rect", "set", "stop", "style", "svg", "switch", "symbol", "text",
            "textpath", "title", "tref", "tspan", "use", "view", "vkern"));


    private static final HashSet<String> SVG_ATTR_BLACKLIST = new HashSet<>(Arrays.asList("onclick", "oncontextmenu", "ondblclick",
            "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseover", "onmouseout", "onmouseup",
            "onkeydown", "onkeypress", "onkeyup", "onabort", "ondeforeunload", "onerror", "onhashchange", "onload",
            "onpageshow", "onpagehide", "onresize", "onscroll", "onunload", "onblur", "onchange", "onfocus",
            "onfocusin", "onfocusout", "oninput", "oninvalid", "onreset", "onreset", "onselect", "onsubmit",
            "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "oncopy",
            "oncut", "onpaste", "onafterprint", "onbeforeprint", "onabort", "oncanplay", "oncanplaythough",
            "ondurationchange", "onemptied", "onerror", "onloadeddate", "onloadedmetadata", "onloadstart",
            "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onseeked", "onseeking", "onstalled",
            "onsuspend", "ontimeupdate", "onvolumechange", "onwaiting", "onmessage", "onmousewheel", "ononline",
            "onoffline", "onpopstate", "onshow", "onstorage", "ontoggle", "onwheel"));

    static {
        xmlInputFactory = XMLInputFactory.newInstance();

        try {

            // Setting IS_NAMESPACE_AWARE to true will require all xml to be valid xml and
            // we would need to enforce namespace definitions ie xmlns in all cmp and app files.
            xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
            xmlInputFactory.setProperty(XMLInputFactory.IS_COALESCING, true);
            xmlInputFactory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
            xmlInputFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
            xmlInputFactory.setProperty(XMLInputFactory.IS_REPLACING_ENTITY_REFERENCES, false);

            // sjsxp does not currently have a thread-safe XMLInputFactory, as that implementation
            // tries to cache and reuse theXMLStreamReader. Setting the parser-specific "reuse-instance"
            // property to false prevents this.
            // All other known open-source stax parsers (and the bea ref impl) have thread-safe factories.
            // W-2316503: remove compatibility code for both SJSXP and Woodstox
            xmlInputFactory.setProperty("reuse-instance", false);
        } catch (IllegalArgumentException ex) {
            // Other implementations will likely throw this exception since "reuse-instance"
            // is implementation specific. NO-OP
        }
    }
    
    @Override
    public SVGDef getDefinition(DefDescriptor<SVGDef> descriptor, TextSource<SVGDef> source)
            throws SVGParserException, QuickFixException {
        if (descriptor.getDefType() == DefType.SVG) {
            XMLStreamReader reader = null;
            String contents = source.getContents();
            //If the file is too big throw before we parse the whole thing.
            SVGDef ret = new SVGDefHandler<>(descriptor, source).createDefinition();
            try (StringReader stringReader = new StringReader(contents)){
                reader = xmlInputFactory.createXMLStreamReader(stringReader);
                if (reader != null) {
                    LOOP:
                        while (reader.hasNext()) {
                            int type = reader.next();
                            switch (type) {
                            case XMLStreamConstants.END_DOCUMENT:
                                break LOOP;
                                //This is plain text inside the file
                            case XMLStreamConstants.CHARACTERS:
                                if (DISSALOWED_LIST.matcher(reader.getText()).matches()) {
                                    throw new InvalidDefinitionException(String.format(
                                            "Text contains disallowed symbols: %s", reader.getText()),
                                            XMLParser.getLocation(reader, source));
                                }
                                break;
                            case XMLStreamConstants.START_ELEMENT:
                                String name = reader.getName().toString().toLowerCase();
                                if (!SVG_TAG_WHITELIST.contains(name)) {
                                    throw new InvalidDefinitionException(String.format("Invalid SVG tag specified: %s", name),
                                            XMLParser.getLocation(reader, source));
                                }
                                for(int i = 0; i < reader.getAttributeCount(); i++) {
                                    QName qAttr = reader.getAttributeName(i);
                                    String attr = qAttr.getLocalPart();
                                    if (SVG_ATTR_BLACKLIST.contains(attr)) {
                                        throw new InvalidDefinitionException(String.format("Invalid SVG attribute specified: %s", attr),
                                                XMLParser.getLocation(reader, source));
                                    }
                                }
                                break;
                            case XMLStreamConstants.END_ELEMENT:
                            case XMLStreamConstants.COMMENT:
                            case XMLStreamConstants.DTD:
                            case XMLStreamConstants.SPACE:
                                continue;
                            default:
                                throw new InvalidDefinitionException(String.format(
                                        "Found unexpected element in xml."),
                                        XMLParser.getLocation(reader, source));
                            }
                        }
                }
            } catch (XMLStreamException e) {
                throw new SVGParserException(StringEscapeUtils.escapeHtml4(e.getMessage()));
            } finally {
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (XMLStreamException e) {
                        //Well I tried to play nicely
                    }
                }
            }
            return ret;
        }
        return null;
    }

    @Override
    public Class<?> getSourceInterface() {
        return TextSource.class;
    }

    @Override
    public Class<SVGDef> getDefinitionClass() {
        return SVGDef.class;
    }

    @Override
    public String getMimeType() {
        return AbstractTextSourceImpl.MIME_SVG;
    }
}

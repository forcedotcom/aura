/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.throwable.quickfix;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.stream.XMLEventFactory;
import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLEventWriter;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.XMLEvent;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;

/**
 * @see QuickFixException
 */
public abstract class AuraXMLQuickFix extends AuraQuickFix {

    private String query = "";
    private Definition def;

    protected AuraXMLQuickFix(String description, Map<String, Object> attributes, DefDescriptor<ComponentDef> ui){
        super(description, attributes, ui);
    }

    protected void setDef(Definition def){
        this.def = def;
    }

    protected Definition getDef(){
        return this.def;
    }

    protected void setQuery(String query){
        this.query = query;
    }

    protected String getQuery(){
        return this.query;
    }

    protected Source<?> getSource(DefDescriptor<?> desc){
        Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(desc);
        if (!source.exists()) {
            throw new AuraError("Cannot find source for " + desc.getQualifiedName());
        }
        return source;
    }

    private Document getXMLDoc(Source<?> source) throws Exception{
        DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance();
        domFactory.setNamespaceAware(false);
        DocumentBuilder builder = domFactory.newDocumentBuilder();
        XMLInputFactory xmlInF = XMLInputFactory.newInstance();
        xmlInF.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        XMLOutputFactory xmlOutF = XMLOutputFactory.newInstance();
        XMLEventReader reader = xmlInF.createXMLEventReader(source.getReader());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        XMLEventWriter writer = xmlOutF.createXMLEventWriter(baos);
        XMLEventFactory eventFactory = XMLEventFactory.newInstance();
        while(reader.hasNext()){
            XMLEvent event = (XMLEvent) reader.next();
            writer.add(event);
            //create a new xml comment with character offset position info (this will be handy when editing the xml document)
            XMLEvent offsetComment = eventFactory.createComment(Integer.toString(event.getLocation().getCharacterOffset()));
            writer.add(offsetComment);

        }
        writer.close();
        Document doc = builder.parse(new ByteArrayInputStream(baos.toByteArray()));
        return doc;
    }

    private Node findNode(Document doc, String xPathExpr) throws Exception{
        XPathFactory factory = XPathFactory.newInstance();
        XPath xpath = factory.newXPath();
        XPathExpression expr = xpath.compile(xPathExpr);
        NodeList nodes = (NodeList)expr.evaluate(doc, XPathConstants.NODESET);
        if(nodes == null || nodes.getLength()==0){
            // FIXME: EXCEPTIONINFO
            throw new AuraRuntimeException(String.format("Unable to find node: %s", xPathExpr));
        }
        return nodes.item(0);
    }

    protected Node findNode(Source<?> source, String xPathExpr) throws Exception{
        return findNode(getXMLDoc(source), xPathExpr);
    }

    protected int getNodeStartCharecterOffset(Node node){
        Node tagOpenStartComment = node.getPreviousSibling();
        if(tagOpenStartComment.getNodeType()==Node.COMMENT_NODE){
            return Integer.parseInt(tagOpenStartComment.getTextContent());
        }
        return -1;
    }

    protected int getNodeBodyStartCharecterOffset(Node node){
        if(node.hasChildNodes()){
            Node tagOpenEndComment = node.getFirstChild();
            if(tagOpenEndComment.getNodeType()==Node.COMMENT_NODE){
                return Integer.parseInt(tagOpenEndComment.getTextContent());
            }
        }
        return -1;
    }

    protected int getNodeEndCharecterOffset(Node node){
        Node tagOpenStartComment = node.getNextSibling();
        if(tagOpenStartComment.getNodeType()==Node.COMMENT_NODE){
            return Integer.parseInt(tagOpenStartComment.getTextContent());
        }
        return -1;
    }

    protected void doFix(Source<?> source, String fix, int fixStart, int fixEnd) throws  XMLStreamException, IOException{
        String s = source.getContents();
        StringBuffer sb = new StringBuffer(s.length());
        sb.append(s.substring(0, fixStart-1));
        sb.append(fix);
        sb.append(s.substring(fixEnd));
        if(sb.length()>0){
            Writer writer = source.getWriter();
            try {
                writer.write(sb.toString());
            } finally {
                writer.close();
            }
        }
    }
}

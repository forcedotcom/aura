package org.auraframework.impl.root.parser.handler;

import java.io.IOException;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;

import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public abstract class XMLHandler<T> {

    protected final XMLStreamReader xmlReader;
    protected final XMLStreamWriter xmlWriter;
    protected final Source<?> source;
	
    protected XMLHandler(XMLStreamReader xmlReader, Source<?> source) {
        this.xmlReader = xmlReader;
        this.xmlWriter = null;
        this.source = source;
    }

    protected XMLHandler() {
        this.xmlReader = null;
        this.xmlWriter = null;
        this.source = null;
    }
    
    /**
     * Handles the XML for this object and returns a new definition. Expects that the reader has already been moved to a
     * START_ELEMENT, and when this method returns it will leave the reader at the appropriate END_ELEMENT
     * 
     * @throws XMLStreamException If the stream is not queued up properly
     * @throws QuickFixException
     */
    public abstract T getElement() throws XMLStreamException, QuickFixException;
    
    public abstract void writeElement(T def, Appendable out) throws IOException;

    public abstract String getHandledTag();
    
    protected org.auraframework.system.Location getLocation() {
        return XMLParser.getLocation(xmlReader, source);
    }
    
    protected String getAttributeValue(String name) {
        String value = xmlReader.getAttributeValue(null, name);
        if (AuraTextUtil.isNullEmptyOrWhitespace(value)) {
            for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
                if (xmlReader.getAttributeLocalName(i).equalsIgnoreCase(name)) {
                    return xmlReader.getAttributeValue(i);
                }
            }
        }
        return value;
    }
    
    protected boolean getBooleanAttributeValue(String name) {
        return Boolean.parseBoolean(xmlReader.getAttributeValue(null, name));
    }

    protected String getTagName() {
        return xmlReader.getName().getLocalPart();
    }

    protected void error(String message, Object... args) {
        throw new AuraRuntimeException(String.format(message, args), getLocation());
    }
}

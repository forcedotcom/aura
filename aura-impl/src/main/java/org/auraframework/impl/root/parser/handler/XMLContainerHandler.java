package org.auraframework.impl.root.parser.handler;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.system.Location;
import org.auraframework.system.Source;

public abstract class XMLContainerHandler<T> extends XMLHandler<T> {
	protected Location startLocation;
	
    public XMLContainerHandler() {
        super();
    }

    public XMLContainerHandler(XMLStreamReader xmlReader, Source<?> source) {
        super(xmlReader, source);
    }
	
	public final void readSource() throws XMLStreamException {
        if (source.exists()) {
            this.startLocation = getLocation();
            String startTag = getTagName();
            if (!handlesTag(startTag)) {
                error("Expected start tag <%s> but found %s", getHandledTag(), getTagName());
            }
            readAttributes();
            loop: while (xmlReader.hasNext()) {
                int next = xmlReader.next();
                switch (next) {
                case XMLStreamConstants.START_ELEMENT:
                    handleChildTag();
                    break;
                case XMLStreamConstants.CDATA:
                case XMLStreamConstants.CHARACTERS:
                case XMLStreamConstants.SPACE:
                    handleChildText();
                    break;
                case XMLStreamConstants.END_ELEMENT:
                    if (!startTag.equalsIgnoreCase(getTagName())) {
                        error("Expected end tag <%s> but found %s", startTag, getTagName());
                    }
                    // we hit our own end tag, so stop handling
                    break loop;
                case XMLStreamConstants.ENTITY_REFERENCE:
                case XMLStreamConstants.COMMENT:
                    break;
                default:
                    error("found something of type: %s", next);
                }
            }
            if (xmlReader.getEventType() != XMLStreamConstants.END_ELEMENT) {
                // must have hit EOF, barf time!
                error("Didn't find an end tag");
            }
        }
    }

	protected abstract void handleChildText() throws XMLStreamException;

	protected abstract void handleChildTag() throws XMLStreamException;

	protected abstract void readAttributes();
	
    /**
     * @return this container's tag. May return a more generic term for the
     *         class of tag expected if more than one is handled. Not safe for
     *         tag comparisons, only for messaging. For comparisons, use
     *         handlesTag(tag)
     */
    @Override
    public abstract String getHandledTag();

    /**
     * @return true if this handler can parse the given tag
     */
    protected abstract boolean handlesTag(String startTag);
    
}

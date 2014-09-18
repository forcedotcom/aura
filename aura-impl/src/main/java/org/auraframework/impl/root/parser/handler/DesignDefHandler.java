package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.*;
import org.auraframework.impl.design.DesignDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class DesignDefHandler extends RootTagHandler<DesignDef> {
    public static final String TAG = "aura:design";
    
    protected final static Set<String> ALLOWED_ATTRIBUTES = Collections.emptySet();

    private final DesignDefImpl.Builder builder = new DesignDefImpl.Builder();
    
    public DesignDefHandler() {
        super();
    }
    
    public DesignDefHandler(DefDescriptor<DesignDef> defDescriptor, Source<DesignDef> source, XMLStreamReader xmlReader) {
        super(defDescriptor, source, xmlReader);
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(getLocation());
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
    }
    
    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }
    
    @Override
    public String getHandledTag() {
        return TAG;
    }
    
    @Override
    protected RootDefinitionBuilder<DesignDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDesignDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDesignDef attributeDesign = new AttributeDesignDefHandler(this, xmlReader, source).getElement();
            String name = attributeDesign.getName();
            builder.addAttributeDesign(name, attributeDesign);
        } else {
            throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            throw new XMLStreamException(String.format(
                    "<%s> can contain only <aura:attributeDesign>  tags.\nFound text: %s",
                    getHandledTag(), text));
        }
    }

    @Override
    protected DesignDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(DesignDef def, Appendable out) throws IOException {
    }

    
}

package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.DescriptionDef;
import org.auraframework.impl.documentation.DocumentationDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class DocumentationDefHandler extends RootTagHandler<DocumentationDef> {

    public static final String TAG = "aura:documentation";

    protected final static Set<String> ALLOWED_ATTRIBUTES = Collections.emptySet();

    private final DocumentationDefImpl.Builder builder = new DocumentationDefImpl.Builder();
    private StringBuilder body = new StringBuilder();

    public DocumentationDefHandler() {
        super();
    }

    public DocumentationDefHandler(DefDescriptor<DocumentationDef> defDescriptor, Source<DocumentationDef> source,
            XMLStreamReader xmlReader) {
        super(defDescriptor, source, xmlReader);
        builder.setOwnHash(source.getHash());
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
    protected RootDefinitionBuilder<DocumentationDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        
        if (DescriptionDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.addDescription(new DescriptionDefHandler<DocumentationDef>(this, xmlReader, source).getElement());
        } else if (ExampleDefHandler.TAG.equalsIgnoreCase(tag)) {
        	builder.addExample(new ExampleDefHandler<DocumentationDef>(this, xmlReader, source).getElement());
        } else {
        	throw new XMLStreamException("DocumentationDef cannot contain tag " + tag);
        }
        
        // body.append();
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
        	throw new XMLStreamException("Should DocumentationDef have free text?");
        }
        	
//        body.append(text);
    }

    @Override
    protected DocumentationDef createDefinition() throws QuickFixException {
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(startLocation);
        return builder.build();
    }

    @Override
    public void writeElement(DocumentationDef def, Appendable out) throws IOException {
        try {
            out.append(body.toString());

        } catch (Exception x) {
            throw new AuraError(x);
        }
    }
}

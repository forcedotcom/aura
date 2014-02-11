package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DescriptionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.documentation.DescriptionDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DescriptionDefHandler<P extends RootDefinition> extends ParentedTagHandler<DescriptionDefImpl, P> {

    public static final String TAG = "aura:description";

    private static final String ATTRIBUTE_ID = "id";
    
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_ID);

    private final StringBuilder body = new StringBuilder();
    private final DescriptionDefImpl.Builder builder = new DescriptionDefImpl.Builder();

    public DescriptionDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
    	String id = getAttributeValue(ATTRIBUTE_ID);
    	if (id != null) {
    		builder.setId(id);
    	}
    	
        builder.setDescriptor(DefDescriptorImpl.getInstance(getParentHandler().defDescriptor.getName(), DescriptionDef.class));
        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
    	String tag = getTagName();
    	
    	System.err.println();
    	System.err.println(tag);
    	System.err.println();
    	
//    	body.add(getDefRefHandler(this).getElement());
    	// TODO: want to let child tags pass through unmolested...
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();

        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            body.append(text);
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected DescriptionDefImpl createDefinition() throws QuickFixException {
        builder.setBody(body.toString());
        
        return builder.build();
    }

    @Override
    public void writeElement(DescriptionDefImpl def, Appendable out) throws IOException {
    }
}

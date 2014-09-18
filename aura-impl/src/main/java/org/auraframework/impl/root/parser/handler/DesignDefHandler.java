package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

import javax.xml.stream.XMLStreamException;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DesignDef;
import org.auraframework.impl.design.DesignDefImpl;
import org.auraframework.throwable.quickfix.QuickFixException;

public class DesignDefHandler extends RootTagHandler<DesignDef> {
    public static final String TAG = "aura:design";
    
    protected final static Set<String> ALLOWED_ATTRIBUTES = Collections.emptySet();
    
    private final DesignDefImpl.Builder builder = new DesignDefImpl.Builder();
    
    public DesignDefHandler() {
        super();
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
        
        
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    protected DesignDef createDefinition() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void writeElement(DesignDef def, Appendable out) throws IOException {
        // TODO Auto-generated method stub
        
    }

}

package org.auraframework.impl.root.parser.handler;

import java.io.IOException;

import javax.xml.stream.XMLStreamException;

import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DesignDef;
import org.auraframework.throwable.quickfix.QuickFixException;

public class AttributeDesignDefHandler extends ParentedTagHandler<AttributeDesignDef, DesignDef> {
    public static final String TAG = "aura:designattribute";
    
    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public String getHandledTag() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    protected AttributeDesignDef createDefinition() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void writeElement(AttributeDesignDef def, Appendable out) throws IOException {
        // TODO Auto-generated method stub
        
    }

}

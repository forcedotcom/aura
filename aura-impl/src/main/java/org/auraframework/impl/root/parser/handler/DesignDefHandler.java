package org.auraframework.impl.root.parser.handler;

import java.io.IOException;

import javax.xml.stream.XMLStreamException;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DesignDef;
import org.auraframework.throwable.quickfix.QuickFixException;

public class DesignDefHandler extends RootTagHandler<DesignDef> {

    @Override
    protected RootDefinitionBuilder<DesignDef> getBuilder() {
        // TODO Auto-generated method stub
        return null;
    }

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
    protected DesignDef createDefinition() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void writeElement(DesignDef def, Appendable out) throws IOException {
        // TODO Auto-generated method stub
        
    }

}

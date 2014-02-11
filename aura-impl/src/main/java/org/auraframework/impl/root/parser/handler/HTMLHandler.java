package org.auraframework.impl.root.parser.handler;

import java.io.IOException;

import javax.xml.stream.XMLStreamException;

import org.auraframework.throwable.quickfix.QuickFixException;

public class HTMLHandler extends XMLHandler<String> {

	@Override
	public String getHandledTag() {
		return "HTML Tag";
	}
	
	@Override
	public String getElement() throws XMLStreamException, QuickFixException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void writeElement(String def, Appendable out) throws IOException {
	}
}

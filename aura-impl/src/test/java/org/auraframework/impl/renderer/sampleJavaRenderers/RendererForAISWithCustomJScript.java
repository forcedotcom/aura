package org.auraframework.impl.renderer.sampleJavaRenderers;

import java.io.IOException;
import java.util.Map;

import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

public class RendererForAISWithCustomJScript extends AbstractRendererForTestingIntegrationService implements Renderer {

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        String desc = (String)component.getAttributes().getValue("desc");
        @SuppressWarnings("unchecked")
        Map<String, Object> attr = (Map<String, Object>)component.getAttributes().getValue("attrMap");
        String placeholder = (String)component.getAttributes().getValue("placeholder");
        String localId = (String)component.getAttributes().getValue("localId");
        out.append("<script>"
                + "function clickHandler__t(event){document._clickHandlerCalled = true; document.__clickEvent=event;}\n"
                + "function changeHandler__t(event){document._changeHandlerCalled = 'Custom JS Code'; document.__changeEvent=event;}"
                + "</script>");
        out.append(String.format("<div id='%s' style='border: 1px solid black'/>", placeholder));

        injectComponent(desc, attr, localId, placeholder, out);

    }

}

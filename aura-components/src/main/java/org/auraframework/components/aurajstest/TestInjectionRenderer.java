/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.components.aurajstest;

import java.io.IOException;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Renderer;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImpl;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.renderer.ComponentRenderer;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;

/**
 * Render out a given BaseComponentDef while injecting the requested JS test at the end of the html body.
 */
public class TestInjectionRenderer extends ComponentRenderer implements Renderer {

    private final static Pattern bodyEndTagPattern = Pattern.compile("(?is).*(</body\\s*>).*");
    private final static Pattern htmlEndTagPattern = Pattern.compile("(?is).*(</html\\s*>).*");

    @SuppressWarnings("unchecked")
    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        // Inject only for html renders, and also only for our specific app
        if (!(Format.HTML.equals(context.getFormat()) && component.getDescriptor().getDescriptorName()
                .equals("aurajstest:inject"))) {
            super.render(component, out);
            return;
        }

        // The request parameters
        AttributeSet attributes = component.getAttributes();
        String targetDescName = (String) attributes.getValue("descriptor");
        DefType targetDefType = DefType.valueOf(DefType.class, (String) attributes.getValue("defType"));
        String testName = (String) attributes.getValue("testName");

        // Go find the test
        DefinitionService defService = Aura.getDefinitionService();
        DefDescriptor<? extends BaseComponentDef> targetDescriptor = (DefDescriptor<? extends BaseComponentDef>) defService
                .getDefDescriptor(targetDescName, targetDefType.getPrimaryInterface());

        DefDescriptor<TestSuiteDef> suiteDesc = defService.getDefDescriptor(targetDescriptor,
                DefDescriptor.JAVASCRIPT_PREFIX, TestSuiteDef.class);
        TestSuiteDef suiteDef = suiteDesc.getDef();

        TestCaseDef testDef = null;
        for (TestCaseDef currentTestDef : suiteDef.getTestCaseDefs()) {
            if (testName.equals(currentTestDef.getName())) {
                testDef = currentTestDef;
                break;
            }
        }
        if (testDef == null) {
            throw new AuraRuntimeException(String.format("Test case %s not found for %s", testName,
                    targetDescriptor.getQualifiedName()));
        }

        // Restart the context so that we can set the applicationDescriptor, which may be a component
        AuraContext originalContext = context;
        Aura.getContextService().endContext();
        context = Aura.getContextService().startContext(originalContext.getMode(), originalContext.getFormat(),
                originalContext.getAccess(), targetDescriptor);
        context.setClient(originalContext.getClient());

        BaseComponentDef appDef;
        Map<String, Object> appAttributes;
        final BaseComponentDef targetDef = defService.getDefinition(targetDescriptor);
        Map<String, Object> testAttributes = testDef.getAttributeValues();
        if (testAttributes == null) {
            // No target attributes specified on the test. Don't render the target component, but render our dummy app
            // within the target's template.
            // TODO: allow specifying the template on the test
            final ComponentDef targetTemplate = targetDef.getTemplateDef();
            final ApplicationDef dummyDef = defService.getDefinition("aurajstest:blank", ApplicationDef.class);
            appDef = (BaseComponentDef) Proxy.newProxyInstance(component.getClass().getClassLoader(),
                    new Class<?>[] { ApplicationDef.class },
                    new InvocationHandler() {
                        @Override
                        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                            switch (method.getName()) {
                            case "getTemplateDef":
                                return targetTemplate;
                            case "isLocallyRenderable":
                                return targetDef.isLocallyRenderable();
                            default:
                                return method.invoke(dummyDef, args);
                            }
                        }
                    });

            appAttributes = ImmutableMap.of();
        } else {
            // The test has attributes specified, so we render the target
            appDef = targetDef;
            appAttributes = testAttributes;
        }

        StringBuilder output = new StringBuilder();
        AuraImpl.getFormatAdapter(Format.HTML.name(),
                (Class<BaseComponentDef>) appDef.getDescriptor().getDefType().getPrimaryInterface()).write(appDef,
                appAttributes, output);

        // Look for closing body or html tag and insert before that, otherwise just append to the end of the render
        String original = output.toString();
        Matcher bodyMatcher = bodyEndTagPattern.matcher(original);
        int insertionPoint = -1;
        if (bodyMatcher.matches()) {
            insertionPoint = bodyMatcher.start(1);
        } else {
            Matcher htmlMatcher = htmlEndTagPattern.matcher(original);
            if (htmlMatcher.matches()) {
                insertionPoint = htmlMatcher.start(1);
            }
        }
        if (insertionPoint >= 0) {
            out.append(original.substring(0, insertionPoint));
        } else {
            out.append(original);
        }

        // Inject test framework script if it isn't on page already
        String testUrl = Aura.getConfigAdapter().getAuraJSURL();
        if (!original.matches(String.format("(?is).*<script\\s*src\\s*=\\s*['\"]%s['\"]\\s*>.*", testUrl))) {
            out.append(String.format("\n<script src='%s'></script>", testUrl));
        }

        // Inject the test suite code and run
        String script = String.format("\n<script>setTimeout(function(){$A.test.run('%s',%s)})</script>\n", testName, suiteDef.getCode());
        out.append(script);
        if (insertionPoint >= 0) {
            out.append(original.substring(insertionPoint));
        }
    }
}

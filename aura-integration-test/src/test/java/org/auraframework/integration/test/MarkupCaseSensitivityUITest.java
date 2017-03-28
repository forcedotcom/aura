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
package org.auraframework.integration.test;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.integration.test.error.AbstractErrorUITestCase;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.system.TextSource;
import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

import com.google.common.base.Function;

public class MarkupCaseSensitivityUITest extends AbstractErrorUITestCase {
    private static String rootComponent = 
        "<aura:application>"
       +"    <aura:attribute name='output' type='String' default='Ready, push any button please'/>"
       +"   <aura:attribute name='outputClass' type='String' default=''/>"
       +"   <!-- markup is case non-sensitive, this will include hasBody -->"
       +"   <componentTest:HASBody/>"
       +"   <!-- however the namespace is case sensitive, IF we haven't cache it with right case already -->"
       +"   <componentTEST:hasBody/>"
       +"   <auraTEST:TESTMarkupCaseSensitivityOuterCmp/>"
       +"   <!-- dependency is case non-sensitive, this will load the 'correct' dependency withpreload -->"
       +"   <aura:dependency resource='appCache:WITHPRELOAD' type='APPLICATION'/>"
       +"   <!-- aura:import library, library name is case insensitive , property name is case sensitive -->"
       +"   <aura:import library='%s:%s' property='importED' />"
       +"   <aura:import library='%s:%s' property='importedWithWrongCase' />"
       +"   <!-- aura clientLibrary, name is case sensitive -->"
       +"   <!-- this won't load as we register the lib with name: CkEditor -->"
       +"   <aura:clientLibrary name='ckEDITOR' type='JS' />"
       +"   <ui:button press='{!c.tryOutMarkup}' label='press me to test markup' class='button_tryOutMarkup'/>"
       +"   <ui:button press='{!c.tryOutDependency}' label='press me to test dependency' class='button_tryOutDependency'/>"
       +"   <ui:button press='{!c.tryOutLibs}' label='press me to test Libs' class='button_tryOutLibs'/>"
       +"   <ui:button press='{!c.tryOutClientLibs}' label='press me to test ClientLibs' class='button_tryOutClientLibs'/>"
       +"   <div class=\"{!'div_output ' + v.outputClass}\">"
       +"      {!v.output}"
       +"   </div>"
       +"</aura:application>";

    static final String rootController =
        "({"
       +"    //in markup\n"
       +"    tryOutMarkup : function(cmp){"
       +"        //we have <componentTEST:hasBody/> as 2nd facet,  <auraTEST:testMarkupCaseSensitivityOuterCmp/>\n"
       +"        //as 3rd facet, both of them get the namespace with wrong case\n"
       +"        //however we only honor the wrong one in the 3rd facet\n"
       +"        //because we have the correct one as 1st facet: <componentTest:HASBody/>, and it get cached, what 2nd one said doesn't matter\n"
       +"        var facetsArray = cmp.getDef().getFacets()[0];"
       +"        console.log(\"facet for <componentTEST:hasBody/>:\",facetsArray.value[1].componentDef.descriptor);"
       +"        console.log(\"facet for <auraTEST:TESTMarkupCaseSensitivityOuterCmp/>:\",facetsArray.value[2].componentDef.descriptor);"
       +""
       +"        $A.createComponent(\"componentTest:hasBody\","
       +"                {},"
       +"                function(newCmp) {"
       +"                    console.log(\"getting hasBody\", newCmp);"
       +"                }"
       +"        );"
       +"        //we will get right case anyway\n"
       +"        $A.createComponent(\"componentTest:HASBody\","
       +"                {},"
       +"                function(newCmp) {"
       +"                    console.log(\"getting HASBody:\",newCmp);"
       +"                }"
       +"        );"
       +""
       +"    },"
       +""
       +"    //in markup, dependency\n"
       +"    tryOutDependency : function(cmp) {"
       +"        //this give us appCache:withpreload\n"
       +"        $A.createComponent(\"appCache:withpreload\","
       +"                {},"
       +"                function(newCmp) {"
       +"                    console.log(\"getting appCache:withpreload\",newCmp);"
       +"                }"
       +"        );"
       +""
       +"        //this error out\n"
       +"        $A.createComponent(\"appCache:WITHPRELOAD\","
       +"                {},"
       +"                function(newCmp) {"
       +"                    console.log(\"getting appCache:WITHPRELOAD\",newCmp);"
       +"                }"
       +"        );"
       +"    },"
       +""
       +"    //in markup, lib\n"
       +"    tryOutLibs : function(cmp) {"
       +"        var helper = cmp.getDef().getHelper();"
       +"        var importED = helper.importED;"
       +"        if(importED) {"
       +"            var str = \"\";"
       +"            for(var item in importED) {"
       +"                if(item) {"
       +"                    str=str+item+\":\";"
       +"                    if(importED[item] instanceof Function) {"
       +"                        str = str + importED[item]() + \";\";"
       +"                    } else {"
       +"                        str = str + importED[item] + \";\";"
       +"                    }"
       +"                }"
       +"            };"
       +"            cmp.set(\"v.output\", str);"
       +"            cmp.set(\"v.outputClass\", \"libs\");"
       +"        } else {"
       +"            cmp.set(\"v.output\", \"helper.importED should exist, what happened?\")"
       +"        }"
       +"    },"
       +""
       +"    tryOutClientLibs: function(cmp) {"
       +"        console.log(\"CkEditor exist?\", window.CKEDITOR);"
       +"    }"
       +"})";

    static final String rootHelper = "({})";

    private static String library = 
        "<aura:library>"
       +"    <aura:include name='basicFirst' />"
       +"</aura:library>";

    private static String basicFirst = 
        "/* */\nfunction lib() {\n"
       +"    var counter = 0;\n"
       +"    var instance = function() {\n"
       +"        counter = counter + 1;\n"
       +"        return 'BASIC1';\n"
       +"    }\n"
       +"    instance.getCounter = function(){\n"
       +"        return counter;\n"
       +"    }\n"
       +"    return instance;\n"
       +"}";
    private final String outputDivClass = "div_output";
    private final String testLibButtonClass = "button_tryOutLibs";
    
    /**
     * Test for case.
     *
     * we have library imported in testMarkupCaseSensitivityApp.app like this:
     *  <aura:import library="test:test_Library" property="importED" /> 
        <aura:import library="test:TEST_Library" property="importedWithWrongCase" /> 
     * test_Library.lib include a list of JS files (for example: 'basicFirst.js' by: <aura:include name="basicFirst" />) 
     * This verify after first loading the testApp (it loads fine)
     * we modify test_Library.lib, change all basicFirst to BASICFirst (wrong case, BASICFirst.js doesn't exist)
     * then reload the testApp, it still loads fine, and what we changed is updated in lib too (verify through helper).
     *   fix it and enable plz: W-2984818   
     */
    @UnAdaptableTest
    @Test
    public void testLibFileChangeAfterCached() throws Exception {
        //load the test app, and verify the lib loads fine
        AuraTestingUtil util = getAuraTestingUtil();
        DefDescriptor<LibraryDef> lib = util.addSourceAutoCleanup(LibraryDef.class, library);
        DefDescriptor<IncludeDef> incl = definitionService.getDefDescriptor(
                String.format("js://%s.basicFirst", lib.getNamespace()),
                IncludeDef.class, lib);
        util.addSourceAutoCleanup(incl, basicFirst);
        // Now generate our broken case versions
        String namespace = lib.getNamespace();
        String name = lib.getName();
        String namespace_wrong = namespace.toUpperCase();

        DefDescriptor<ApplicationDef> root = util.addSourceAutoCleanup(ApplicationDef.class,
                String.format(rootComponent, namespace, name, namespace_wrong, name));
        DefDescriptor<ControllerDef> rootControllerDesc = definitionService.getDefDescriptor(
                String.format("js://%s.%s", root.getNamespace(), root.getName()), ControllerDef.class);
        util.addSourceAutoCleanup(rootControllerDesc, rootController);
        DefDescriptor<HelperDef> rootHelperDesc = definitionService.getDefDescriptor(
                String.format("js://%s.%s", root.getNamespace(), root.getName()), HelperDef.class);
        util.addSourceAutoCleanup(rootHelperDesc, rootHelper);
        String url = "/"+root.getNamespace()+"/"+root.getName()+".app";
        open(url, Mode.DEV);
        getAuraUITestingUtil().waitForElement(By.className(testLibButtonClass));
        findDomElement(By.className(testLibButtonClass)).click();
        //change lib source
        AuraContext context = contextService.getCurrentContext();
        if (context == null) {
            context = contextService.startContext(Mode.SELENIUM, Format.HTML,
                    Authentication.AUTHENTICATED);
        }
        //ApplicationDef ad = definitionService.getDefinition(root);
        //List<LibraryDefRef> aid = ad.getImports();
        TextSource<?> source = null;
        source = (TextSource<?>)definitionService.getSource(lib);
        String originalContent = source.getContents();
        String newSource = originalContent.replace("basicFirst", "BASICFirst");
        if(newSource != null) {
            //update the test_Library.lib source, then refresh
            getAuraTestingUtil().updateSource(lib, newSource);
            //refresh the testApp, until it pick up the source change in test_Library.lib
            getAuraUITestingUtil().waitUntilWithCallback(
                    new Function<WebDriver, Integer>() {
                        @Override
                        public Integer apply(WebDriver driver) {
                            driver.navigate().refresh();
                            //click the button
                            getAuraUITestingUtil().waitForElement(By.className(testLibButtonClass));
                            findDomElement(By.className(testLibButtonClass)).click();
                            //get the text from output div
                            getAuraUITestingUtil().waitForElement(By.className(testLibButtonClass));
                            String text = findDomElement(By.className(outputDivClass)).getText();
                            if(text.contains("BASICFirst")) {
                                return 1;
                            } else {
                                return null;
                            }
                        }
                    },
                    new ExpectedCondition<String>() {
                        @Override
                        public String apply(WebDriver d) {
                            return "outputDiv doesn't contain 'BASICFirst'"
                                    +findDomElement(By.className(outputDivClass)).getText();
                        }
                    },
                    30,
                    "fail waiting on test app pick up new source in test_Library.lib");
        } else {
            Assert.fail("expect to find 'test:test_Library' in auratest:testMarkupCaseSensitivityApp's import libs");
        }
    }
}

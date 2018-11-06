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
package org.auraframework.util.javascript.builder;

import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.resource.ResourceLoader;

import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.List;

public class LockerJavascriptBuilder extends JavascriptBuilder {
    private String locker = "";
    private String lockerMin = "";
    private String lockerCompat = "";
    private String lockerCompatMin = "";


    public LockerJavascriptBuilder(ResourceLoader resourceLoader) {
        super(resourceLoader);
    }

    @Override
    public List<JavascriptResource> build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) {
        boolean minified = mode.getJavascriptWriter() == JavascriptWriter.CLOSURE_AURA_PROD;

        String output = null;
        if (mode != JavascriptGeneratorMode.DOC) {
            // jsdoc errors when parsing aura-locker.js
            output = minified ?
                    (isCompat ? lockerCompatMin : lockerMin) :
                    (isCompat ? lockerCompat : locker);
        }

        return Arrays.asList(new JavascriptResource(null, output, null));
    }

    @Override
    public void fetchResources() {
        // Locker
        String lockerSource = null;
        String lockerMinSource = null;
        String lockerDisabledSource = null;
        String lockerDisabledMinSource = null;
        try {
            lockerSource = getSource("aura/resources/lockerservice/aura-locker.js");
            lockerMinSource = getSource("aura/resources/lockerservice/aura-locker.min.js");

            lockerDisabledSource = getSource("aura/resources/lockerservice/aura-locker-disabled.js");
            lockerDisabledMinSource = getSource("aura/resources/lockerservice/aura-locker-disabled.min.js");
        } catch (MalformedURLException e) {
        }

        // We always include locker disabled, and don't include locker in compat mode.
        if (lockerSource != null && lockerDisabledSource != null) {
            locker =
                    "try {\n" + lockerSource + "\n} catch (e) {}\n" +
                            "try {\n" + lockerDisabledSource + "\n} catch (e) {}\n";
        }
        if (lockerMinSource != null && lockerDisabledMinSource != null) {
            lockerMin =
                    "try {\n" + lockerMinSource + "\n} catch (e) {}\n" +
                            "try {\n" + lockerDisabledMinSource + "\n} catch (e) {}\n";
        }
        if (lockerDisabledSource != null) {
            lockerCompat =
                    "try {\n" + lockerDisabledSource + "\n} catch (e) {}\n";
        }
        if (lockerDisabledMinSource != null) {
            lockerCompatMin =
                    "try {\n" + lockerDisabledMinSource + "\n} catch (e) {}\n";
        }
    }
}

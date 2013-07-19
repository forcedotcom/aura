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
package org.auraframework.adapter;

import java.util.List;
import java.util.Set;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.resource.ResourceLoader;

public interface ConfigAdapter extends AuraAdapter {

    boolean isProduction();

    boolean isSysAdmin();

    Set<Mode> getAvailableModes();

    Mode getDefaultMode();

    String getAuraJSURL();

    /** Returns a string to identify this unique version of the Aura framework. */
    String getAuraFrameworkNonce();

    String getJiffyJSURL();

    String getJiffyUIJSURL();

    String getJiffyCSSURL();
    
    String getMomentJSURL();
    
    List<String> getWalltimeJSURLs();

    String getCSRFToken();

    void validateCSRFToken(String token);

    ResourceLoader getResourceLoader();

    void regenerateAuraJS();

    boolean isClientAppcacheEnabled();

    long getAuraJSLastMod();

    long getBuildTimestamp();

    String getAuraVersion();

    boolean isAuraJSStatic();

    boolean validateCss();
}

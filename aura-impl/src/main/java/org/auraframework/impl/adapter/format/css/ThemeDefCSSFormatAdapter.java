/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.adapter.format.css;

import java.io.IOException;
import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
@ThreadSafe
public class ThemeDefCSSFormatAdapter extends CSSFormatAdapter<ThemeDef> {


    private static final Pattern pattern1 = Pattern.compile("\\s*([{};,:])\\s*");
    private static final Pattern pattern2 = Pattern.compile("\\s+");

    @Override
    public Class<ThemeDef> getType() {
        return ThemeDef.class;
    }

    @Override
    public void writeCollection(Collection<? extends ThemeDef> values,
                                Appendable out) throws IOException, QuickFixException {
        Mode mode = Aura.getContextService().getCurrentContext().getMode();
        boolean compress = !mode.isTestMode();
        AuraContext context = Aura.getContextService().getCurrentContext();
        StringBuilder sb = new StringBuilder();
        Client.Type type = context.getClient().getType();
        Appendable accum;

        if (compress) {
            sb = new StringBuilder();
            accum = sb;
        } else {
            accum = out;
        }
        for (ThemeDef def : values) {
            if(def != null){
                accum.append(def.getCode(type));
            }
        }
        if (compress) {
            Matcher compressionMatcher1 = pattern1.matcher(sb.toString());
            Matcher compressionMatcher2 = pattern2.matcher(compressionMatcher1.replaceAll("$1"));
            out.append(compressionMatcher2.replaceAll(" "));
        }
    }
}

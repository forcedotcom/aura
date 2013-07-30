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
package org.auraframework.docs;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.components.ui.InputOption;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

/**
 * Used by /expressionTest/expressionFunction.cmp which expects the current return values.
 */
@Model
public class SizeModel {
    
    @AuraEnabled
    public List<InputOption> getSizes() {
        ArrayList<InputOption> a = new ArrayList<InputOption>(4);
        InputOption m1 = new InputOption("X-Small", "xs", false, "X-Small");
        a.add(m1);
        InputOption m2 = new InputOption("Small", "s", false, "Small");
        a.add(m2);
        InputOption m3 = new InputOption("Medium", "m", false, "Medium");
        a.add(m3);
        InputOption m4 = new InputOption("Large", "l", false, "Large");
        a.add(m4);
        InputOption m5 = new InputOption("X-Large", "xl", false, "X-Large");
        a.add(m5);
        return a;
    }

 
}

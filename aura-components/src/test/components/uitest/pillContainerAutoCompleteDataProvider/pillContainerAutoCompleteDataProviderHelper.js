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
({
    items: [
        {id:'pill01',label:"Test Pill 01", icon: {url:'https://ipsumimage.appspot.com/20x20,8888ff?l=1&f=FFFFFF'}},
        {id:'pill02',label:"Test Pill 02", icon: {url:'https://ipsumimage.appspot.com/20x20,ff88cc?l=2&f=FFFFFF'}},
        {id:'pill03',label:"Test Pill 03", icon: {url:'https://ipsumimage.appspot.com/20x20,88cc88?l=3&f=FFFFFF'}},
        {id:'pill04',label:"Test Pill 04", icon: {url:'https://ipsumimage.appspot.com/20x20,FFCC88?l=4&f=FFFFFF'}}],
    provide: function(component, event, controller) {
        var params = event.getParam("parameters");
        if (!$A.util.isUndefinedOrNull(params) && !$A.util.isEmpty(params.keyword)) {
            var keyword = params.keyword;
            var results = [];
            for (var i=0; i<this.items.length; i++) {
                var item = this.items[i];
                if (item.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                    results.push(item);
                }
            }
            this.fireDataChangeEvent(component, results);
        }
    }
})

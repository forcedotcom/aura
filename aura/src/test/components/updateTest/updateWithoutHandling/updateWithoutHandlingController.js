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
{
    updateText:function(c,e,h){
        c.getValue("v.text").setValue("modified");
        var div = document.createElement("div");
        div.className = "reloadMarker";
        $A.util.appendChild(div, c.getElement());
    },

    /**
     * this routine builds a request where the 'loaded' map is incorrect.
     *
     * In order to do this it randomly picks a character from the UID, and replaces it with
     * some other character in the set of alphanumerics, making sure that it is different.
     */
    sendOutdatedRequest:function(c,e,h){
        var selection = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var ctx = $A.getContext();
        var nl = [];
        var loaded = ctx.getLoaded();
        for (var p in loaded) {
            var x = loaded[p];
            if (x.length > 10) {
                var posn = Math.floor(Math.random() * (x.length-1));
                var repl;
                var orig = x.charAt(posn);
                var rposn = selection.indexOf(orig);

                if (rposn > -1) {
                    repl = Math.floor(Math.random() * (selection.length-1));
                    if (repl >= rposn) {
                        repl += 1;
                    }
                } else {
                    repl = Math.floor(Math.random() * selection.length);
                }
                var r = selection.charAt(repl);
                x = x.substr(0,posn)+r+x.substr(posn+1);
                nl[p] = x;
            }
        }
        for (var q in nl) {
            loaded[q] = nl[q];
        }
        c.getValue("v.text").setValue("i was updated");
        var a = c.get("c.noArgs");
        a.runAfter(a);
    }
}

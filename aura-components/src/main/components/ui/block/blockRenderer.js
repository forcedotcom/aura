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
    render: function (cmp, hlp) {
        var values    = cmp.get('v').values,
            tag       = values.tag,
            body      = values.body[cmp.getGlobalId()],
            overflow  = values.overflow,
            container = document.createElement(tag),
            className = values["class"] + (overflow ? ' overflow' : '');

        container.className = className;
        
        if (values.left.length) {
            container.appendChild(hlp.createFacetContainerNode('bLeft', values.left));
        }

        if (values.right.length) {
            container.appendChild(hlp.createFacetContainerNode('bRight', values.right));
        }

        if (body.length) {
            container.appendChild(hlp.createFacetContainerNode('bBody', body));
        }

        return [container];
    },
    afterRender: function (cmp, hlp) {
        var values = cmp.get('v').values,
            left   = values.left,
            right  = values.right,
            body   = values.body[cmp.getGlobalId()];

        if (left.length) {
            $A.afterRender(left);
        }

        if (right.length) {
            $A.afterRender(right);
        }

        if (body.length) {
            $A.afterRender(body);
        }
    },
    rerender: function (cmp, hlp) {
        var element  = cmp.getElement(),
            overflow = cmp.get('v.overflow');

        $A.util.toggleClass(element, 'overflow', overflow);
    }
})
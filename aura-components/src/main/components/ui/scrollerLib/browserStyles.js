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

function (w) {
    'use strict';
    w || (w = window);

    var SCROLLER = w.__S || (w.__S = {}),
		SUPPORT  = SCROLLER.support,
		prefix   = SUPPORT && SUPPORT.prefix,
		props    = {};

    function getTotalWidthOrHeight(name, el) {
        var cssExpand   = ['Top', 'Right', 'Bottom', 'Left'],
            elStyles    = w.getComputedStyle(el),
            isWidth     = name === 'width',
            attrCount   = isWidth ? 1 : 0,
            val         = 0;

        for (; attrCount < 4; attrCount += 2) {
            val += parseInt(elStyles['margin' + cssExpand[attrCount]], 10);
        }

        return val + (isWidth ? el.offsetWidth : el.offsetHeight);
    }

    if (!SUPPORT) {
		w.console.log('Scroller Dependency error! browser support detection needed');
		return;
    }

    if (SUPPORT.transition && SUPPORT.transform) {
        if (prefix !== '') {
            props = {
                transform                : prefix + 'Transform',
                transition               : prefix + 'Transition',
                transitionProperty       : prefix + 'TransitionProperty',
                transitionTimingFunction : prefix + 'TransitionTimingFunction',
                transitionDuration       : prefix + 'TransitionDuration',
                transformOrigin          : prefix + 'TransformOrigin',
                boxSizing                : prefix + 'BoxSizing',
                matrix                   : w.WebKitCSSMatrix || w.MSCSSMatrix
            };

        } else {
            props = {
                transform                : 'transform',
                transition               : 'transition',
                transitionProperty       : 'transitionProperty',
                transitionTimingFunction : 'transitionTimingFunction',
                transitionDuration       : 'transitionDuration',
                transformOrigin          : 'transformOrigin',
                boxSizing                : 'boxSizing',
                matrix                   : w.WebKitCSSMatrix || w.MSCSSMatrix
            };
        }
    }

    props.getHeight = function (el) {
        return getTotalWidthOrHeight('height', el);
    };
    props.getWidth = function (el) {
        return getTotalWidthOrHeight('width', el);
    };

    SCROLLER.styles = props;

}
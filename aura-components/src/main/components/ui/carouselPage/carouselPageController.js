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
    doInit: function (cmp, evt, hlp) {
    	hlp.initialize(cmp);
    },
    load: function (cmp, evt, hlp) {
    	if (!cmp.get('v.isContentLoaded')) {
    		hlp.loadComponent(cmp);
    	}
    },
    handleShowMore: function (component, scrollerCallback) {
    	var contentCmp        = component.get('v.body')[0],
    		canHandleShowMore = contentCmp.isInstanceOf("ui:handlesShowMore"), 
			canShowMore       = canHandleShowMore && !!contentCmp.get('e.showMore'),
			payload           = { callback: scrollerCallback };
    	if (canShowMore) {
    		var showMoreEvt = contentCmp.get("e.showMore");
    		showMoreEvt.setParams({parameters : payload});
    		showMoreEvt.fire();
    	} else {
    		scrollerCallback({labelError: 'Nothing to show.'});
    	}
    },
    handleNoMoreContent: function (component) {
        component.find('scroller').set('v.canShowMore', false);
    }
})// eslint-disable-line semi

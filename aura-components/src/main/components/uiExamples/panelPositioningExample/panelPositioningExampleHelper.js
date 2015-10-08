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
	handleMouseMove: function (evt) {
		
		var el = this.cmp.find('bigTarget').getElement();
        el.style.top = evt.clientY + 'px';
        el.style.left = evt.clientX + 'px';
        this.positioningLib.panelPositioning.reposition();
	},

	handleMouseDown: function (cmp, evt) {
        cmp._movehandle = this.handleMouseMove.bind(this);
        cmp._uphandle = this.handleMouseUp.bind(this);
        this.cmp = cmp;
        document.addEventListener('mouseup', cmp._uphandle);
        document.addEventListener('mousemove', cmp._movehandle);
	},

	handleMouseUp: function (evt) {
		document.removeEventListener('mouseup', this.cmp._uphandle);
		document.removeEventListener('mousemove', this.cmp._movehandle);
	}
})
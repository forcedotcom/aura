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
({
    /**
     * When a dialog window is activated (i.e., displayed), we apply various
     * event handlers to the document and window objects to support
     * 1) keyboard interaction, 2) dialog resize on window resize, and
     * 3) the "clickOutToClose" attribute. Likewise, when a dialog window is
     * deactivated (i.e., hidden), we remove those event handlers to keep
     * event listener carnage to a minimum. That's what this model is for:
     * we store a reference to all those handlers upon activtion so we can
     * remove them later when the dialog is closed.
     */
    handlerConfig : ""
})

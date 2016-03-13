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
    JPG_FILE : {
        name : 'file.jpg',
        type : 'image/jpg'
    },
    DROP_EVENT_1 : function () {
        var event =  new Event('drop',{ bubbles: true });
            // fake dataTransfer
            event.dataTransfer = {
                files : this.createFileList(this.JPG_FILE)
            };
        return event;
    },
    DRAG_ENTER : function () {
        return new Event('dragenter',{ bubbles: true });
    },
    DRAG_LEAVE : function () {
        return new Event('dragleave', { bubbles: true });
    },
    fireDomEvent : function (elem, event) {
        elem.dispatchEvent(event);
    },
    createFileList : function () {
         var index = 0;
         return [].slice.call(arguments).reduce(function (prev, file) {
            prev[index] = new File([],file.name, { type : file.type }); // eslint-disable-line no-undef
            index++;
            return prev;
         },{});
    },
    testDropFilesOver : {
        attributes : { multiple : false, accept : 'image/jpg' },
        test : [
            function (cmp) {
                var elem = cmp.getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_1());
                // We test drop event on inputFileDroppableZone in inputFile test,
                // 'cause we you drop valid files over a COMPONENT event is fired
                // and should be handled for inputFile
            }
        ]
    },
    testDragOver : {
        test : [
            // Drag Enter
            function (cmp) {
                var elem = cmp.getElement();
                this.fireDomEvent(elem,this.DRAG_ENTER());
            },
            function (cmp) {
                var elem = cmp.getElement();
                var classAttr = cmp.get('v.class');
                var classOverAttr = cmp.get('v.classOver');
                $A.test.assertTrue(elem.classList.contains('droppable-zone'),'it should has always main class');
                $A.test.assertTrue(elem.classList.contains('drag-over'),'it should has drag-over class when drag is over');
                if (classAttr) {
                    $A.test.assertTrue(elem.classList.contains(classAttr), 'it should has always user custom class');
                }
                if (classOverAttr) {
                    $A.test.assertTrue(elem.classList.contains(classOverAttr), 'it should has drag over user custom class');
                }
            },
            // Drag Leave
            function (cmp) {
                var elem = cmp.getElement();
                this.fireDomEvent(elem,this.DRAG_LEAVE());
            },
            function (cmp) {
                var elem = cmp.getElement();
                var classAttr = cmp.get('v.class');
                var classOverAttr = cmp.get('v.classOver');
                $A.test.assertTrue(elem.classList.contains('droppable-zone'),'it should has always main class');
                $A.test.assertFalse(elem.classList.contains('drag-over'),'it should has not drag-over class when drag leave');
                if (classAttr) {
                    $A.test.assertTrue(elem.classList.contains(classAttr), 'it should has always user custom class');
                }
                if (classOverAttr) {
                    $A.test.assertFalse(elem.classList.contains(classOverAttr), 'it should has not drag over user custom class when drag leave');
                }
            }
        ]
    }

});
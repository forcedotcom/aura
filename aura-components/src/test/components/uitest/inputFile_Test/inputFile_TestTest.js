({
    JPG_FILE : {
        name : 'file.jpg',
        type : 'image/jpg',
        size : 3145728 // 3 Mb
    },
    PNG_FILE : {
        name : 'file.png',
        type : 'image/png',
        size : 6291456 // 6 Mb
    },
    TEXT_HTML : {
        name : 'file.html',
        type : 'text/html',
        size : 1048576 // 1 Mb
    },
    DROP_EVENT_1 : function () {
        var event =  new Event('drop',{ bubbles: true });
        // fake dataTransfer
        event.dataTransfer = {
            files : this.createFileList(this.JPG_FILE)
        };
        return event;
    },
    DROP_EVENT_2 : function () {
        var event =  new Event('drop',{ bubbles: true });
        // fake dataTransfer
        event.dataTransfer = {
            files : this.createFileList(this.JPG_FILE, this.PNG_FILE)
        };
        return event;
    },
    DROP_EVENT_3 : function () {
        var event =  new Event('drop',{ bubbles: true });
        // fake dataTransfer
        event.dataTransfer = {
            files : this.createFileList(this.TEXT_HTML)
        };
        return event;
    },
    DROP_BIG_FILE : function () {
        var event =  new Event('drop',{ bubbles: true });
        // fake dataTransfer
        event.dataTransfer = {
            files : this.createFileList(this.PNG_FILE)
        };
        return event;
    },
    fireDomEvent : function (elem, event) {
        elem.dispatchEvent(event);
    },
    createFileList : function () {
        // We can not create FilesList Object with javascript for security reasons
        // then we fake FilesList === array-like
        return [].slice.call(arguments).reduce(function (prev, file) {
            prev[prev.length] = new File(this.fakeSize(file.size),file.name, { type : file.type });
            prev.length++;
            return prev;
        }.bind(this), this.createArrayLike());
    },
    // This function is make approximate
    fakeSize : function (size) {
        var startSize = 0;
        var fileParts = [];
        var chunk = 1024;
        while (startSize < size) {
            chunk = startSize + chunk <= size ? chunk : size - startSize;
            startSize += chunk;
            fileParts.push(Array(chunk).join('a'));
        }
        return fileParts;
    },
    createArrayLike : function () {
        return Object.defineProperty({}, 'length', {
            enumerable: false,
            configurable : true,
            get : function () { return Object.keys(this).length; }
        });
    },
    testFireEvent : {
        attributes : { multiple : false, accept : 'image/jpg' },
        test : [
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_1())
            },
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(1, count,'One files was dropped. Change event should was fired.');
            }

        ]
    },
    testDropMultipleAllowed :  {
        attributes : { multiple : true, accept : 'image/jpg,image/png' },
        test : [
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_2());
            },
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(1, count,'Allowed files were dropped.Change event should was fired.');
            }
        ]
    },
    testDropMultipleNotAllowed :  {
        attributes : { multiple : false, accept : 'image/jpg,image/png' },
        test : [
            // Drop multiples
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_2());
            },
            // Should be null or undefined 'cause is not allowed
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(0, count,'Multiple is not accept this time. Event count should still zero');
            },
            // Drop single file
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_1())
            },
            // Allowed
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(1, count,'One file was dropped. Event should was fired.');
            },
            // Drop Multiple again
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_2());
            },
            // Value still the last accept drop
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(1, count,'Multiple is not accept this time. Event count should still the same.');
            }
        ]
    },
    testDropNotAcceptFiles : {
        attributes : { multiple : false, accept : 'image/jpg,image/png' },
        test : [
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_3());
            },
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(0, count,'Not accepted files. Event count should still the zero.');
            },
            // Drop single file
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_1())
            },
            // Allowed
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(1, count,'Accepted files. Event count should be one.');
            }
        ]
    },
    testMaxSizeAllowed :  {
        // Allow until 5 Mb
        attributes : { multiple : true , accept : 'image/jpg,image/png', maxSizeAllowed :  5242880 },
        test : [
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_BIG_FILE());
            },
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(0, count,'File drop was too big. Event count should still zero.');
            },
            function (cmp) {
                var elem = cmp.find('inputFile').getElement();
                this.fireDomEvent(elem,this.DROP_EVENT_1());
            },
            function (cmp) {
                var count = cmp.get('v.count');
                $A.test.assertEquals(1, count,'Accepted files. Event count should be one.');
            }
        ]
    }

})
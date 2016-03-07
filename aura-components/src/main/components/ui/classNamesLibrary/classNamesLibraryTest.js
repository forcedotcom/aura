({
    testObjectToStringMethod : {
        test : [
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                $A.test.assertEquals('a f',classnames.ObjectToString({
                        a: true,
                        b: false,
                        c: 0,
                        d: null,
                        e: undefined,
                        f: 1
                    }), 'keeps object keys with truthy values');
            },
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                var obj = {
                  class1 : true,
                  class2 : false,
                  class3 : true,
                  class4 : false
                };
                obj['class-5'] = true;
                $A.test.assertEquals(classnames.ObjectToString(obj),'class1 class3 class-5','Classnames was created wrong from the object.');
            },
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                var obj1 = {
                    class1 : true,
                    class2 : false,
                    class3 : true,
                    class4 : false
                };
                var obj2 = {
                    class1 : false,
                    class4 : true,
                    class6 : true
                };
                obj1['class-5'] = true;
                $A.test.assertEquals('class3 class-5 class4 class6',classnames.ObjectToString(obj1,obj2),'Classnames was created wrong from the object.');

            },
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                $A.test.assertEquals(classnames.ObjectToString(),'','if not arguments should be returned empty string');
            },
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                $A.test.assertEquals(classnames.ObjectToString({}),'','Empty Object should be returned empty string');
            },
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                $A.test.assertEquals(classnames.ObjectToString([],''),'','Wrong arguments should be returned empty string');
            },
            function (cmp) {
                var classnames = cmp.helper.lib.classnames;
                var obj1 = {
                    class1 : true,
                    class2 : false,
                    class3 : true,
                    class4 : false
                };
                $A.test.assertEquals(classnames.ObjectToString([],obj1,''),'class1 class3','Classnames was created wrong from the object.');
            }
        ]
    }
});
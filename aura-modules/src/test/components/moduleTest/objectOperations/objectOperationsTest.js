({
    "testObjectAssign" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getObjectAssign, "i'm default value. i'm value from object.assign operation");
        }
    },
    
    "testObjectCreate" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getObjectCreate, "created via Object.create");
        }
    },
    
    "testIsObject" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getIsObj, true);
        }
    },

    "testProtoOf" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getObjProtoOf, "accessed via Object.getPrototypeOf");
        }
    },

    "testObjectConstructor" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getObjectConstructor, "Object");
        }
    },

    "testArrayUnshift" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getArrayUnshift, "i'm unshift value. i'm default unshift value"); 
        }
    },

    "testArrayShift" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getArrayShift, "i should be here after shift"); 
        }
    },

    "testArrayConcat" : {
        test: function(cmp) {
            $A.test.assertEquals(cmp.getElement().getArrayConcat, "i'm default value for concat. i'm concatenated value"); 
        }
    },

})
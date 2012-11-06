/*jslint sub: true*/
var rrrrr = "ARRRRRRRR";
function dress() {

    return "like a pirate";
}
window["dress"] = dress;
var five = 6;
//#multilinemock
function blockFunction(){
    /*
     * The contents here should just appear in used by setContent() on the directive
     * So if we were to call getContent() on the directive, we should get this stuff back.
     */
}
//#end

//#multilinemock
/* Nested Section
 * Putting this section just to make the test case more realistic
 *This section should not change the way or, number of errors generated when this file is parsed
 */
//#include
//#end


//#mock {"modes": ["MOCK1"], "blah": "muckity muck"}
//#mock {"modes": ["MOCK2"], "blah": "futter"}
var rrrrr2 = "ARRRRRRRR";
//#mock {"modes": ["MOCK2"], "blah": "howdy doody"}

//#multilinemock {"modes": ["TESTING"]}
    /*
     * This section will just be spit out as is in Testing mode.
     * Also, this section will appear only in the _test file
     */
//#end

//#multilinemock {"modes": ["TESTING" , "DEVELOPMENT"]}
/*
 * This section will just be spit out as is in Testing mode.
 * This section will appear in _test, _dev files
 */
//#end
function dressPiratesOfTheCarribean() {
 //#mock {"modes": ["MOCK1", "MOCK2"], "blah": "son of a diddly"}
 return "like a pirate";
}

var sixtyfive = 6;

/**
 * these are some comments in the file
 */

//#mock {"modes": ["MOCK1"]}
var stuff = {
    i: "am string",

    numeros: 23525,

    //#mock {"modes": ["MOCK2"]}

    blah: function(food) {
        return "i like to eat " + food;
    }
};
//#multilinemock
//#end

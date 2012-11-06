/* file testAllKindsOfDirectiveGenerate.js */
/*jslint sub: true*/
var rrrrr = "ARRRRRRRR";
function dress() {

    return "like a pirate";
}
window["dress"] = dress;
var five = 6;
function blockFunction(){
    /*
     * The contents here should just appear in used by setContent() on the directive
     * So if we were to call getContent() on the directive, we should get this stuff back.
     */
}



/* Nested Section
 * Putting this section just to make the test case more realistic
 *This section should not change the way or, number of errors generated when this file is parsed
 */







var rrrrr2 = "ARRRRRRRR";


    /*
     * This section will just be spit out as is in Testing mode.
     * Also, this section will appear only in the _test file
     */



/*
 * This section will just be spit out as is in Testing mode.
 * This section will appear in _test, _dev files
 */


function dressPiratesOfTheCarribean() {

 return "like a pirate";
}

var sixtyfive = 6;

/**
 * these are some comments in the file
 */


var stuff = {
    i: "am string",

    numeros: 23525,



    blah: function(food) {
        return "i like to eat " + food;
    }
};



function parrots() {
    return "eat crackers";
}

//#mock {"modes": ["MOCK2"], "blah": "my"}
// #mock {"modes": ["MOCK1"], "blah": "spatula"}

/*
 * shouldn't error cause we don't allow for 2 spaces
 */
//  #nothing

//#multilinemock
function funkshun() {
    /*
     * 2 spaces again.
     */
    //  #end
    var conjunction = "junction";
}

// #end

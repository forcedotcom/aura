({
    /*Multi line Comments
     **/
    //Single line Comments
    attributes : {num : '5'},
    /*Comments*/
    /*Multi line Comments
     **/
    //Single line Comments
    testHelloWorld: {
        /*Comments*/
        /*Multi line Comments
         **/
        //Single line Comments

        attributes : {num : '2'},
        /*Comments*/

        test: function(component){
            /*Comments*/
            aura.test.assertTrue(component.get('v.num') == 2, "very bad things.");
        }
    },
    /*Multi line Comments
     **/
    //Single line Comments
    testHelloWorld2: {
        test: function(){
            aura.log(location);
        }
    },

    testHelloWorld3: {
        attributes : {num : '4', alpha: 'A'},

        test: function(){
            aura.log(location);
        }
    }
})

({  
    /*
     * Access check failures testing for $A.getDefinition
     * Scenarios where definition of component being accessed is on client.
     * (Look at this test component markup. Dependencies are defined in the markup)
     */
    
    //ACF for auratest:accessInternalComponent, when def is on client
    testGetDefinitionForComponentWithoutAccessInternalNS:{
        test:[
              function(cmp){
                  $A.test.expectAuraError("Access Check Failed!");
                  var descriptor = "auratest:accessInternalComponent";
                  var complete = false;

                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNull(definition);
                      complete = true;
                  });
                  $A.test.addWaitForWithFailureMessage(
                          completed = true, 
                          function() {
                              return $A.test.getAuraErrorMessage().includes("Access Check Failed!");
                              return false;
                          },
                          "Didn't get ACF error box",
                          function() {
                              $A.test.verifyDetailedErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                      "Access Check Failed!",
                                          "markup://testCustomNS1:getDefinition2");
                   });
                  
              },     
        ]
        
    },
    
    //ACF on event in testCustomNS2
    testGetDefinitionForApplicationEventWithoutAccessCustomNS2: {
        test: function(){
            $A.test.expectAuraError("Access Check Failed!");
            var actionComplete = false;

           $A.getDefinition("e.testCustomNS2:applicationEventWithDefaultAccess", function(definition) {
               $A.test.assertNull(definition);
               actionComplete = true;
           });
           $A.test.addWaitForWithFailureMessage(
                   actionComplete = true, 
                   function() {
                       return $A.test.getAuraErrorMessage().includes("Access Check Failed!");
                       return false;
                   },
                   "Didn't get ACF error box",
                   function() {
                       $A.test.verifyDetailedErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                               "Access Check Failed! EventService.getEventDef():'markup://testCustomNS2:applicationEventWithDefaultAccess",
                                   "markup://testCustomNS1:getDefinition2");
            });
       }
   
   },
   
   //ACF on event in testPrivilegedNS1
   testGetDefinitionForApplicationEventWithoutAccessPrivilegedNS1: {
       test: function(){
          $A.test.expectAuraError("Access Check Failed!");
           var actionComplete = false;

          $A.getDefinition("e.testPrivilegedNS1:applicationEventWithPrivilegedAccess", function(definition) {
              $A.test.assertNull(definition);
              actionComplete = true;
          });

          $A.test.addWaitForWithFailureMessage(
                  actionComplete = true, 
                  function() {
                      return $A.test.getAuraErrorMessage().includes("Access Check Failed!");
                      return false;
                  },
                  "Didn't get ACF error box",
                  function() {
                      $A.test.verifyDetailedErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                              "Access Check Failed! EventService.getEventDef():'markup://testPrivilegedNS1:applicationEventWithPrivilegedAccess",
                                  "markup://testCustomNS1:getDefinition2");
           });
      }
  
  },
   
  //ACF on event when def is on client
   testGetDefinitionForApplicationEventWithoutAccessInternal: {
       test: function(){
          $A.test.expectAuraError("Access Check Failed!");
           var actionComplete = false;

          $A.getDefinition("e.auratest:accessInternalEvent", function(definition) {
              $A.test.assertNull(definition);
              actionComplete = true;
          });

          $A.test.addWaitForWithFailureMessage(
                  actionComplete = true, 
                  function() {
                      return $A.test.getAuraErrorMessage().includes("Access Check Failed!");
                      return false;
                  },
                  "Didn't get ACF error box",
                  function() {
                      $A.test.verifyDetailedErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                              "Access Check Failed! EventService.getEventDef():'markup://auratest:accessInternalEvent",
                                  "markup://testCustomNS1:getDefinition2");
           });
      }
  
   },
    
    //ACF on component def in auratest:accessPrivilegedComponent, when def is on client
    testGetDefinitionForComponentWithoutAccessPrivileged:{
        test:[
              function(cmp){
                  $A.test.expectAuraError("Access Check Failed!");
                  var descriptor = "auratest:accessPrivilegedComponent";
                  var complete = false;

                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNull(definition);
                      complete = true;
                  });
                  $A.test.addWaitForWithFailureMessage(
                          completed = true, 
                          function() {
                              return $A.test.getAuraErrorMessage().includes("Access Check Failed!");
                              return false;
                          },
                          "Didn't get ACF error box",
                          function() {
                              $A.test.verifyDetailedErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                      "Access Check Failed! ComponentService.getDef():'markup://auratest:accessPrivilegedComponent",
                                          "markup://testCustomNS1:getDefinition2");
                   });
                  
              },     
        ]
        
    }
    
})
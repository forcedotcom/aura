({  
    /*
     * Access check failures testing for $A.getDefinition
     * Includes scenarios where definition of component being accessed is on client.
     * (Look at this test component markup. Dependencies are defined in the markup)
     */
    
    //ACF for auratest:accessInternalComponent, when def is on client
    testGetDefinitionForComponentWithoutAccessInternalNamespaceWhenDefinitionOnClient:{
        test:[
              function(cmp){
                  $A.test.expectAuraError("Access Check Failed!");
                  var descriptor = "auratest:accessInternalComponent";
                  var complete = false;

                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNull(definition,"component definition requested is not null");
                      complete = true;
                  });
                  $A.test.addWaitForWithFailureMessage(
                          completed = true, 
                          function() {
                              return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                          },
                          "Didn't get ACF error box",
                          function() {
                              $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                      "Access Check Failed!",
                                          "markup://testCustomNS1:getDefinitionWithClientDependencies");
                   });
                  
              },     
        ]
        
    },
    
    //ACF on event in the another custom namespace, when definition is not on client
    testGetDefinitionForApplicationEventWithoutAccessDifferentCustomNamespaceWhenDefinitionNotOnClient: {
        test: function(){
            $A.test.expectAuraError("Access Check Failed!");
            var actionComplete = false;

           $A.getDefinition("e.testCustomNS2:applicationEventWithDefaultAccess", function(definition) {
               $A.test.assertNull(definition,"application event definition requested is not null");
               actionComplete = true;
           });
           $A.test.addWaitForWithFailureMessage(
                   actionComplete = true, 
                   function() {
                       return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                   },
                   "Didn't get ACF error box",
                   function() {
                       $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                               "Access Check Failed! EventService.getEventDef():'markup://testCustomNS2:applicationEventWithDefaultAccess",
                                   "markup://testCustomNS1:getDefinitionWithClientDependencies");
            });
       }
   
   },
   
   //ACF on event in a Privileged Namespace, when definition is not on client
   testGetDefinitionForApplicationEventWithoutAccessPrivilegedNamespaceWhenDefinitionNotOnClient: {
       test: function(){
          $A.test.expectAuraError("Access Check Failed!");
           var actionComplete = false;

          $A.getDefinition("e.testPrivilegedNS1:applicationEventWithPrivilegedAccess", function(definition) {
              $A.test.assertNull(definition,"application event definition requested is not null");
              actionComplete = true;
          });

          $A.test.addWaitForWithFailureMessage(
                  actionComplete = true, 
                  function() {
                      return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                  },
                  "Didn't get ACF error box",
                  function() {
                      $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                              "Access Check Failed! EventService.getEventDef():'markup://testPrivilegedNS1:applicationEventWithPrivilegedAccess",
                                  "markup://testCustomNS1:getDefinitionWithClientDependencies");
           });
      }
  
  },
   
  //ACF on event in Internal Namespace, when definition is on client
   testGetDefinitionForApplicationEventWithoutAccessInternalNamespaceWhenDefinitionOnClient: {
       test: function(){
          $A.test.expectAuraError("Access Check Failed!");
           var actionComplete = false;

          $A.getDefinition("e.auratest:accessInternalEvent", function(definition) {
              $A.test.assertNull(definition,"application event definition requested is not null");
              actionComplete = true;
          });

          $A.test.addWaitForWithFailureMessage(
                  actionComplete = true, 
                  function() {
                      return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                  },
                  "Didn't get ACF error box",
                  function() {
                      $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                              "Access Check Failed! EventService.getEventDef():'markup://auratest:accessInternalEvent",
                                  "markup://testCustomNS1:getDefinitionWithClientDependencies");
           });
      }
  
   },
    
    //ACF on component def in privileged namespace, when definition is on client
    testGetDefinitionForComponentWithoutAccessPrivilegedNamespaceWhenDefinitionOnClient:{
        test:[
              function(cmp){
                  $A.test.expectAuraError("Access Check Failed!");
                  var descriptor = "auratest:accessPrivilegedComponent";
                  var complete = false;

                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNull(definition,"component definition requested is not null");
                      complete = true;
                  });
                  $A.test.addWaitForWithFailureMessage(
                          completed = true, 
                          function() {
                              return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                          },
                          "Didn't get ACF error box",
                          function() {
                              $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                      "Access Check Failed! ComponentService.getDef():'markup://auratest:accessPrivilegedComponent",
                                          "markup://testCustomNS1:getDefinitionWithClientDependencies");
                   });
                  
              },     
        ]
        
    }
    
})
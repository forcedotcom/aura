({
	doGet : function(doGetComponent, descriptor) {
		var action = $A.get("c.aura://ComponentController.get" + (doGetComponent ? "Component" : "Application"));
		action.setParams({
			name : descriptor
		});
		var gotResponse = false;
		action.setCallback(this, function() {
			gotResponse = true;
		});
		$A.test.callServerAction(action);
		$A.test.addWaitFor(true, function() {
			return gotResponse;
		});
	},

	getUid : function(fullDescriptor) {
		var loaded = $A.getContext().getLoaded();
		return loaded[fullDescriptor];
	},

	assertNoUid : function(fullDescriptor) {
		var uid = this.getUid(fullDescriptor);
		$A.test.assertTrue($A.util.isUndefined(uid));
	},

	assertUid : function(fullDescriptor) {
		// instead of checking value, just check that it is non-empty string
		var uid = this.getUid(fullDescriptor);
		$A.test.assertFalse($A.util.isUndefined(uid), "missing uid for " + fullDescriptor);
		$A.test.assertTrue(typeof (uid) === "string", "expected uid to be a string for " + fullDescriptor);
		$A.test.assertTrue(uid.length > 0, "expected non-empty string for uid for " + fullDescriptor);
	},

        /**
         * Get Application works because only component has been loaded.
         */
	testLoadedGetApplication : {
		testLabels : [ "auraSanity" ],
		test : [ function(c) {
			this.assertNoUid("APPLICATION@markup://aura:application");
			this.doGet(false, "aura:application");
		}, function(c) {
			this.assertUid("APPLICATION@markup://aura:application");
		} ]
	},

        /**
         * GetComponent (component) will not appear in loaded.
         */
	testLoadedGetComponent : {
		testLabels : [ "auraSanity" ],
		test : [ function(c) {
			this.assertNoUid("COMPONENT@markup://aura:component");
			this.doGet(true, "aura:component");
		}, function(c) {
			this.assertNoUid("COMPONENT@markup://aura:component");
		} ]
	},

	testLoadedGetComponentWithDependencies : {
		testLabels : [ "auraSanity" ],
		test : [ function(c) {
			this.assertNoUid("COMPONENT@markup://auratest:text");
			this.assertNoUid("COMPONENT@markup://aura:text");
			this.doGet(true, "auratest:text");
		}, function(c) {
			this.assertUid("COMPONENT@markup://auratest:text");
			this.assertNoUid("COMPONENT@markup://aura:text");
			this.doGet(true, "aura:text");
		}, function(c) {
			this.assertUid("COMPONENT@markup://auratest:text");
			this.assertNoUid("COMPONENT@markup://aura:text");
		} ]
	}
})

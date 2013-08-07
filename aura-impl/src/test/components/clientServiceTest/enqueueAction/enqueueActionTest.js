/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	setUp : function(cmp) {
		var ready = false;
		$A.run(function() {
			$A.test.callServerAction($A.test.getAction(cmp, "c.execute", {
				"commands" : "RESET"
			}, function() {
				ready = true;
			}))
		});
		$A.test.addWaitFor(true, function() {
			return ready;
		});
	},

	log : function(cmp, msg) {
		cmp.getAttributes().getValue("log").push(msg);
	},

	waitForLog : function(cmp, index, content) {
		$A.test.addWaitFor(content, function() {
			var val = cmp.getAttributes().getValue("log").getValue(index);
			return val === undefined ? val : val.unwrap();
		});
	},

	getAction : function(cmp, actionName, commands, callback, background, abortable) {
		var a = $A.test.getAction(cmp, actionName, {
			"commands" : commands
		}, callback);
		if (background) {
			a.setBackground();
		}
		if (abortable) {
			a.setAbortable();
		}
		return a;
	},

	testEnqueueClientAction : {
		test : [ function(cmp) {
			$A.enqueueAction(cmp.get("c.client"));
			this.log(cmp, "log1");
			// client action will get called after the value change is processed above
			this.log(cmp, "log2");

			this.waitForLog(cmp, 0, "log1");
			this.waitForLog(cmp, 1, "client");
			this.waitForLog(cmp, 2, "log2");
		} ]
	},

	/* currently only 1 background action can be in-flight */
	testMaxNumBackgroundServerAction : {
		test : [
				function(cmp) {
					var that = this;
					$A.run(function() {
						// fire first background action that waits for trigger
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"APPEND back1;RESUME fore1;WAIT back1;READ;", function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
						// queue up another background action
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;READ;", function(a) {
							that.log(cmp, "back2:" + a.getReturnValue());
						}));

						// fire foreground action that completes independently
						$A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore1;APPEND fore1;READ;", function(a) {
							that.log(cmp, "fore1:" + a.getReturnValue());
						}));
					});
					// check that only the first backround action was received by the server
					this.waitForLog(cmp, 0, "fore1:back1,fore1");
				}, function(cmp) {
					var that = this;
					// fire foreground action that releases pending actions
					$A.run(function() {
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;RESUME back1;"));
					});
					this.waitForLog(cmp, 1, "back1:fore2");
					this.waitForLog(cmp, 2, "back2:back2");
				} ]
	},

	testBackgroundClientActionNotQueued : {
		test : [
				function(cmp) {
					var that = this;
					$A.run(function() {
						// fire first background server action that waits for trigger
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"APPEND back1;RESUME fore1;WAIT back1;READ;SLEEP 500;", function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
					});
					$A.run(function() {
						// queue up another background server action
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;READ;", function(a) {
							that.log(cmp, "back2:" + a.getReturnValue());
						}));
						// queue up a background client action
						var a = cmp.get("c.client");
						a.setBackground();
						$A.enqueueAction(a);
					});
					// client action executed immediately even if "background"
					this.waitForLog(cmp, 0, "client");
				}, function(cmp) {
					var that = this;
					$A.run(function() {
						$A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore1;RESUME back1", function(a) {
							that.log(cmp, "fore1:" + a.getReturnValue());
						}));
					});
					this.waitForLog(cmp, 1, "fore1:");
					this.waitForLog(cmp, 2, "back1:back1");
					this.waitForLog(cmp, 3, "back2:back2");
				} ]
	},

	/* currently only 1 foreground action can be in-flight */
	testMaxNumForegroundServerAction : {
		test : [
				function(cmp) {
					var that = this;
					$A.run(function() {
						// fire first foreground action that waits for trigger
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
								function(a) {
									that.log(cmp, "fore1:" + a.getReturnValue());
								}));
						// queue up another foreground action
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
							that.log(cmp, "fore2:" + a.getReturnValue());
						}));

						// fire background action that completes independently
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
								function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
					}); // check that only the first foreground action was received by the server
					this.waitForLog(cmp, 0, "back1:fore1,back1");
				}, function(cmp) {
					var that = this;
					$A.run(function() {
						// fire background action that releases pending actions
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;RESUME fore1;"));
					});
					this.waitForLog(cmp, 1, "fore1:back2");
					this.waitForLog(cmp, 2, "fore2:fore2");
				} ]
	},

	testPollSingleBackgroundAction : {
		test : [
				function(cmp) {
					var that = this;
					$A.run(function() {
						// fire first background action that waits for trigger
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"APPEND back1;RESUME fore1;WAIT back1;READ;", function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
						// fire foreground action that completes independently
						$A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore1;APPEND fore1;READ;", function(a) {
							that.log(cmp, "fore1:" + a.getReturnValue());
						}));
					});
					// check that only the first background action was received by the server at first
					this.waitForLog(cmp, 0, "fore1:back1,fore1");
				},
				function(cmp) {
					var that = this;
					$A.run(function() {
						// queue up 2 background actions
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;WAIT back2;READ;",
								function(a) {
									that.log(cmp, "back2:" + a.getReturnValue());
								}));
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back3;READ;", function(a) {
							that.log(cmp, "back3:" + a.getReturnValue());
						}));

						// fire foreground action that completes independently, then release background
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
							that.log(cmp, "fore2:" + a.getReturnValue());
							$A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back1;"));
						}));
					});
					// check that only the first background action was received by the server at first
					this.waitForLog(cmp, 1, "fore2:fore2");
					this.waitForLog(cmp, 2, "back1:");
				}, function(cmp) {
					var that = this;
					$A.run(function() {
						// fire foreground action that completes independently, then release background
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore3;READ;", function(a) {
							that.log(cmp, "fore3:" + a.getReturnValue());
							$A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back2;"));
						}));
					});
					// check that only the second background action was received by the server next
					this.waitForLog(cmp, 3, "fore3:back2,fore3");
					this.waitForLog(cmp, 4, "back2:");
					// check that final background action was received by the server
					this.waitForLog(cmp, 5, "back3:back3");
				} ]
	},

	testPollBatchedForegroundAction : {
		test : [
				function(cmp) {
					var that = this;
					$A.run(function() {
						// max out in-flight foreground actions
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
								function(a) {
									that.log(cmp, "fore1:" + a.getReturnValue());
								}));
						// fire background action that completes independently
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
								function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
					});
					// check that only the first foreground action was received by the server at first
					this.waitForLog(cmp, 0, "back1:fore1,back1");
				},
				function(cmp) {
					var that = this;
					$A.run(function() {
						// queue up 3 foreground actions
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
							that.log(cmp, "fore2:" + a.getReturnValue());
						}));
					});
					$A.run(function() {
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore3;WAIT fore3;READ;", function(a) {
							that.log(cmp, "fore3:" + a.getReturnValue());
						}));
					});
					$A.run(function() {
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore4;READ;", function(a) {
							that.log(cmp, "fore4:" + a.getReturnValue());
						}));

					});
					$A.run(function() {
						// fire background action, then release first foreground action
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back2;READ;", function(a) {
							that.log(cmp, "back2:" + a.getReturnValue());
							$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore1;"));
						}));
					});
					// check that only the first foreground action was received by the server at first
					this.waitForLog(cmp, 1, "back2:back2");
					this.waitForLog(cmp, 2, "fore1:");
				},
				function(cmp) {
					var that = this;
					$A.run(function() {
						// queue up another batch, not added to prior batch that was already sent
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore5;READ;", function(a) {
							that.log(cmp, "fore5:" + a.getReturnValue());
						}));
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore6;RESUME back4;WAIT fore6;READ;",
								function(a) {
									that.log(cmp, "fore6:" + a.getReturnValue());
								}));
						// fire background action, then release pending foreground batch
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back3;READ;", function(a) {
							that.log(cmp, "back3:" + a.getReturnValue());
							$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore3;"));
						}));
					});
					// check that only the foreground batch was received by the server
					this.waitForLog(cmp, 3, "back3:fore3,back3");
					this.waitForLog(cmp, 4, "fore2:fore2");
					this.waitForLog(cmp, 5, "fore3:");
					this.waitForLog(cmp, 6, "fore4:fore4");
				},
				function(cmp) {
					var that = this;
					$A.run(function() {
						// fire background action, then release remaining foreground batch
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back4;APPEND back4;READ;",
								function(a) {
									that.log(cmp, "back4:" + a.getReturnValue());
									$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore6;"));
								}));
					});
					// check that the foreground batch was received by the server
					this.waitForLog(cmp, 7, "back4:fore6,back4");
					this.waitForLog(cmp, 8, "fore5:fore5");
					this.waitForLog(cmp, 9, "fore6:");
				} ]
	},

	testAbortQueuedAbortable : {
		test : [ function(cmp) {
			var that = this;
			// max out in-flight, to start queueing
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT fore1;APPEND fore1;READ;", function(a) {
					that.log(cmp, "fore1:" + a.getReturnValue());
				}, false, false));
			});
			// abort abortable action followed by batch with abortables
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
					that.log(cmp, "fore2:" + a.getReturnValue());
				}, false, true));
			});
			// abort abortable actions in batch followed by batch with abortables
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore3;READ;", function(a) {
					that.log(cmp, "fore3:" + a.getReturnValue());
				}, false, true));
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore4;READ;", function(a) {
					that.log(cmp, "fore4:" + a.getReturnValue());
				}, false, false));
			});
			// don't abort abortable actions in batch followed by batch without abortables
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore5;READ;", function(a) {
					that.log(cmp, "fore5:" + a.getReturnValue());
				}, false, true));
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore6;READ;", function(a) {
					that.log(cmp, "fore6:" + a.getReturnValue());
				}, false, true));
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore7;READ;", function(a) {
					that.log(cmp, "fore7:" + a.getReturnValue());
				}, false, false));
			});
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore8;READ;", function(a) {
					that.log(cmp, "fore8:" + a.getReturnValue());
				}, false, false));
			});
			// release queue
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore1;"));
			});

			this.waitForLog(cmp, 0, "fore1:fore1");
			this.waitForLog(cmp, 1, "fore4:fore4");
			this.waitForLog(cmp, 2, "fore5:fore5");
			this.waitForLog(cmp, 3, "fore6:fore6");
			this.waitForLog(cmp, 4, "fore7:fore7");
			this.waitForLog(cmp, 5, "fore8:fore8");
		} ]
	},

	testAbortInFlightAbortable : {
		test : [ function(cmp) {
			var that = this;
			// hold abortable at server
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "RESUME back1;APPEND fore1;WAIT fore1;READ;",
						function(a) {
							that.log(cmp, "fore1:" + a.getReturnValue());
						}, false, true));
			});
			// queue another abortable action
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
					that.log(cmp, "fore2:" + a.getReturnValue());
				}, false, true));
			});
			// check initial abortable received at server
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "WAIT back1;APPEND back1;READ;", function(a) {
					that.log(cmp, "back1:" + a.getReturnValue());
				}, true));
			});
			// release in-flight action
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND back2;READ;RESUME fore1;", function(a) {
					that.log(cmp, "back2:" + a.getReturnValue());
				}, true));
			});
			// callback of initial abortable action is aborted
			this.waitForLog(cmp, 0, "back1:fore1,back1");
			this.waitForLog(cmp, 1, "back2:back2");
			this.waitForLog(cmp, 2, "fore2:fore2");
		} ]
	},

	testStorableRefresh : {
		test : [ function(cmp) {
			var that = this;
			$A.run(function() {
				// prime storage
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;"));
			});
			this.waitForLog(cmp, 0, "prime:false:initial");
		}, function(cmp) {
			var that = this;
			$A.run(function() {
				// foreground refresh matches
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "foreground match:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;"));
			});
			this.waitForLog(cmp, 1, "foreground match:true:initial");
		}, function(cmp) {
			var that = this;
			$A.run(function() {
				// background refresh matches
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "background match:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				a.setBackground();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND initial;RESUME;"));
			});
			this.waitForLog(cmp, 2, "background match:true:initial");
		}, function(cmp) {
			var that = this;
			$A.run(function() {
				// foreground refresh differs
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "foreground differs:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND updated;RESUME;"));
			});
			this.waitForLog(cmp, 3, "foreground differs:true:initial");
			this.waitForLog(cmp, 4, "foreground differs:false:updated"); // from differing refresh
		}, function(cmp) {
			var that = this;
			$A.run(function() {
				// background refresh differs
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "background differs:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				a.setBackground();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND revised;RESUME;"));
			});
			this.waitForLog(cmp, 5, "background differs:true:updated");
			this.waitForLog(cmp, 6, "background differs:false:revised"); // from differing refresh
		} ]
	},

	/*
	 * Need identical params for storable actions so will rely on sleep to force overlap, since we only have 2 XHRs to
	 * work with
	 */
	testParallelStorable : {
		test : [ function(cmp) {
			var that = this;
			$A.run(function() {
				// prime storage
				var a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
					that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
			});
			$A.test.addWaitFor(true, function() {
				var val = cmp.getAttributes().getValue("log").getValue(0);
				if (val) {
					val = val.unwrap();
					if (val.indexOf("prime:false:") == 0) {
						cmp._initialValue = val.substring("prime:false:".length);
						return true;
					}
				}
			});
		}, function(cmp) {
			var that = this;
			// queue up parallel storable actions
			var a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
				that.log(cmp, "foreground:" + a.isFromStorage() + ":" + a.getReturnValue());
			});
			a.setStorable();
			$A.enqueueAction(a);
			a = that.getAction(cmp, "c.execute", "STAMP;SLEEP 1000;READ;", function(a) {
				// can't guarantee ordering of response handling without a little help
				setTimeout(function() {
					that.log(cmp, "background:" + a.isFromStorage() + ":" + a.getReturnValue());
				}, 500);
			});
			a.setStorable();
			a.setBackground();
			$A.enqueueAction(a);

			// send off actions
			$A.run(function() {
			});

			// both callbacks with stored value executed
			this.waitForLog(cmp, 1, "foreground:true:" + cmp._initialValue);
			this.waitForLog(cmp, 2, "background:true:" + cmp._initialValue);

			// both callbacks with refreshed value executed
			// ordering is not guaranteed
			$A.test.addWaitFor(true, function() {
				var logs = cmp.getAttributes().getValue("log");
				var val1 = logs.getValue(3);
				var val2 = logs.getValue(4);
				if (!val1 || !val2) {
					return false;
				}

				var expected1 = "foreground:false:";
				var expected2 = "background:false:";
				var len = expected1.length; // ensure same length for both

				val1 = val1.unwrap().substring(0, len);
				val2 = val2.unwrap().substring(0, len);

				return ((val1 == expected1 && val2 == expected2) || (val1 == expected2 && val2 == expected1));
			});
		} ]
	},

	testAbortStorable : {
		test : [ function(cmp) {
			var that = this;
			$A.run(function() {
				// prime storage
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;"));
			});
			this.waitForLog(cmp, 0, "prime:false:initial");
		}, function(cmp) {
			var that = this;
			// max out in-flight, to start queueing
			$A.run(function() {
				var a = that.getAction(cmp, "c.execute", "WAIT;");
				$A.enqueueAction(a);
			});
			// queue up storable
			$A.run(function() {
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "store1:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
			});
			// queue up another storable
			$A.run(function() {
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "store2:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
			});
			// release
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME;"));
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND release;RESUME;"));
			});

			// only last queued storable was sent to server
			this.waitForLog(cmp, 1, "store2:true:initial");
			this.waitForLog(cmp, 2, "store2:false:release");
		} ]
	},

	/*
	 * W-1755876: currently failing because the aborted in-flight action is still resulting in the storage of the returned value
	 * (seen as the replay value in the following storable call)
	 * 
	 */
	_testAbortInFlightStorable : {
		test : [ function(cmp) {
			var that = this;
			$A.run(function() {
				// prime storage
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "prime:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND initial;RESUME;"));
			});
			this.waitForLog(cmp, 0, "prime:false:initial");
		}, function(cmp) {
			var that = this;
			// max out in-flight, to start queueing, and hold storable at server
			$A.run(function() {
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "store1:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
			});
			// queue up storable
			$A.run(function() {
				var a = that.getAction(cmp, "c.execute", "WAIT;READ;", function(a) {
					that.log(cmp, "store2:" + a.isFromStorage() + ":" + a.getReturnValue());
				});
				a.setStorable();
				$A.enqueueAction(a);
			});
			// release
			$A.run(function() {
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND release1;RESUME;"));
				$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND release2;RESUME;"));
			});

			// "release1" should have been eaten by in-flight storable, but callback should have been aborted
			this.waitForLog(cmp, 1, "store1:true:initial");
			this.waitForLog(cmp, 2, "store2:true:initial");
			this.waitForLog(cmp, 3, "store2:false:release2");
		} ]
	},

	testRunActionsBypassesQueue : {
		test : [ function(cmp) {
			var that = this;
			// queue up foreground action
			$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a) {
				that.log(cmp, "fore1:" + a.getReturnValue());
			}));

			// runActions will bypass queue
			$A.clientService.runActions([ that.getAction(cmp, "c.execute", "APPEND run1;READ;APPEND afterRun1;",
					function(a) {
						that.log(cmp, "run1:" + a.getReturnValue());
					}) ], cmp, function(a) {
				that.log(this, "run1 callback");
			});

			this.waitForLog(cmp, 0, "run1:run1");
			this.waitForLog(cmp, 1, "run1 callback");
			this.waitForLog(cmp, 2, "fore1:afterRun1,fore1");
		} ]
	},

	testRunActionsForegroundedIfBypassing : {
		test : [
				function(cmp) {
					var that = this;
					// run set of only background actions (need to reach in-flight foreground max)
					$A.clientService.runActions([ that.getAction(cmp, "c.executeBackground",
							"WAIT run1;APPEND run1;READ;", function(a) {
								that.log(cmp, "run1:" + a.getReturnValue());
							}) ], cmp, function(a) {
						that.log(this, "run1 callback");
					});

					$A.run(function() {
						// try enqueuing another background action
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "APPEND back1;READ;", function(a) {
							that.log(cmp, "back1:" + a.getReturnValue());
						}));

						// try enqueuing a foreground action
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;READ;", function(a) {
							that.log(cmp, "fore1:" + a.getReturnValue());
						}));
					});
					// "queued" background action actually passes through since runActions is always foreground
					// "queued" foreground action is queued
					this.waitForLog(cmp, 0, "back1:back1");
				}, function(cmp) {
					var that = this;
					$A.run(function() {
						// release pending actions
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME run1;"));
					});
					this.waitForLog(cmp, 1, "run1:run1");
					this.waitForLog(cmp, 2, "run1 callback");
					this.waitForLog(cmp, 3, "fore1:fore1");
				} ]
	},

	testRunActionsWithoutBypass : {
		test : [
				function(cmp) {
					var that = this;
					$A.run(function() {
						// setup max in-flight foreground actions
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;RESUME back1;WAIT fore1;READ;",
								function(a) {
									that.log(cmp, "fore1:" + a.getReturnValue());
								}));

						// queue up another action
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore2;READ;", function(a) {
							that.log(cmp, "fore2:" + a.getReturnValue());
						}));

						// check pending actions
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
								function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
					});
					this.waitForLog(cmp, 0, "back1:fore1,back1");
				},
				function(cmp) {
					var that = this;
					$A.run(function() {
						// runActions will queue because already at max in-flight foreground actions
						$A.clientService.runActions([
								that.getAction(cmp, "c.execute", "APPEND run1;READ;", function(a) {
									that.log(cmp, "run1:" + a.getReturnValue());
								}), that.getAction(cmp, "c.executeBackground", "APPEND run2;READ;", function(a) {
									that.log(cmp, "run2:" + a.getReturnValue());
								}) ], cmp, function(a) {
							that.log(this, "run1 callback");
						});
					});
					// background action in set is processed because background is not blocked
					// foreground action is queued
					this.waitForLog(cmp, 1, "run2:run2");
				}, function(cmp) {
					var that = this;
					$A.run(function() {
						// flush pending
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "RESUME fore1;"));
					});
					this.waitForLog(cmp, 2, "fore1:");
					this.waitForLog(cmp, 3, "fore2:fore2");
					this.waitForLog(cmp, 4, "run1:run1");
					this.waitForLog(cmp, 5, "run1 callback");
				} ]
	},

	testRunActionsQueued : {
		test : [
				function(cmp) {
					var that = this;
					var cmp = cmp;
					// setup max in-flight foreground actions
					$A.clientService.runActions([ that.getAction(cmp, "c.execute",
							"RESUME back1;APPEND run1;WAIT run1;READ;", function(a) {
								that.log(cmp, "run1:" + a.getReturnValue());
							}) ], cmp, function(a) {
						that.log(this, "run1 callback");
					});

					// following runActions are now queued after max in-flight actions reached
					$A.clientService.runActions([ that.getAction(cmp, "c.execute", "APPEND run2;WAIT run2;READ;",
							function(a) {
								that.log(cmp, "run2:" + a.getReturnValue());
							}) ], cmp, function(a) {
						that.log(this, "run2 callback");
					});
					$A.clientService.runActions([ that.getAction(cmp, "c.execute", "APPEND run3;WAIT run3;READ;",
							function(a) {
								that.log(cmp, "run3:" + a.getReturnValue());
							}) ], cmp, function(a) {
						that.log(this, "run3 callback");
					});

					$A.run(function() {
						// queue up another action
						$A.enqueueAction(that.getAction(cmp, "c.execute", "APPEND fore1;WAIT fore1;READ;", function(a) {
							that.log(cmp, "fore1:" + a.getReturnValue());
						}));

						// check pending action(s)
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground", "WAIT back1;APPEND back1;READ;",
								function(a) {
									that.log(cmp, "back1:" + a.getReturnValue());
								}));
					});
					this.waitForLog(cmp, 0, "back1:run1,back1");
				},
				function(cmp) {
					var that = this;
					var cmp = cmp;
					$A.run(function() {
						// release in-flight actions
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"RESUME run1;SLEEP 500;APPEND back2;READ;", function(a) {
									that.log(cmp, "back2:" + a.getReturnValue());
								}));
					});
					this.waitForLog(cmp, 1, "run1:");
					this.waitForLog(cmp, 2, "run1 callback");
					this.waitForLog(cmp, 3, "back2:run2,back2");
				},
				function(cmp) {
					var that = this;
					var cmp = cmp;
					$A.run(function() {
						// release next action, but pending ones were batched
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"APPEND back3;RESUME run2;SLEEP 500;READ;", function(a) {
									that.log(cmp, "back3:" + a.getReturnValue());
								}));
					});
					this.waitForLog(cmp, 4, "back3:run3");
				},
				function(cmp) {
					var that = this;
					var cmp = cmp;
					$A.run(function() {
						// release next action, batch still not complete
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"APPEND back4;RESUME run3;SLEEP 500;READ;", function(a) {
									that.log(cmp, "back4:" + a.getReturnValue());
								}));
					});
					this.waitForLog(cmp, 5, "back4:fore1");
				},
				function(cmp) {
					var that = this;
					var cmp = cmp;
					$A.run(function() {
						// release last in batch
						$A.enqueueAction(that.getAction(cmp, "c.executeBackground",
								"APPEND back5;RESUME fore1;SLEEP 500;READ;", function(a) {
									that.log(cmp, "back5:" + a.getReturnValue());
								}));
					});
					this.waitForLog(cmp, 6, "run2:back3");
					this.waitForLog(cmp, 7, "run2 callback");
					this.waitForLog(cmp, 8, "run3:back4");
					this.waitForLog(cmp, 9, "run3 callback");
					this.waitForLog(cmp, 10, "fore1:back5");
					this.waitForLog(cmp, 11, "back5:");
				} ]
	}
})
Use this file to accumulate style and coding guidelines for Javascript.

* Avoid new top-level type names.  Hang them off $A.ns instead.
     We have many, many legacy counter-examples to this, but for new code, we
     want to have that namespacing.  In DEV and PROD mode (only), we wrap our
     framework inside a closure, such that a top-level var isn't really hanging
     on the Window object... but in other modes, it does, and that pollutes the
     top namespace.  But also, the closure-compiler does better optimization and
     better exporting of public symbols if the types are children of some
     namespace.  (This last is somewhat apocryphal, but was Chris Conroy's
     conclusion when chasing W-1474851.)


* Avoid "delete x.foo", prefer x.foo = null or x.foo = undefined or
     x.hasFoo = false.  The problem with sometimes-present fields is that they
     mess up the optimizers, which perform best if objects of a given type are
     all isomorphic.

     See e.g. http://coding.smashingmagazine.com/2012/11/05/writing-fast-memory-efficient-javascript/

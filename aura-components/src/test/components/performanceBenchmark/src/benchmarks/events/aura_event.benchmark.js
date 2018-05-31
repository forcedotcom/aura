const $A = window.$A;
const aura = window.Aura;

describe("aura_event", () => {
  benchmark('create_application_event', () => {
    run(() => {
      $A.eventService.newEvent("markup://aura:applicationEvent");
    });
  });

  benchmark('fire_application_event', () => {
    var evt;

    before(() => {
      evt = $A.eventService.newEvent("markup://aura:applicationEvent");
    });

    run(async () => {
      await evt.fire();
    });
  });
});
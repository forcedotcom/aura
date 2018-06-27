export const LockerLWCEventName = 'locker-lwc';

export class LockerLWCEvent extends Event {
  constructor(data) {
    super(LockerLWCEventName, {
      bubbles: true,
      composed: true,
      cancelable: true
    });

    this.evData = data;

  }
}
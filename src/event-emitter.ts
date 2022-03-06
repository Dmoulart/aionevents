import { Event, EventCallback } from './event';

export type Events = { [hook: string]: Event[] };

/**
 * The event emitter class is reponsible for managing events for a given object.
 * It can listen to events from other emitters and fire events to other emitters.
 *
 */
export class EventEmitter {

  /**
 * The list of emitters that are wired to this emitter.
 * It means that these wired emitters will receive the events fired by this emitter.
 */
  public wiredEmitters!: Array<EventEmitter>;

  /**
   * The events that are defined for a class instance
   *
   */
  private _instanceEvents!: Events;

  /**
   * The events that are defined for a class. Mainly used by decorators.
   *
   */
  private _classEvents!: Events;

  constructor() {
    this._instanceEvents ??= {};

    // At this point events might be already initialized with decorators even
    // if the instance is not created yet.
    this._classEvents ??= {};

    this.wiredEmitters = [];

    // Register the events that are defined on the class by decorators.
    for (const [hook, events] of Object.entries(this._classEvents)) {
      const len = events.length;
      for (let e = 0; e < len; e++) {
        this.on(hook, events[e].callback);
      }
    }
  }

  /**
   * Listen for a specific event and call the callback when the event is fired.
   *
   * @static
   * @param eventName
   * @param callback
   * @param target
   * @param classDefined
   * @returns target
   */
  public static On(
    eventName: string,
    callback: EventCallback,
    target: EventEmitter,
    classDefined = false
  ): EventEmitter {
    const event = new Event({
      hook: eventName,
      callback,
      source: target,
      params: {}
    });
    EventEmitter.registerEvent(target, event, classDefined);
    return target;
  }

  /**
   * Listen for a specific event and call the callback when the event is fired.
   *
   * @param eventName
   * @param callback
   * @returns this for chaining
   */
  public on(eventName: string, callback: EventCallback): EventEmitter {
    EventEmitter.On(eventName, callback, this);
    return this;
  }

  /**
   * Listen for a specific event and call the callback when the event is fired, then delete the event.
   *
   * @static
   * @param eventName
   * @param callback
   * @param target
   * @param classDefined
   * @returns target
   */
  public static Once(
    eventName: string,
    callback: EventCallback,
    target: EventEmitter,
    classDefined = false
  ): EventEmitter {
    // Shadowing the this is intended
    const oneTimeCallback: EventCallback = function (...args) {
      //@ts-ignore
      callback.call(
        //@ts-expect-error
        this as EventEmitter,
        ...args
      );
      //@ts-expect-error
      (this as EventEmitter).off(eventName, oneTimeCallback);
    };
    const event = new Event({
      hook: eventName,
      callback: oneTimeCallback,
      source: target,
      params: {}
    });
    EventEmitter.registerEvent(target, event, classDefined);
    return target;
  }

  /**
   * Listen for a specific event and call the callback when the event is fired, then delete the event.
   *
   * @param eventName
   * @param callback
   * @returns this for chaining
   */
  public once(eventName: string, callback: EventCallback): EventEmitter {
    EventEmitter.Once(eventName, callback, this);
    return this;
  }

  /**
   * Remove the event attached to a specific hook.
   *
   * @param eventName
   * @param callback
   * @returns this for chaining
   */
  public off(eventName: string, callback: EventCallback): EventEmitter {
    if (!this._instanceEvents[eventName]) return this;
    const eventToDelete = this._instanceEvents[eventName].find((event) => event.callback === callback);
    if (!eventToDelete) return this;
    const index = this._instanceEvents[eventName].indexOf(eventToDelete);
    this._instanceEvents[eventName].splice(index, 1);
    return this;
  }

  /**
   * Fire an event. It will propagate to all wired listeners.
   *
   * @param eventName
   * @param params
   * @returns this for chaining
   */
  public fire(eventName: string, params: Record<string, any> = {}): EventEmitter {
    if (this._instanceEvents[eventName]) {
      const len = this._instanceEvents[eventName].length;
      for (let e = 0; e < len; e++) {
        this._instanceEvents[eventName][e].callback.call(this, {
          ...params
        });
      }
    }

    for (let w = 0; w < this.wiredEmitters.length; w++) {
      if (!this.wiredEmitters[w]._instanceEvents[eventName]) continue;
      for (let e = 0; e < this.wiredEmitters[w]._instanceEvents[eventName].length; e++) {
        if (!this.wiredEmitters[w]._instanceEvents[eventName][e].callback) continue;
        this.wiredEmitters[w]._instanceEvents[eventName][e].callback.call(this.wiredEmitters[w], {
          ...params
        });
      }
    }
    return this;
  }

  /**
   * Fire an event. It will propagate to all wired listeners.
   *
   * @static
   * @param eventName
   * @param target
   * @param params
   * @returns nothing
   */
  public static Fire(eventName: string, target: EventEmitter, params: Record<string, unknown> = {}): void {
    if (target._instanceEvents[eventName]) {
      const targetLen = target._instanceEvents[eventName].length;
      for (let e = 0; e < targetLen; e++) {
        target._instanceEvents[eventName][e].callback.call(this, {
          ...params
        });
      }
    }
    const wiredLen = target._instanceEvents[eventName].length;

    for (let w = 0; w < wiredLen; w++) {
      if (!target.wiredEmitters[w]._instanceEvents[eventName]) continue;
      const wiredEventsLen = target.wiredEmitters[w]._instanceEvents[eventName].length;
      for (let e = 0; e < wiredEventsLen; e++) {
        target.wiredEmitters[w]._instanceEvents[eventName][e].callback.call(target.wiredEmitters[w], {
          ...params
        });
      }
    }
  }

  /**
   * Wire an event emitter to this event emitter.
   *
   * @param eventable
   * @returns this for chaining
   */
  public wire(eventable: EventEmitter): EventEmitter {
    this.wiredEmitters.push(eventable);
    return this;
  }

  /**
   * Register an event depending if the event is a classEvent
   *
   * @param target
   * @param event
   * @param isClassEvent
   */
  private static registerEvent(target: EventEmitter, event: Event, isClassEvent: boolean = false) {
    if (isClassEvent) {
      target._classEvents ??= {};
      target._classEvents[event.name] ??= [];
      target._classEvents[event.name].push(event);
    } else {
      target._instanceEvents ??= {};
      target._instanceEvents[event.name] ??= [];
      target._instanceEvents[event.name].push(event);
    }
  }

  /**
   * Return all this events, instance defined events and class defined events, as an object.
   *
   * @returns events
   */
  public get events(): Events {
    return { ...this._instanceEvents, ...this._classEvents };
  }
}

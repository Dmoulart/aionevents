import { EventEmitter } from './event-emitter';
/**
 * The event options, necessary to instantiate an event.
 *
 */
export type EventOptions = {
  hook: string;
  callback: EventCallback;
  source: EventEmitter;
  params: Record<string, unknown>;
};

/**
 * The event callback function signature
 *
 */
export type EventCallback = (args?: any) => any;

/**
 * The event object. It represents an event callback which is triggered by a specific hook.
 *
 */
export class Event {
  /**
   * The event hook. This is the name of the event. The event will be fired when a wired emitter fire this hook.
   *
   */
  public name!: string;

  /**
   * The event callback. It is the function that will be called when the event is fired.
   *
   */
  public callback!: (args: { [arg: string]: any }) => void;

  /**
   * The event source emitter. It is the emitter which this events belongs to.
   *
   */
  public source!: EventEmitter;

  /**
   * The event callback parameters.
   */
  public params!: Record<string, unknown>;

  constructor({ hook, callback, source, params }: EventOptions) {
    this.name = hook;
    this.callback = callback;
    this.source = source;
    this.params = params;
  }
}

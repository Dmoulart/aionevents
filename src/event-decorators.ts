import { EventEmitter } from './event-emitter';

/**
 * Wrap a function as an event callback.
 *
 * @param hook
 * @returns on event decorator
 */
export function On(hook: string) {
  return function (target: EventEmitter, _propertyKey: string, descriptor: PropertyDescriptor) {
    EventEmitter.On(hook, descriptor.value, target, true);
  };
}

/**
 * Wrap a function as an event callback. The event will be deleted after the first time it is fired.
 *
 * @param hook
 * @returns once event decorator
 */
export function Once(hook: string) {
  return function (target: EventEmitter, _propertyKey: string, descriptor: PropertyDescriptor) {
    EventEmitter.Once(hook, descriptor.value, target, true);
  };
}

/**
 * Wrap a function to fire an event at the end of it.
 *
 * @param hook
 * @param args
 * @returns fire event decorator
 */
export function Fire(hook: string, args: Record<string, unknown> = {}) {
  return function (target: EventEmitter, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...methodArgs: any[]) {
      originalMethod.apply(this, methodArgs);
      target.wiredEmitters ??= [];
      target.fire.apply(this, [hook, args]);
    };
  };
}

import { EventEmitter } from '../dist';

var assert = require('assert');

describe('EventEmitter', function () {
  describe('construct', function () {
    it('can be instantiated', function () {
      const emitter = new EventEmitter();
      assert.ok(emitter);
    });
  });
  describe('wiring', function () {
    it('can be wired', function () {
      const emitter = new EventEmitter();
      const other = new EventEmitter();
      emitter.wire(other);
      assert(emitter.wiredEmitters.includes(other))
    });
  })
  describe('fire', function () {
    it('can fire events', function () {
      const emitter = new EventEmitter();
      const other = new EventEmitter();
      emitter.wire(other);
      let count = 0
      other.on('test', () => { count++ })
      emitter.fire('test')
      assert.equal(count, 1)
    });
  })
  describe('on', function () {
    it('can listen to events from different emitter', function () {
      const emitter = new EventEmitter();
      const emitter2 = new EventEmitter();
      const other = new EventEmitter();
      emitter.wire(other);
      emitter2.wire(other);
      let count = 0
      other.on('test', () => { count++ })
      emitter.fire('test')
      emitter2.fire('test')
      assert.equal(count, 2)
    });
  })
  describe('once', function () {
    it('can listen to events once', function () {
      const emitter = new EventEmitter();
      const other = new EventEmitter();
      emitter.wire(other);
      let count = 0
      other.once('test', () => { count++ })
      emitter.fire('test')
      emitter.fire('test')
      assert.equal(count, 1)
    });
  })
  describe('off', function () {
    it('can remove a handler', function () {
      const emitter = new EventEmitter();
      const other = new EventEmitter();
      emitter.wire(other);
      let count = 0
      const increment = () => { count++ }
      other.once('test', increment)
      emitter.fire('test')
      other.off('test', increment)
      emitter.fire('test')
      assert.equal(count, 1)
    });
  })
});

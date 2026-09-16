import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, DEFAULTS, Simulation } from '../src/model.js';

test('calcula torque y margen del Pololu con la hipótesis base', () => {
  const r=calculate(DEFAULTS);
  assert.equal(r.required,3);
  assert.equal(r.canMove,true);
  assert.equal(r.level,'good');
});

test('bloquea el 28BYJ-48 cuando se usan 2 kgf y rueda de 3 cm', () => {
  const r=calculate(DEFAULTS,'kit');
  assert.equal(r.canMove,false);
  assert.equal(r.seconds,null);
});

test('atasco detiene el movimiento', () => {
  const s=new Simulation();s.start(1);assert.equal(s.running,true);s.setJam(true);s.step(1);assert.equal(s.running,false);assert.match(s.status,/Atasco/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyFocus, journeyPanels, journeyPosition, journeySegments, journeyStop, journeyUnits, maxJourneyWorlds} from '../src/lib/comondi-journey';
import {comondiMotion, defaultComondiMotion} from '../src/lib/comondi-motion';
import {comondiMotionSchema} from '../src/lib/validation';

test('the opening journey covers the whole scroll range without gaps', () => {
  for (let worlds = 1; worlds <= maxJourneyWorlds; worlds++) {
    const segments = journeySegments(worlds);
    assert.equal(segments[0].start, 0);
    assert.equal(segments.at(-1)!.end, 1);
    segments.slice(1).forEach((segment, index) => assert.ok(Math.abs(segment.start - segments[index].end) < 1e-12));
    // Opening hold, then a flight and a hold for every world, then the flight back and the closing hold.
    assert.equal(segments.length, 2 + worlds * 2 + 1);
  }
  assert.equal(journeyUnits(99), journeyUnits(maxJourneyWorlds), 'more worlds than planets do not stretch the opening further');
  assert.ok(journeyUnits(4) > 9 && journeyUnits(4) < 11, 'four worlds keep the track near five screens');
});

test('every world has a calm hold where only its text is visible', () => {
  const worlds = 4;
  for (let shot = 1; shot <= worlds; shot++) {
    const stop = journeyStop(shot, worlds);
    assert.deepEqual(journeyPosition(stop, worlds), {from: shot, to: shot, t: 0});
    const panels = journeyPanels(stop, worlds);
    panels.forEach((panel, index) => assert.equal(panel.opacity, index === shot ? 1 : 0, `panel ${index} at world ${shot}`));
    assert.deepEqual(journeyFocus(stop, worlds).map(value => Math.round(value)), [1, 2, 3, 4].map(index => index === shot ? 1 : 0));
  }
  assert.equal(journeyStop(0, worlds), 0);
});

test('the opening text starts and closes the journey, and the copy never jumps', () => {
  const worlds = 4;
  assert.equal(journeyPanels(0, worlds)[0].opacity, 1);
  assert.equal(journeyPanels(1, worlds)[0].opacity, 1);
  assert.deepEqual(journeyFocus(0, worlds), [0, 0, 0, 0]);
  let previous = journeyPanels(0, worlds);
  for (let step = 1; step <= 4000; step++) {
    const current = journeyPanels(step / 4000, worlds);
    current.forEach((panel, index) => assert.ok(Math.abs(panel.opacity - previous[index].opacity) < 0.02, `panel ${index} jumps at ${step / 4000}`));
    // Between two worlds the outgoing text has left before the next one arrives.
    assert.ok(current.filter(panel => panel.opacity > 0.05).length <= 1, `two texts overlap at ${step / 4000}`);
    previous = current;
  }
});

test('the journey setting defaults to on and older content without it stays valid', () => {
  assert.equal(defaultComondiMotion.heroJourney, true);
  const {heroJourney: _omitted, ...older} = defaultComondiMotion;
  assert.equal(comondiMotionSchema.safeParse(older).success, true);
  assert.equal(comondiMotion(older).heroJourney, true);
  assert.equal(comondiMotionSchema.safeParse({...defaultComondiMotion, heroJourney: false}).success, true);
  assert.equal(comondiMotionSchema.safeParse({...defaultComondiMotion, heroJourney: 'ja'}).success, false);
});

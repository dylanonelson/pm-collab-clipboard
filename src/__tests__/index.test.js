import nodes from 'prosemirror-test-builder';
import { Transform } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';
import { MoveStep } from '../index';

describe('MoveStep', () => {
  test('Moves whole nodes forward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij')
    );

    const replaceTr = new Transform(doc);
    replaceTr.replace(
      24,
      24,
      doc.slice(0, 12),
    );
    replaceTr.replace(
      0,
      12,
      Slice.empty,
    );

    const moveTr = new Transform(doc);
    moveTr.step(new MoveStep(0, 12, 24));

    expect(moveTr.doc.eq(replaceTr.doc)).toBe(true);
  });

  test('Inverts moving whole nodes forward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij')
    );

    const moveStep = new MoveStep(0, 12, 24);
    const moveTr = new Transform(doc);
    moveTr.step(moveStep);

    const inverted = moveStep.invert(doc);
    expect(inverted.deleteFrom).toBe(12);
    expect(inverted.deleteTo).toBe(24);
    expect(inverted.dest).toBe(0);
    moveTr.step(inverted);

    expect(moveTr.doc.toJSON()).toEqual(doc.toJSON());
  });

  test('Moves whole nodes backward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij')
    );

    const replaceTr = new Transform(doc);
    replaceTr.replace(
      0,
      0,
      doc.slice(12, 24),
    );
    replaceTr.replace(
      24,
      36,
      Slice.empty,
    );

    const moveTr = new Transform(doc);
    moveTr.step(new MoveStep(12, 24, 0));

    expect(moveTr.doc.eq(replaceTr.doc)).toBe(true);
  });

  test('Inverts moving whole nodes backward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij')
    );

    const moveStep = new MoveStep(12, 24, 0);
    const moveTr = new Transform(doc);
    const { doc: done } = moveTr.step(moveStep);

    const inverted = moveStep.invert(doc);
    const { doc: undid } = moveTr.step(inverted);

    expect(undid.toJSON()).toEqual(doc.toJSON());

    const redo = inverted.invert(undid);
    const { doc: redid } = moveTr.step(redo);
    expect(redid.toJSON()).toEqual(done.toJSON());
  });

  test('Moves slices with open ends forward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij')
    );

    const replaceTr = new Transform(doc);
    replaceTr.replace(
      24,
      24,
      doc.slice(10, 14),
    );
    replaceTr.replace(
      10,
      14,
      Slice.empty,
    );

    const moveTr = new Transform(doc);
    moveTr.step(new MoveStep(10, 14, 24));

    expect(moveTr.doc.eq(replaceTr.doc)).toBe(true);
  });

  test('Inverts moving slices with open ends forward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij')
    );

    const moveTr = new Transform(doc);
    const moveStep = new MoveStep(10, 14, 24);
    const { doc: done } = moveTr.step(moveStep);

    let inverted = moveStep.invert(doc);

    const { doc: undid } = moveTr.step(inverted);
    expect(doc.toJSON()).toEqual(undid.toJSON());

    const redo = inverted.invert(undid);
    const { doc: redid } = moveTr.step(redo);
    expect(redid.toJSON()).toEqual(done.toJSON());
  });

  test('Moves slices with open ends backwards', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij'),
      nodes.p('**********'),
    );

    const replaceTr = new Transform(doc);
    replaceTr.replace(
      11,
      11,
      doc.slice(22, 26),
    );
    replaceTr.replace(
      26,
      30,
      Slice.empty,
    );

    const moveTr = new Transform(doc);
    moveTr.step(new MoveStep(22, 26, 11));

    expect(moveTr.doc.eq(replaceTr.doc)).toBe(true);
  });

  test('Inverts moving slices with open ends forward', () => {
    const doc = nodes.doc(
      nodes.p('1234567890'),
      nodes.p('abcdefghij'),
      nodes.p('**********'),
    );

    const moveStep = new MoveStep(22, 26, 11);
    const moveTr = new Transform(doc);

    const { doc: done } = moveTr.step(moveStep);

    let inverted = moveStep.invert(doc);

    const { doc: undid } = moveTr.step(inverted);
    expect(doc.toJSON()).toEqual(undid.toJSON());

    const redo = inverted.invert(undid);
    const { doc: redid } = moveTr.step(redo);
    expect(redid.toJSON()).toEqual(done.toJSON());
  });
});

import {
  Step,
  StepMap,
  StepResult,
  replaceStep,
} from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

class MoveStep extends Step {
  constructor(from, to, dest) {
    super();
    this.from = from;
    this.to = to;
    this.dest = dest;
  }

  apply(doc) {
    const slice = doc.slice(this.from, this.to);
    const replacingStep = replaceStep(
      doc,
      this.dest,
      this.dest,
      slice,
    );

    const insert = StepResult.fromReplace(
      doc,
      this.dest,
      this.dest,
      replacingStep.slice,
    );

    const { pos: from } = replacingStep.getMap().mapResult(this.from, -1);
    const { pos: to } = replacingStep.getMap().mapResult(this.to, 1);
    return StepResult.fromReplace(
      insert.doc,
      from,
      to,
      Slice.empty,
    );
  }

  invert(doc) {
    const slice = doc.slice(this.from, this.to);
    const replacingStep = replaceStep(
      doc,
      this.dest,
      this.dest,
      slice,
    );

    const { pos: currentDest } = this.getMap().mapResult(this.dest, -1);

    return new InvertedMoveStep(
      this.getMap().mapResult(this.from, -1).pos,
      slice,
      {
        from: currentDest,
        to: currentDest + replacingStep.slice.size
      },
    );
  }

  getMap() {
    const size = this.to - this.from;

    const ranges = this.dest > this.from ? [
        this.from,
        size,
        0,
        this.dest,
        0,
        size,
    ] : [
        this.dest,
        0,
        size,
        this.from,
        size,
        0,
    ]
    return new StepMap(ranges);
  }

  map(mappable) {
    return new MoveStep(
      mappable.mapResult(this.from, -1).pos,
      mappable.mapResult(this.to, 1).pos,
      mappable.mapResult(this.dest, 1).pos,
    );
  }
};

MoveStep.jsonID = 'moveStep';

MoveStep.fromJSON = function (json) {};

Step.jsonID(MoveStep.jsonID, MoveStep);

class InvertedMoveStep extends Step {
  constructor(dest, slice, { from, to }) {
    super();
    this.dest = dest;
    this.slice = slice;
    this.deleteFrom = from;
    this.deleteTo = to;
  }

  apply(doc) {
    const replace = StepResult.fromReplace(
      doc,
      this.dest,
      this.dest,
      this.slice,
    );
    return StepResult.fromReplace(
      replace.doc,
      this.deleteFrom + (this.dest < this.deleteFrom ? this.slice.size : 0),
      this.deleteTo + (this.dest < this.deleteFrom ? this.slice.size : 0),
      Slice.empty,
    );
  }

  invert(doc) {
    let from = this.dest;
    if (this.dest > this.deleteFrom) {
      from = this.dest - (this.deleteTo - this.deleteFrom);
    }
    let dest = this.deleteFrom;
    if (this.deleteFrom > this.dest) {
      dest = this.deleteFrom + this.slice.size
    }
    return new MoveStep(
      from,
      from + this.slice.size,
      dest,
    );
  }

  getMap() {
    const size = this.slice.size;

    const ranges = this.dest > this.deleteFrom ? [
        this.deleteFrom,
        size,
        0,
        this.dest,
        0,
        size,
    ] : [
        this.dest,
        0,
        size,
        this.from,
        size,
        0,
    ]
    return new StepMap(ranges);
  }

  map(mappable) {
    return new InvertedMoveStep(
      mappable.mapResult(this.dest).pos,
      this.slice,
      {
        from: mappable.mapResult(this.deleteFrom).pos,
        to: mappable.mapResult(this.deleteTo).pos,
      },
    );
  }
}

InvertedMoveStep.jsonID = 'invertedMoveStep';

InvertedMoveStep.fromJSON = function (json) {};

Step.jsonID(InvertedMoveStep.jsonID, InvertedMoveStep);

export { MoveStep };

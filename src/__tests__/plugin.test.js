import testBuilder from 'prosemirror-test-builder';
import { ReplaceStep } from 'prosemirror-transform';
import { EditorState, TextSelection } from 'prosemirror-state';
import { addListNodes } from 'prosemirror-schema-list';
import {
  schema as basicSchema,
  marks as basicMarks,
  nodes as basicNodes
} from 'prosemirror-schema-basic';
import {
  Fragment,
  NodeType,
  Schema,
  Slice
} from 'prosemirror-model';
import { handleCut, handlePaste } from '../plugin';
import { MoveStep } from '../Steps';
import { registerSpec, withRegisters } from '../registers';

const { builders: makeBuilders } = testBuilder;

const schema = withRegisters(basicSchema);
const builders = makeBuilders(schema);

describe('handlePaste', () => {
  test('produces a move step for a matching slice in a register', () => {
    const doc = builders.doc(
      builders.paragraph('world'),
      builders.register_slot(
        builders.register_block(
          {
            openStart: 0,
            openEnd: 0,
          },
          builders.paragraph('hello'),
        ),
      ),
    );
    const es = EditorState.create({
      schema,
      doc,
      selection: new TextSelection(doc.resolve(1)),
    });
    const slice = builders.doc(
      builders.paragraph('hello'),
    ).slice(0, 7);;

    let tr;
    let fakeDispatch = t => { tr = t; };
    handlePaste(
      {
        dispatch: fakeDispatch,
        state: es,
      },
      {},
      slice
    );
    expect(tr.steps[0]).toEqual(new MoveStep(9, 16, 1));

  });
});

describe('handleCut', () => {
  test('produces a move step that moves the selection into a register', () => {
    const doc = builders.doc(
      builders.paragraph('<start>hello<end>'),
      builders.paragraph('world'),
      builders.register_slot(),
    );

    const es = EditorState.create({
      doc,
      schema,
      selection: new TextSelection(
        doc.resolve(doc.tag.start),
        doc.resolve(doc.tag.end)
      ),
    });

    let tr;
    const fakeDispatch = t => { tr = t; };
    const res = handleCut(
      {
        dispatch: fakeDispatch,
        someProp() {},
        state: es,
      },
      {
        clipboardData: {
          clearData() {},
          setData() {},
        },
        preventDefault() {},
      },
    );

    expect(res).toBe(true);

    const [replaceStep, moveStep] = tr.steps;
    expect(replaceStep.from).toBe(15);
    expect(replaceStep.to).toBe(15);
    const expected = new Slice(
      Fragment.from(schema.nodes.register_inline.create({
        openStart: 0,
        openEnd: 0,
      })),
      0,
      0,
    );
    expect(replaceStep.slice.eq(expected)).toBe(true);

    expect(moveStep).toEqual(new MoveStep(1, 6, 16));
  });
});

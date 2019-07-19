import testBuilder from 'prosemirror-test-builder';
import {
  schema as basicSchema,
  marks as basicMarks,
  nodes as basicNodes
} from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { NodeType, Schema, Slice } from 'prosemirror-model';
import { registerSpec, withRegisters } from '../registers';

const { builders: makeBuilders } = testBuilder;

describe('register types', () => {
  test('can store information about a block slice', () => {
    const schema = withRegisters(basicSchema);
    const builders = makeBuilders(schema);
    const doc = builders.doc(
      builders.paragraph('hell<a>o'),
      builders.paragraph('w<b>orld'),
    );
    const slice = doc.slice(doc.tag.a, doc.tag.b);
    const register = builders.register_block({}, ...slice.content.content);
    expect(register.content.eq(slice.content)).toBe(true);
  });

  test('can store information about an inline slice', () => {
    const schema = withRegisters(basicSchema);
    const builders = makeBuilders(schema);
    const doc = builders.doc(
      builders.paragraph('he<a>ll<b>o'),
      builders.paragraph('world'),
    );
    const slice = doc.slice(doc.tag.a, doc.tag.b);
    const register = builders.register_inline({}, ...slice.content.content);
    expect(register.content.eq(slice.content)).toBe(true);
  });

  test('can store jagged slices', () => {
    const schema = withRegisters(
      new Schema({
        nodes: addListNodes(basicSchema.spec.nodes),
        marks: basicSchema.spec.marks,
      })
    );
    const builders = makeBuilders(schema);
    const doc = builders.doc(
      builders.ordered_list(
        builders.list_item(
          builders.paragraph(
            'row alpha',
          ),
        ),
        builders.list_item(
          builders.paragraph(
            'row <final_item>beta'
          ),
        ),
      ),
      builders.paragraph(
        'body <body>text',
      ),
    );
    const slice = doc.slice(doc.tag.final_item, doc.tag.body);
    const register_block = builders.register_block(
      {
        openEnd: 1,
        openStart: 3,
      },
      ...slice.content.content
    );
    expect(register_block.content.eq(slice.content)).toBe(true);
  });
});

describe('withRegisters', () => {
  test('adds registers to a schema', () => {
    const result = withRegisters(basicSchema);
    expect(result.nodes.register_slot instanceof NodeType).toBe(true);
    expect(result.nodes.register_inline instanceof NodeType).toBe(true);
    expect(result.nodes.register_block instanceof NodeType).toBe(true);
  });

  test('schema-compliant docs can have registers at the end', () => {
    const result = withRegisters(basicSchema);
    const builders = makeBuilders(result);
    const slice = builders
      .doc(builders.paragraph('hello'), builders.paragraph('world'))
      .slice(3, 6);

    const doc = builders.doc(
      builders.paragraph('hello'),
      builders.register_slot(
        builders.register_inline(
          {
            openEnd: slice.openEnd,
            openStart: slice.openStart,
          },
          ...slice.content.content
        )
      ),
    );

    expect(doc.lastChild.type).toBe(result.nodes.register_slot);
    expect(() => doc.check()).not.toThrow();
    expect(doc.lastChild.lastChild.content.eq(slice.content)).toBe(true);
  });

  test('schema-compliant docs always have registers at the end', () => {
    const result = withRegisters(basicSchema);
    const builders = makeBuilders(result);
    const slicer = builders.doc(
      builders.paragraph('hello'),
      builders.paragraph('world'),
    );
    const doc = builders.doc(
      builders.paragraph('hello'),
    );
    expect(() => doc.check()).toThrow();
  });

  test('schema-compliant docs can\'t have registers anywhere but the end', () => {
    const result = withRegisters(basicSchema);
    const builders = makeBuilders(result);
    const slicer = builders.doc(
      builders.paragraph('hello'),
      builders.paragraph('world'),
    );
    const doc = builders.doc(
      builders.register_slot(
        builders.register_block({}, slicer.slice(3, 6)),
      ),
      builders.paragraph('hello'),
    );
    expect(() => doc.check()).toThrow();
  });

  test('the default doc has a register slot at the end', () => {
    const result = withRegisters(basicSchema);
    const doc = result.topNodeType.createAndFill();
    expect(doc.lastChild.type).toBe(result.nodes.register_slot);
  });
});

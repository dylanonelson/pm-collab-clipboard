import { Schema } from 'prosemirror-model';

export const makeRegisterSpec = expr => ({
  attrs: {
    openEnd: {
      default: 0,
    },
    openStart: {
      default: 0,
    },
  },
  content: expr,
  group: 'register',
});

export const registerSlotSpec = {
  content: 'register*',
};

export function withRegisters(schema) {
  const nodes = {};
  const marks = {};

  Object.entries(schema.nodes).forEach(([key, { spec: value }]) => {
    if (key === schema.topNodeType.name || key === 'doc') {
      nodes[key] = {
        ...value,
        content: `${value.content} register_slot`,
      };
    } else {
      nodes[key] = value;
    }
  });

  schema.spec.marks.forEach((key, value) => {
    marks[key] = value;
  });

  const inlineNodes = Object.keys(nodes).filter(name => {
    return schema.nodes[name].isInline;
  });
  const blockNodes = Object.keys(nodes).filter(name => {
    return !schema.nodes[name].isInline;
  });

  return new Schema({
    nodes: {
      ...nodes,
      register_block: makeRegisterSpec(`(${blockNodes.join(' | ')})*`),
      register_inline: makeRegisterSpec(`(${inlineNodes.join(' | ')})*`),
      register_slot: registerSlotSpec,
    },
    marks,
  });
}

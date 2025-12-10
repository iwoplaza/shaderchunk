import * as wgsl from '@shaderchunk/wgsl';
import { ReduceShader } from './reduce.ts';

const add: wgsl.Fn<[a: wgsl.I32, b: wgsl.I32], wgsl.I32, []> = {
  kind: 'wgsl:fn',
  args: [
    { name: 'a', type: 'wgsl:i32' },
    { name: 'b', type: 'wgsl:i32' },
  ],
  returnType: 'wgsl:i32',
  attribs: [],
  nameHint: 'add',
  body: ['{\n  return a + b;\n}\n'],
};

const reduceShader = new ReduceShader({
  natural: { kind: 'wgsl:expr', type: 'wgsl:f32', value: ['0f'] },
  premapFn: {
    kind: 'wgsl:fn',
    args: [{ name: 'a', type: 'wgsl:f32' }],
    returnType: 'wgsl:i32',
    attribs: [],
    nameHint: 'toI32',
    body: ['{\n  return i32(a);\n}\n'],
  },
  reduceFn: add,
});

console.log(reduceShader.computeShader);
// Will print:
//
// fn add(a: i32, b: i32) -> i32 {
// return a + b;
// }
//
// fn toI32(a: f32) -> i32 {
//   return i32(a);
// }
//
// fn reduce() -> i32 {
//   return add(toI32(a), toI32(b));
// }
//

import * as wgsl from '@shaderchunk/wgsl';
import { f32, vec3f, wgslFn } from './xyzlib.ts';
import { sdfUnion } from './sdfUnion.ts';

// Creating a function using a shaderchunk-enabled library
const sphere = wgslFn([['p', vec3f]], f32)`{
  return length(p) - 1.0;
}`;

// Or writing the function raw
const plane: wgsl.Fn<[p: wgsl.Vec3f], wgsl.F32, []> = {
  kind: 'wgsl:fn',
  nameHint: 'plane',
  args: [{ name: 'p', type: 'wgsl:vec3f' }],
  returnType: 'wgsl:f32',
  body: ['{\n  return p.y;\n}\n'],
};

// A library can ingest chunks, and emit new chunks
const scene = sdfUnion([sphere, plane]);

const result = wgsl.link({ chunks: [scene] });
console.log(result.definitions);
// Will print:
//
// fn item(p: vec3f) -> f32 {
//   return length(p) - 1.0;
// }
//
// fn plane(p: vec3f) -> f32 {
//   return p.y;
// }
//
// fn sdfUnion(p: vec3f) -> f32 {
//   var d = f32(1e38);
//   d = min(d, item(p));
//   d = min(d, plane(p));
//   return d;
// }
//

import * as wgsl from '@shaderchunk/wgsl';
import { f32, vec3f, wgslFn } from './xyzlib.ts';
import { sdfUnion } from './sdfUnion.ts';

// Creating a function using a shaderchunk-enabled library
const sphere = wgslFn([['p', vec3f]], f32)`{
  return length(p) - 1.0;
}`;

// Or writing the function raw
const plane = {
  kind: 'wgsl:fn',
  nameHint: 'plane',
  args: [{ name: 'p', type: { kind: 'wgsl:vec3f' } }],
  returnType: { kind: 'wgsl:f32' },
  body: ['{\n', '  return p.y;\n', '}\n'],
  attribs: [],
} as const;

// A library can ingest chunks, and emit new chunks
const scene = sdfUnion([sphere, plane]);

const result = wgsl.link({ chunks: [scene] });
console.log(result.definitions);

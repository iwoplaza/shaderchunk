import * as wgsl from '@shaderchunk/wgsl';
import { sdfUnion } from './sdfUnion.ts';

const sphere = {
  kind: 'wgsl:fn',
  nameHint: 'sphere',
  args: [{ name: 'p', type: { kind: 'wgsl:vec3f' } }],
  returnType: { kind: 'wgsl:f32' },
  body: ['return length(p) - 1.0;'],
  attributes: [],
} as const;

const plane = {
  kind: 'wgsl:fn',
  nameHint: 'sphere',
  args: [{ name: 'p', type: { kind: 'wgsl:vec3f' } }],
  returnType: { kind: 'wgsl:u32' },
  body: ['return p.y;'],
  attributes: [],
} as const;

const scene = sdfUnion([sphere, sphere, plane]);

const result = wgsl.link({ chunks: [scene] });
console.log(result.definitions);

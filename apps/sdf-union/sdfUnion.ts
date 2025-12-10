// A type-only dependency
import type * as wgsl from '@shaderchunk/wgsl';

type SdfFn = wgsl.Fn<[p: wgsl.Vec3f], wgsl.F32, []>;

/**
 * Returns a function that computes the union of the given SDF functions.
 */
export function sdfUnion(objects: SdfFn[]): SdfFn {
  return {
    kind: 'wgsl:fn',
    args: [{ name: 'p', type: 'wgsl:vec3f' }],
    nameHint: 'sdfUnion',
    returnType: 'wgsl:f32',
    body: [
      '{\n',
      '  var d = f32(1e38);\n',
      ...objects.flatMap((obj) => ['  d = min(d, ', obj, '(p));\n']),
      '  return d;\n',
      '}\n',
    ],
    attribs: [],
  } as const;
}

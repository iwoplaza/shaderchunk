import type * as wgsl from '@shaderchunk/wgsl';

export function sdfUnion(
  objects: (
    | wgsl.Fn<readonly [p: wgsl.Vec3f], wgsl.F32>
    | wgsl.Fn<readonly [p: wgsl.Vec3f], wgsl.U32>
  )[],
): wgsl.Fn<readonly [p: wgsl.Vec3f], wgsl.F32> {
  return {
    kind: 'wgsl:fn',
    args: [{ name: 'p', type: { kind: 'wgsl:vec3f' } }],
    nameHint: 'sdfUnion',
    returnType: { kind: 'wgsl:f32' },
    body: [
      'var d = f32(1e38);\n',
      ...objects.flatMap((obj) =>
        obj.returnType.kind === 'wgsl:f32'
          ? ['d = min(d, ', obj, '(p));\n']
          : ['d = min(d, f32(', obj, '(p)));\n'],
      ),
      'return d;\n',
    ],
    attributes: [],
  } as const;
}

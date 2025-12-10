//
// An example library built on top of @shaderchunk/wgsl
//

import type * as wgslType from '@shaderchunk/wgsl';

export const f32: wgslType.F32 = 'wgsl:f32';
export const vec2f: wgslType.Vec2f = 'wgsl:vec2f';
export const vec3f: wgslType.Vec3f = 'wgsl:vec3f';
export const vec4f: wgslType.Vec4f = 'wgsl:vec4f';

export function wgslFn<
  TArgs extends [string, wgslType.DataType][] | [],
  TReturn extends wgslType.DataType,
>(
  args: TArgs,
  returnType: TReturn,
): (
  strings: TemplateStringsArray,
  ...values: (string | wgslType.ChunkBase)[]
) => wgslType.Fn<{ [K in keyof TArgs]: TArgs[K][1] }, TReturn, []> {
  return (strings, ...values) => {
    const body = strings.flatMap((str, i) => {
      const value = values[i];
      return value ? [str, value] : [str];
    });

    return {
      kind: 'wgsl:fn',
      nameHint: '',
      args: args.map(([name, type]) => ({ name, type })),
      returnType,
      body: [...body, '\n'],
    } as unknown as wgslType.Fn<
      { [K in keyof TArgs]: TArgs[K][1] },
      TReturn,
      readonly []
    >;
  };
}

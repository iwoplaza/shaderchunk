export type DataType = ChunkBase | `wgsl:${string}`;

export type Void = 'wgsl:void';

export type F32 = 'wgsl:f32';
export type I32 = 'wgsl:i32';
export type U32 = 'wgsl:u32';
export type F16 = 'wgsl:f16';
export type Bool = 'wgsl:bool';

export type Vec2f = 'wgsl:vec2f';
export type Vec2i = 'wgsl:vec2i';
export type Vec2u = 'wgsl:vec2u';
export type Vec2h = 'wgsl:vec2h';
export type Vec2b = 'wgsl:vec2b';

export type Vec3f = 'wgsl:vec3f';
export type Vec3i = 'wgsl:vec3i';
export type Vec3u = 'wgsl:vec3u';
export type Vec3h = 'wgsl:vec3h';
export type Vec3b = 'wgsl:vec3b';

export type Vec4f = 'wgsl:vec4f';
export type Vec4i = 'wgsl:vec4i';
export type Vec4u = 'wgsl:vec4u';
export type Vec4h = 'wgsl:vec4h';
export type Vec4b = 'wgsl:vec4b';

export type Attribute = {
  name: string;
  params: (ChunkBase | string)[][];
};

export type StructProperty<
  TType extends DataType = DataType,
  TAttribs extends Attribute[] = Attribute[],
> = {
  type: TType;
  attribs: TAttribs;
};

export type Struct<
  T extends Record<string, StructProperty> = Record<string, StructProperty>,
> = {
  kind: 'wgsl:struct';
  nameHint: string;
  props: T;
};

export type Array<
  TElem extends DataType = DataType,
  TCount extends number = number,
> = {
  kind: 'wgsl:array';
  elem: TElem;
  count: TCount;
};

export type ChunkBase = {
  kind: `wgsl:${string}`;
};

export type WithNameHint = {
  nameHint: string;
};

export type Expression<T extends DataType = DataType> = {
  kind: 'wgsl:expr';
  type: T;
  value: (ChunkBase | string)[];
};

export type Fn<
  TArgs extends readonly DataType[] = readonly DataType[],
  TReturn extends DataType = DataType,
  TAttribs extends readonly Attribute[] = readonly Attribute[],
> = {
  kind: 'wgsl:fn';
  nameHint: string;
  args: Readonly<{ [K in keyof TArgs]: { name: string; type: TArgs[K], attribs?: Attribute[] | undefined } }>;
  returnType: TReturn;
  body: readonly (ChunkBase | string)[];
  attribs: Readonly<TAttribs>;
  '~shaderchunk'?:
    | {
        signature: (...args: TArgs) => TReturn;
      }
    | undefined;
};

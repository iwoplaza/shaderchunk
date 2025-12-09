export type Bool = {
  kind: 'wgsl:bool',
};

export type F16 = {
  kind: 'wgsl:f16',
};

export type F32 = {
  kind: 'wgsl:f32',
};

export type I32 = {
  kind: 'wgsl:i32',
};

export type U32 = {
  kind: 'wgsl:u32',
};

// Vector types with different component types
export type Vec2f = {
  kind: 'wgsl:vec2f',
};

export type Vec2i = {
  kind: 'wgsl:vec2i',
};

export type Vec2u = {
  kind: 'wgsl:vec2u',
};

export type Vec2h = {
  kind: 'wgsl:vec2h',
};

export type Vec2b = {
  kind: 'wgsl:vec2b',
};

export type Vec3f = {
  kind: 'wgsl:vec3f',
};

export type Vec3i = {
  kind: 'wgsl:vec3i',
};

export type Vec3u = {
  kind: 'wgsl:vec3u',
};

export type Vec3h = {
  kind: 'wgsl:vec3h',
};

export type Vec3b = {
  kind: 'wgsl:vec3b',
};

export type Vec4f = {
  kind: 'wgsl:vec4f',
};

export type Vec4i = {
  kind: 'wgsl:vec4i',
};

export type Vec4u = {
  kind: 'wgsl:vec4u',
};

export type Vec4h = {
  kind: 'wgsl:vec4h',
};

export type Vec4b = {
  kind: 'wgsl:vec4b',
};

export type Struct<T extends Record<string, ChunkBase>> = {
  kind: 'wgsl:struct',
  nameHint: string,
  props: T,
};

export type Array<TElem extends ChunkBase, TCount extends number> = {
  kind: 'wgsl:array',
  elementType: TElem,
  count: TCount,
};

export type ChunkBase = {
  kind: `wgsl:${string}`,
};

export type WithNameHint = {
  nameHint: string,
};

export type Call = {
  kind: 'wgsl:call',
  args: { name: string, type: ChunkBase }[],
};

export type Fn = {
  kind: 'wgsl:fn',
  nameHint: string,
  args: { name: string, type: ChunkBase }[],
  returnType: ChunkBase,
  body: (ChunkBase | string)[],
};

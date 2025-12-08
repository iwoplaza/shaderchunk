export type F32 = {
  kind: 'wgsl:f32',
};

export type Vec3f = {
  kind: 'wgsl:vec3f',
};

export type Vec4f = {
  kind: 'wgsl:vec4f',
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

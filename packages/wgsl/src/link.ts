import type { ChunkBase, WithNameHint } from './types.ts';

export type LinkOptions = {
  chunks: ChunkBase[],
};

export type LinkResult = {
  definitions: string,
  expression: string,
};

export type Context = {
  usedNames: Set<string>,
  linked: WeakMap<ChunkBase, string>,
  definitions: string,
};

const simpleChunks = {
  'wgsl:vec2f': 'vec2f',
  'wgsl:vec3f': 'vec3f',
  'wgsl:vec4f': 'vec4f',
};

function createName(ctx: Context, chunk: ChunkBase): string {
  let nameHint = 'item';
  if (typeof (chunk as ChunkBase & WithNameHint).nameHint === 'string') {
    nameHint = (chunk as ChunkBase & WithNameHint).nameHint;
  }

  let name = nameHint;
  let index = 1;
  while (ctx.usedNames.has(name)) {
    name = `${nameHint}_${index++}`;
  }
  ctx.usedNames.add(name);
  return name;
}

function linkChunk(ctx: Context, chunk: ChunkBase): string {
  if (ctx.linked.has(chunk)) {
    return ctx.linked.get(chunk) as string;
  }

  if (chunk.kind in simpleChunks) {
    return simpleChunks[chunk.kind];
  }

  if (chunk.kind === 'wgsl:fn') {
    const name = createName(ctx, chunk);

    const def = `fn ${name} () {}\n\n`;
    ctx.definitions += def;

    ctx.linked.set(chunk, name);
    return name;
  }

  throw new Error(`Unknown kind of shader chunk: ${chunk.kind}`);
}

export function link(options: LinkOptions): LinkResult {
  const ctx: Context = {
    definitions: '',
    usedNames: new Set(),
    linked: new WeakMap(),
  };
  let expression = '';

  for (const chunk of options.chunks) {
    expression += linkChunk(ctx, chunk);
  }

  return {
    definitions: ctx.definitions,
    expression,
  };
}

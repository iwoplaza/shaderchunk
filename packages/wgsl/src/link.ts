import type * as wgsl from './types.ts';

export type LinkOptions = {
  chunks: (wgsl.ChunkBase | string)[];
};

export type LinkResult = {
  definitions: string;
  expression: string;
};

export type Context = {
  usedNames: Set<string>;
  linked: WeakMap<wgsl.ChunkBase, string>;
  definitions: string;
};

const simpleChunks = {
  // Primitive types
  'wgsl:bool': 'bool',
  'wgsl:f16': 'f16',
  'wgsl:f32': 'f32',
  'wgsl:i32': 'i32',
  'wgsl:u32': 'u32',

  // Vector types
  'wgsl:vec2f': 'vec2f',
  'wgsl:vec2i': 'vec2i',
  'wgsl:vec2u': 'vec2u',
  'wgsl:vec2h': 'vec2h',
  'wgsl:vec2b': 'vec2<bool>',
  'wgsl:vec3f': 'vec3f',
  'wgsl:vec3i': 'vec3i',
  'wgsl:vec3u': 'vec3u',
  'wgsl:vec3h': 'vec3h',
  'wgsl:vec3b': 'vec3<bool>',
  'wgsl:vec4f': 'vec4f',
  'wgsl:vec4i': 'vec4i',
  'wgsl:vec4u': 'vec4u',
  'wgsl:vec4h': 'vec4h',
  'wgsl:vec4b': 'vec4<bool>',
};

function createName(ctx: Context, chunk: wgsl.ChunkBase): string {
  let nameHint = 'item';

  const namedChunk = chunk as wgsl.ChunkBase & wgsl.WithNameHint;
  if (
    typeof namedChunk.nameHint === 'string' &&
    namedChunk.nameHint.length > 0
  ) {
    nameHint = namedChunk.nameHint;
  }

  let name = nameHint;
  let index = 1;
  while (ctx.usedNames.has(name)) {
    name = `${nameHint}_${index++}`;
  }
  ctx.usedNames.add(name);
  return name;
}

function linkDataType(ctx: Context, dataType: wgsl.DataType): string {
  if (typeof dataType === 'string' && dataType in simpleChunks) {
    return simpleChunks[dataType];
  }

  return linkChunk(ctx, dataType as wgsl.ChunkBase);
}

function linkChunk(ctx: Context, chunk: wgsl.ChunkBase): string {
  if (ctx.linked.has(chunk)) {
    return ctx.linked.get(chunk) as string;
  }

  if (chunk.kind === 'wgsl:fn') {
    const fnChunk = chunk as wgsl.Fn;
    const name = createName(ctx, chunk);

    // Generate parameter list
    const params = fnChunk.args
      .map((arg) => {
        const paramType = linkDataType(ctx, arg.type);
        return `${arg.name}: ${paramType}`;
      })
      .join(', ');

    // Generate return type
    const returnType = linkDataType(ctx, fnChunk.returnType);

    // Generate function body
    const body = fnChunk.body
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        return linkChunk(ctx, part);
      })
      .join('');

    // Generate function attributes if any
    const functionAttribs =
      fnChunk.attribs && fnChunk.attribs.length > 0
        ? fnChunk.attribs
            .map((attr) => generateAttribute(ctx, attr))
            .join(' ') + '\n'
        : '';

    const def = `${functionAttribs}fn ${name}(${params}) -> ${returnType} ${body}\n`;
    ctx.definitions += def;

    ctx.linked.set(chunk, name);
    return name;
  }

  if (chunk.kind === 'wgsl:struct') {
    const structChunk = chunk as wgsl.Struct;

    // Check if this struct has already been defined
    if (ctx.linked.has(chunk)) {
      return ctx.linked.get(chunk) as string;
    }

    // Create a unique name for the struct using the nameHint
    const structName = createName(ctx, chunk);

    // Generate the struct definition
    const structDef = `struct ${structName} {\n${Object.entries(
      structChunk.props,
    )
      .map(([key, prop]) => {
        const fieldAttribs =
          prop.attribs && prop.attribs.length > 0
            ? prop.attribs
                .map((attr) => generateAttribute(ctx, attr))
                .join(' ') + ' '
            : '';
        return `  ${fieldAttribs}${key}: ${linkDataType(ctx, prop.type)};`;
      })
      .join('\n')}\n};\n\n`;

    // Add the definition to the context
    ctx.definitions += structDef;

    // Store the reference to avoid redefinition
    ctx.linked.set(chunk, structName);

    return structName;
  }

  if (chunk.kind === 'wgsl:array') {
    const arrayChunk = chunk as wgsl.Array;
    const elementType = linkDataType(ctx, arrayChunk.elem);
    return `array<${elementType}, ${arrayChunk.count}>`;
  }

  throw new Error(`Unknown kind of shader chunk: ${chunk.kind}`);
}

export function generateAttribute(
  ctx: Context,
  attribute: wgsl.Attribute,
): string {
  if (attribute.params.length === 0) {
    return `@${attribute.name}`;
  }

  const params = attribute.params
    .map((paramGroup) => {
      return paramGroup
        .map((param) => {
          if (typeof param === 'string') {
            return param;
          }
          return linkChunk(ctx, param);
        })
        .join(', ');
    })
    .join(', ');

  return `@${attribute.name}(${params})`;
}

export function link(options: LinkOptions): LinkResult {
  const ctx: Context = {
    definitions: '',
    usedNames: new Set(),
    linked: new WeakMap(),
  };
  let expression = '';

  for (const chunk of options.chunks) {
    if (typeof chunk === 'string') {
      expression += chunk;
    } else {
      expression += linkChunk(ctx, chunk);
    }
  }

  return {
    definitions: ctx.definitions,
    expression,
  };
}

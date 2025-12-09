import { describe, it, expect } from 'vitest';
import { link, generateAttribute } from '../src/link.ts';
import type { Fn, Attribute } from '../src/types.ts';

describe('link', () => {
  it('should generate correct WGSL function definition for adding two f32 values', () => {
    const addF32Function: Fn = {
      kind: 'wgsl:fn',
      nameHint: 'addF32',
      args: [
        { name: 'a', type: 'wgsl:f32' },
        { name: 'b', type: 'wgsl:f32' },
      ],
      returnType: 'wgsl:f32',
      body: ['{\n', 'return a + b;\n', '}\n'],
      attribs: [],
    };

    const result = link({
      chunks: [addF32Function, '(1, ', addF32Function, '(2, 3))'],
    });

    expect(result.expression).toMatchInlineSnapshot(`"addF32(1, addF32(2, 3))"`);
    expect(result.definitions).toMatchInlineSnapshot(`
      "fn addF32(a: f32, b: f32) -> f32 {
      return a + b;
      }

      "
    `);
  });

  it('should handle all WGSL primitive and vector types', () => {
    const complexFunction = {
      kind: 'wgsl:fn',
      nameHint: 'processData',
      args: [
        { name: 'b', type: 'wgsl:bool' },
        { name: 'f16', type: 'wgsl:f16' },
        { name: 'i', type: 'wgsl:i32' },
        { name: 'u', type: 'wgsl:u32' },
        { name: 'v2f', type: 'wgsl:vec2f' },
        { name: 'v2i', type: 'wgsl:vec2i' },
        { name: 'v2u', type: 'wgsl:vec2u' },
        { name: 'v2h', type: 'wgsl:vec2h' },
        { name: 'v2b', type: 'wgsl:vec2b' },
        { name: 'v3f', type: 'wgsl:vec3f' },
        { name: 'v3i', type: 'wgsl:vec3i' },
        { name: 'v3u', type: 'wgsl:vec3u' },
        { name: 'v3h', type: 'wgsl:vec3h' },
        { name: 'v3b', type: 'wgsl:vec3b' },
        { name: 'v4f', type: 'wgsl:vec4f' },
        { name: 'v4i', type: 'wgsl:vec4i' },
        { name: 'v4u', type: 'wgsl:vec4u' },
        { name: 'v4h', type: 'wgsl:vec4h' },
        { name: 'v4b', type: 'wgsl:vec4b' },
      ],
      returnType: 'wgsl:vec4f',
      body: ['{\n','  return v4f;\n', '}\n'],
    } as const;

    const result = link({ chunks: [complexFunction] });

    expect(result.expression).toMatchInlineSnapshot(`"processData"`);
    expect(result.definitions).toMatchInlineSnapshot(`
      "fn processData(b: bool, f16: f16, i: i32, u: u32, v2f: vec2f, v2i: vec2i, v2u: vec2u, v2h: vec2h, v2b: vec2<bool>, v3f: vec3f, v3i: vec3i, v3u: vec3u, v3h: vec3h, v3b: vec3<bool>, v4f: vec4f, v4i: vec4i, v4u: vec4u, v4h: vec4h, v4b: vec4<bool>) -> vec4f {
        return v4f;
      }

      "
    `);
  });

  it('should generate correct WGSL struct types', () => {
    const structType = {
      kind: 'wgsl:struct' as const,
      nameHint: 'VertexData',
      props: {
        position: { type: 'wgsl:vec3f' },
        color: { type: 'wgsl:vec4f' },
        id: { type: 'wgsl:u32' },
        active: { type: 'wgsl:bool' },
      },
    };

    const result = link({ chunks: [structType] });

    expect(result.expression).toMatchInlineSnapshot(`"VertexData"`);
    expect(result.definitions).toMatchInlineSnapshot(`
      "struct VertexData {
        position: vec3f;
        color: vec4f;
        id: u32;
        active: bool;
      };

      "
    `);
  });

  it('should generate correct WGSL array types', () => {
    const arrayType = {
      kind: 'wgsl:array' as const,
      elem: 'wgsl:f32',
      count: 10,
    };

    const result = link({ chunks: [arrayType] });

    expect(result.expression).toMatchInlineSnapshot(`"array<f32, 10>"`);
  });

  it('should handle structs and arrays in function parameters', () => {
    const vertexStruct = {
      kind: 'wgsl:struct',
      nameHint: 'Vertex',
      props: {
        position: { type: 'wgsl:vec3f' },
        normal: { type: 'wgsl:vec3f' },
        uv: { type: 'wgsl:vec2f' },
      },
    } as const;

    const vertexArray = {
      kind: 'wgsl:array' as const,
      elem: vertexStruct,
      count: 100,
    };

    const processVerticesFunction: Fn = {
      kind: 'wgsl:fn',
      nameHint: 'processVertices',
      args: [
        { name: 'vertices', type: vertexArray },
        { name: 'index', type: 'wgsl:u32' },
      ],
      returnType: vertexStruct,
      body: ['return vertices[index];'],
      attribs: [],
    };

    const result = link({ chunks: [processVerticesFunction] });

    expect(result.expression).toMatchInlineSnapshot(`"processVertices"`);
    expect(result.definitions).toMatchInlineSnapshot(`
      "struct Vertex {
        position: vec3f;
        normal: vec3f;
        uv: vec2f;
      };

      fn processVertices(vertices: array<Vertex, 100>, index: u32) -> Vertex return vertices[index];
      "
    `);
  });

  describe('generateAttribute', () => {
    it('should generate simple attribute with no parameters', () => {
      const ctx = {
        usedNames: new Set<string>(),
        linked: new WeakMap(),
        definitions: '',
      };

      const attribute: Attribute = {
        name: 'builtin',
        params: [],
      };

      const result = generateAttribute(ctx, attribute);
      expect(result).toBe('@builtin');
    });

    it('should generate attribute with string parameters', () => {
      const ctx = {
        usedNames: new Set<string>(),
        linked: new WeakMap(),
        definitions: '',
      };

      const attribute: Attribute = {
        name: 'size',
        params: [['16']],
      };

      const result = generateAttribute(ctx, attribute);
      expect(result).toBe('@size(16)');
    });

    it('should generate attribute with multiple string parameters', () => {
      const ctx = {
        usedNames: new Set<string>(),
        linked: new WeakMap(),
        definitions: '',
      };

      const attribute: Attribute = {
        name: 'workgroup_size',
        params: [['16', '16', '1']],
      };

      const result = generateAttribute(ctx, attribute);
      expect(result).toBe('@workgroup_size(16, 16, 1)');
    });

    it('should generate attribute with mixed parameters', () => {
      const ctx = {
        usedNames: new Set<string>(),
        linked: new WeakMap(),
        definitions: '',
      };

      const attribute: Attribute = {
        name: 'builtin',
        params: [['position']],
      };

      const result = generateAttribute(ctx, attribute);
      expect(result).toBe('@builtin(position)');
    });

    it('should generate attribute with multiple parameter groups', () => {
      const ctx = {
        usedNames: new Set<string>(),
        linked: new WeakMap(),
        definitions: '',
      };

      const attribute: Attribute = {
        name: 'complex',
        params: [['param1'], ['param2', 'param3']],
      };

      const result = generateAttribute(ctx, attribute);
      expect(result).toBe('@complex(param1, param2, param3)');
    });

    it('should generate attribute with chunk-based parameters', () => {
      const ctx = {
        usedNames: new Set<string>(),
        linked: new WeakMap(),
        definitions: '',
      };

      const attribute: Attribute = {
        name: 'custom_type',
        params: [['baz']],
      };

      const result = generateAttribute(ctx, attribute);
      expect(result).toBe('@custom_type(baz)');
    });
  });

  it('should generate struct with attributes on fields', () => {
    const structWithAttributes = {
      kind: 'wgsl:struct' as const,
      nameHint: 'VertexInput',
      props: {
        position: {
          type: 'wgsl:vec3f',
          attribs: [
            { name: 'builtin', params: [['position']] },
            { name: 'invariant', params: [] },
          ],
        },
        normal: {
          type: 'wgsl:vec3f',
          attribs: [{ name: 'location', params: [['0']] }],
        },
        uv: {
          type: 'wgsl:vec2f',
          attribs: [{ name: 'location', params: [['1']] }],
        },
        instanceId: {
          type: 'wgsl:u32',
          attribs: [],
        },
      },
    };

    const result = link({ chunks: [structWithAttributes] });

    expect(result.expression).toMatchInlineSnapshot(`"VertexInput"`);
    expect(result.definitions).toMatchInlineSnapshot(`
      "struct VertexInput {
        @builtin(position) @invariant position: vec3f;
        @location(0) normal: vec3f;
        @location(1) uv: vec2f;
        instanceId: u32;
      };

      "
    `);
  });

  it('should generate function with attributes', () => {
    const functionWithAttributes: Fn = {
      kind: 'wgsl:fn',
      nameHint: 'vertexMain',
      attribs: [
        { name: 'vertex', params: [] },
        { name: 'workgroup_size', params: [['64', '1', '1']] },
      ],
      args: [{ name: 'input', type: 'wgsl:vec3f' }],
      returnType: 'wgsl:vec4f',
      body: ['return vec4f(input, 1.0);'],
    };

    const result = link({ chunks: [functionWithAttributes] });

    expect(result.expression).toMatchInlineSnapshot(`"vertexMain"`);
    expect(result.definitions).toMatchInlineSnapshot(`
      "@vertex @workgroup_size(64, 1, 1)
      fn vertexMain(input: vec3f) -> vec4f return vec4f(input, 1.0);
      "
    `);
  });
});

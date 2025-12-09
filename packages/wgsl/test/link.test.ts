import { describe, it, expect } from 'vitest';
import { link } from '../src/link.js';
import type { Fn } from '../src/types.js';

describe('link', () => {
  it('should generate correct WGSL function definition for adding two f32 values', () => {
    const addF32Function: Fn = {
      kind: 'wgsl:fn',
      nameHint: 'addF32',
      args: [
        { name: 'a', type: { kind: 'wgsl:f32' } },
        { name: 'b', type: { kind: 'wgsl:f32' } }
      ],
      returnType: { kind: 'wgsl:f32' },
      body: ['return a + b;']
    };

    const result = link({ chunks: [addF32Function, '(1, ', addF32Function, '(2, 3))'] });

    expect(result).toMatchInlineSnapshot(`
      {
        "definitions": "fn addF32(a: f32, b: f32) -> f32 {
      return a + b;
      }

      ",
        "expression": "addF32(1, addF32(2, 3))",
      }
    `);
  });

  it('should handle all WGSL primitive and vector types', () => {
    const complexFunction: Fn = {
      kind: 'wgsl:fn',
      nameHint: 'processData',
      args: [
        { name: 'b', type: { kind: 'wgsl:bool' } },
        { name: 'f16', type: { kind: 'wgsl:f16' } },
        { name: 'i', type: { kind: 'wgsl:i32' } },
        { name: 'u', type: { kind: 'wgsl:u32' } },
        { name: 'v2f', type: { kind: 'wgsl:vec2f' } },
        { name: 'v2i', type: { kind: 'wgsl:vec2i' } },
        { name: 'v2u', type: { kind: 'wgsl:vec2u' } },
        { name: 'v2h', type: { kind: 'wgsl:vec2h' } },
        { name: 'v2b', type: { kind: 'wgsl:vec2b' } },
        { name: 'v3f', type: { kind: 'wgsl:vec3f' } },
        { name: 'v3i', type: { kind: 'wgsl:vec3i' } },
        { name: 'v3u', type: { kind: 'wgsl:vec3u' } },
        { name: 'v3h', type: { kind: 'wgsl:vec3h' } },
        { name: 'v3b', type: { kind: 'wgsl:vec3b' } },
        { name: 'v4f', type: { kind: 'wgsl:vec4f' } },
        { name: 'v4i', type: { kind: 'wgsl:vec4i' } },
        { name: 'v4u', type: { kind: 'wgsl:vec4u' } },
        { name: 'v4h', type: { kind: 'wgsl:vec4h' } },
        { name: 'v4b', type: { kind: 'wgsl:vec4b' } }
      ],
      returnType: { kind: 'wgsl:vec4f' },
      body: ['return v4f;']
    };

    const result = link({ chunks: [complexFunction] });

    expect(result).toMatchInlineSnapshot(`
      {
        "definitions": "fn processData(b: bool, f16: f16, i: i32, u: u32, v2f: vec2f, v2i: vec2i, v2u: vec2u, v2h: vec2h, v2b: vec2<bool>, v3f: vec3f, v3i: vec3i, v3u: vec3u, v3h: vec3h, v3b: vec3<bool>, v4f: vec4f, v4i: vec4i, v4u: vec4u, v4h: vec4h, v4b: vec4<bool>) -> vec4f {
      return v4f;
      }

      ",
        "expression": "processData",
      }
    `);
  });
});

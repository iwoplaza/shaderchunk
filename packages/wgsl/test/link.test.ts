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

    const result = link({ chunks: [addF32Function] });

    expect(result).toMatchInlineSnapshot(`
      {
        "definitions": "fn addF32(a: f32, b: f32) -> f32 { return a + b; }

      ",
        "expression": "addF32",
      }
    `);
  });
});
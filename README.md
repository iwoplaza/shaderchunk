# shaderchunk

> 🚧 Under development & seeking feedback - not ready for production use 🚧

A minimal integration layer for type-safe shader composition.

## Cost of adoption

`shaderchunk` is a type-only dependency for shader chunk [producers](#create-shader-chunks) and [composers](#compose-shader-chunks), and a minimal
runtime dependency for shader chunk [consumers](#accept-shader-chunks).

## Features
- Automatic name clash resolution.
- Transitive dependency tracking.
- Higher-order shader functions.
- Reflection.

Supported shading languages:
- WGSL via `@shaderchunk/wgsl`
- GLSL via `@shaderchunk/glsl` (in development)

## Accept shader chunks

Authoring your shaders and APIs around shader chunks allows you to accept not only configuration values, but also
logic. Any library compatible with shader chunks can have a say in the final shader bundle.

```ts
import { PbrMaterial } from 'xyz-lib';
import { voronoi } from 'abc-lib';

const material = new PbrMaterial({
  // The structure of the material shader is defined by PbrMaterial, yet the
  // albedo color is decided by the `voronoi` function from `abc-lib`, all without
  // any shared runtime dependencies.
  albedo: voronoi,
  roughness: 0.5,
});

import * as wgsl from '@shaderchunk/wgsl';
const shaderCode = wgsl.link({ chunks: [material.vertex, material.fragment] }).definitions;
//    ^? string
```

## Create shader chunks

A shaderchunk-enabled library can provide an ergonomic way to define shader chunks, but you can also define them manually.
The example below shows a set of Signed Distance Field functions, exported for use in other shaders.

```ts
import type * as wgsl from '@shaderchunk/wgsl';

// Common code for every SDF function
const sdFn = {
  kind: 'wgsl:fn',
  args: [{ name: 'p', type: 'wgsl:vec3f' }],
  returnType: 'wgsl:f32',
} as const;

type SdFn = wgsl.Fn<[p: wgsl.Vec3f], wgsl.F32, []>;

// A signed-distance field function of a plane perpendicular
// to the y-axis, anchored at the origin.
export const yPlaneSd: SdFn = {
  ...sdFn,
  nameHint: 'yPlaneSd',
  body: ['{\n  return p.y;\n}\n'],
};

// A signed-distance field function of a unit sphere, anchored
// at the origin.
export const unitSphereSd: SdFn = {
  ...sdFn,
  nameHint: 'sphereSd',
  body: ['{\n  return length(p) - 1.0;\n}\n'],
};

// An example SDF scene combining a plane and a sphere.
export const demoSceneSd: SdFn = {
  ...sdFn,
  nameHint: 'demoSceneSd',
  // References to other definitions are done with reified object references, which are
  // resolved during linking.
  body: ['{\n  return min(', yPlaneSd, '(p), ', unitSphereSd, '(p));\n}\n'],
};
```

## Compose shader chunks

A library can accept shader chunks, compose them together, and emit new shader chunks.
This means higher-order shader functions and conditional compilation using JS as the medium.

```ts
// A type-only dependency
import type * as wgsl from '@shaderchunk/wgsl';

type SdfFn = wgsl.Fn<[p: wgsl.Vec3f], wgsl.F32, []>;

/**
 * Returns a function that computes the union of the given SDF functions.
 */
export function sdfUnion(objects: SdfFn[]): SdfFn {
  return {
    kind: 'wgsl:fn',
    args: [{ name: 'p', type: 'wgsl:vec3f' }],
    nameHint: 'sdfUnion',
    returnType: 'wgsl:f32',
    body: [
      '{\n',
      '  var d = f32(1e38);\n',
      ...objects.flatMap((obj) => ['  d = min(d, ', obj, '(p));\n']),
      '  return d;\n',
      '}\n',
    ],
    attribs: [],
  };
}
```

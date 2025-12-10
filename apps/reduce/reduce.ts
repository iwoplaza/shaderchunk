import * as wgsl from '@shaderchunk/wgsl';

export interface ReduceShaderOptions<
  TPre extends wgsl.DataType,
  TElem extends wgsl.DataType,
> {
  natural: wgsl.Expression<TPre>;
  premapFn?: wgsl.Fn<[TPre], TElem> | undefined;
  reduceFn: wgsl.Fn<[TElem, TElem], NoInfer<TElem>>;
}

export class ReduceShader<
  TPre extends wgsl.DataType,
  TElem extends wgsl.DataType = TPre,
> {
  readonly computeShader: string;

  constructor(options: ReduceShaderOptions<TPre, TElem>) {
    const { natural, premapFn, reduceFn } = options;

    // Not a real implementation of a reduce shader, just for demo
    // purposes.

    const reduceWithPremap = {
      kind: 'wgsl:fn',
      nameHint: 'reduce',
      args: [],
      // The same return type as reduceFn
      returnType: reduceFn.returnType,
      body: [
        '{\n',
        '  return ', reduceFn, '(', premapFn, '(a), ', premapFn, '(b));\n',
        '}\n',
      ],
      attribs: [],
    } as const;

    this.computeShader = wgsl.link({ chunks: [reduceWithPremap] }).definitions;
  }
}

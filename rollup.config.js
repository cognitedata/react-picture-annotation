/* eslint-disable global-require */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import path from 'path';
import pkg from './package.json';

const projectRootDir = path.resolve(__dirname);

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        name: 'named',
        format: 'umd',
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          {
            find: 'src',
            replacement: path.resolve(projectRootDir, 'src'),
          },
        ],
      }),
      typescript({
        typescript: require('typescript'),
        exclude: ['**/*.(spec|test|stories).ts+(|x)'],
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.ts', '.tsx'],
        babelHelpers: 'runtime',
      }),
      commonjs(),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    node: {
      fs: "empty"
    },
  },
];

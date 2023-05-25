export const tsConfigMinimal = {
  compilerOptions: {
    target: 'es2016',
    module: 'commonjs',
    strict: true,
    skipLibCheck: true,
  },
};

export default JSON.stringify(tsConfigMinimal);

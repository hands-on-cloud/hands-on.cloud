let shouldProxy = process.env.GATSBY_CPU_COUNT != null;

if (shouldProxy) {
  const Module = require('module');
  const src = `module.exports = process.env.GATSBY_CPU_COUNT || 1;`;
  Module._load = new Proxy(Module._load, {
    apply(target, thisArg, argumentsList) {
      const [request, parent] = argumentsList;
      if (shouldProxy && /physical-cpu-count/.test(request)) {
        const filename = Module._resolveFilename(...argumentsList);
        const module = new Module(filename, parent);
        module._compile(src, filename);
        Module._cache[filename] = module;
        shouldProxy = false;
        return module.exports;
      }
      return Reflect.apply(target, thisArg, argumentsList);
    },
  });
}

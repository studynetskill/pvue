import { reactive, effect } from "../reactivity/index";

export interface Context {
  scope: Record<string, any>;
  effect: typeof effect;
  cleanups: (() => void)[];
}

// 简单创建返回包含scope，effect等的上下文，方便后面使用
export const createContext = (): Context => {
  const ctx: Context = {
    scope: reactive({}),
    effect,
    cleanups: [],
  };

  return ctx;
};

export const createScopedContext = (ctx: Context, data = {}) => {
  const parentScope = ctx.scope;
  const mergedScope = Object.create(parentScope);
  Object.defineProperties(mergedScope, Object.getOwnPropertyDescriptors(data));
  // 子节点可以改变父节点的值
  const reactiveProxy = reactive(
    new Proxy(mergedScope, {
      set(target, key, value, receiver) {
        if (receiver === reactiveProxy && !target.hasOwnProperty(value)) {
          return Reflect.set(parentScope, key, value);
        }
        return Reflect.set(target, key, value, receiver);
      },
    })
  );

  return {
    ...ctx,
    scope: reactiveProxy,
  };
};

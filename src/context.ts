import { reactive, effect } from "@vue/reactivity";

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

// 生成子作用域或者说子上下文
export const createScopedContext = (ctx: Context, data = {}) => {
  const parentScope = ctx.scope;
  const mergedScope = Object.create(parentScope);
  Object.defineProperties(mergedScope, Object.getOwnPropertyDescriptors(data));

  const reactiveProxy = reactive(
    new Proxy(mergedScope, {
      set(target, key, value, receiver) {
        // 子节点可以改变父节点的值
        if (receiver === reactiveProxy && !target.hasOwnProperty(key)) {
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

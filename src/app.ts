import { createContext } from "./context";
import { isString } from "./utils";
import { Block } from "./block";
import { reactive } from "@vue/reactivity";

// 程序入口，返回包含mount的对象
export const createApp = (initialData?: any) => {
  // 创建上下文
  const ctx = createContext();

  // 如果初始化传入了值，就把它包装成响应式对象
  if (initialData) {
    ctx.scope = reactive(initialData);
  }

  let rootBlocks: Block[];

  return {
    // 挂载函数，这里只实现传入selector的挂在方式
    mount(el?: string | Element | null) {
      if (isString(el)) {
        el = document.querySelector(el as string);
      }

      let roots: Element[];

      roots = [el as Element];
      // 把函数的处理逻辑防盗block里
      rootBlocks = roots.map((el) => new Block(el, ctx, true));

      return this;
    },
  };
};

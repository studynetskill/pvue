export const isString = (string: any): boolean => {
  return typeof string === "string";
};

export const isObject = (obj: any): boolean => {
  return typeof obj === "object" && obj !== null;
};

// 查看是否有相应的v-xxx等指令，如果有就返回它的值，并移除html上的指令
export const checkAttr = (el: Element, name: string): string | null => {
  let val = el.getAttribute(name);
  if (val !== null) {
    el.removeAttribute(name);
  }

  return val;
};

// 监听器封装，通过event的不同值来添加不同的监听事件
export const listen = (
  el: Node,
  event: string,
  handler: EventListener,
  options?: any
) => el.addEventListener(event, handler, options);

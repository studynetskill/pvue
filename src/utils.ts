export const isString = (val: any): val is string => {
  return typeof val === "string";
};

export const isNumber = (val: any): val is number => {
  return typeof val === "number";
};

export const isObject = (val: any): val is Record<any, any> => {
  return typeof val === "object" && val !== null;
};

export const isArray = (val: any): val is any[] => {
  return typeof val === "object" && val !== null;
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

import { Directive } from ".";
import { isObject } from "../utils";

export const text: Directive = ({ el, get, effect }): void => {
  effect(() => {
    el.textContent = toDisplayString(get());
  });
};
// 根据value的值来显示文本
export const toDisplayString = (value: any) =>
  value === null
    ? ""
    : isObject(value)
    ? JSON.stringify(value, null, 2)
    : String(value);

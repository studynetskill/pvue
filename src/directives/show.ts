import { Directive } from ".";

export const show: Directive<HTMLElement> = ({ el, get, effect }) => {
  // 保存初始值
  const initialDisplay = el.style.display;
  effect(() => (el.style.display = get() ? initialDisplay : "none"));
};

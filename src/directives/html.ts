import { Directive } from ".";

export const html: Directive = ({ el, get, effect }) => {
  // 直接赋值innerHTML
  effect(() => (el.innerHTML = get()));
};

import { Context } from "../context";
import { effect } from "@vue/reactivity";
import { on } from "./on";
import { show } from "./show";
import { text } from "./text";
import { html } from "./html";

// 定义接口
export interface Directive<T = Element> {
  (ctx: DirectiveContext<T>): (() => void) | void;
}

export interface DirectiveContext<T = Element> {
  el: T;
  get: (exp?: string) => any;
  effect: typeof effect;
  exp: string;
  arg?: string;
  modifiers?: Record<string, true>;
  ctx: Context;
}

export const builtInDirectives: Record<string, Directive<any>> = {
  on,
  show,
  text,
  html,
};

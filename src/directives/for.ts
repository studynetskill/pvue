import { Context, createScopedContext } from "../context";
import { effect } from "@vue/reactivity";
import { evaluate } from "../eval";
import { isArray, isNumber, isObject } from "../utils";
import { Block } from "../block";

// 获取v-for="item in list"的item和list
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
// const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
// const stripParensRE = /^\(|\)$/g;
// const destructureRE = /^[{[]\s*((?:[\w_$]+\s*,?\s*)+)[\]}]$/;

type KeyToIndexMap = Map<any, number>;

export const _for = (el: Element, exp: string, ctx: Context) => {
  const inMath = exp.match(forAliasRE);
  if (!inMath) {
    console.warn(`invalid v-for expression: ${exp}`);
    return;
  }

  const nextNode = el.nextSibling;
  const parent = el.parentElement!;
  const anchor = new Text("");
  parent.insertBefore(anchor, el);
  parent.removeChild(el);

  const sourceExp = inMath[2].trim();

  const valueExp = inMath[1].trim();

  let keyAttr = "key";
  let keyExp =
    el.getAttribute(keyAttr) ||
    el.getAttribute((keyAttr = ":key")) ||
    el.getAttribute((keyAttr = "v-bind:key"));
  if (keyExp) {
    el.removeAttribute(keyExp);
    if (keyAttr === "key") keyExp = JSON.stringify(keyExp);
  }

  const createChildContexts = (source: unknown): [Context[], KeyToIndexMap] => {
    const map: KeyToIndexMap = new Map();
    const ctxs: Context[] = [];

    if (isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        ctxs.push(createChildContext(map, source[i], i));
      }
    } else if (isNumber(source)) {
      for (let i = 0; i < source; i++) {
        ctxs.push(createChildContext(map, i + 1, i));
      }
    } else if (isObject(source)) {
      let i = 0;
      for (const key in source) {
        ctxs.push(createChildContext(map, source[key], i++, key));
      }
    }

    return [ctxs, map];
  };

  const createChildContext = (
    map: KeyToIndexMap,
    value: any,
    index: number,
    objKey?: string
  ): Context => {
    const data: any = {};
    data[valueExp] = value;

    const childCtx = createScopedContext(ctx, data);
    const key = keyExp ? evaluate(childCtx.scope, keyExp) : index;
    childCtx.key = key;
    map.set(key, index);
    return childCtx;
  };

  const mountBlock = (ctx: Context, anchor: Node) => {
    const block = new Block(el, ctx);
    block.key = ctx.key;
    block.insert(parent, anchor);
    return block;
  };

  let mounted = false;
  let childCtxs: Context[];
  let blocks: Block[];
  let keyToIndexMap: KeyToIndexMap;

  effect(() => {
    const source = evaluate(ctx.scope, sourceExp);
    // const prevKeyToIndexMap = keyToIndexMap;
    [childCtxs, keyToIndexMap] = createChildContexts(source);

    if (!mounted) {
      blocks = childCtxs.map((s) => mountBlock(s, anchor));
      mounted = true;
    }
  });

  return nextNode;
};

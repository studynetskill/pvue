import { createScopedContext, Context } from "./context";
import { checkAttr } from "./utils";
import { evaluate } from "./eval";
import { text } from "./directives/text";
import { _if } from "./directives/if";
import { _for } from "./directives/for";
import { on } from "./directives/on";
import { builtInDirectives, Directive } from "./directives";

const dirRE = /^(?:v-|:|@)/;
const interpolationRE = /\{\{([^]+?)\}\}/g;

export const walk = (node: Node, ctx: Context): ChildNode | null | void => {
  // 通过type来处理不同的节点类型
  const type = node.nodeType;

  // 处理元素类型，如div等
  if (type === 1) {
    const el = node as Element;
    let exp: string | null;

    // 删除v-cloak属性
    checkAttr(el, "v-cloak");

    // 处理v-if
    if ((exp = checkAttr(el, "v-if"))) {
      let res = _if(el, exp, ctx);

      return res;
    }

    // 处理v-for
    if ((exp = checkAttr(el, "v-for"))) {
      let res = _for(el, exp, ctx);

      return res;
    }

    // 如果v-scope 有属性就把它挂在ctx上
    if ((exp = checkAttr(el, "v-scope")) || exp === "") {
      // console.log(ctx.scope,exp)
      const scope = exp ? evaluate(ctx.scope, exp) : {};
      ctx = createScopedContext(ctx, scope);
    }

    // 其他指令  ...el.attributes为什么报错呢？
    for (const { name, value } of [...el.attributes]) {
      if (dirRE.test(name)) {
        processDirective(el, name, value, ctx);
      }
    }

    walkChildren(el, ctx);
  } else if (type === 3) {
    // 处理文本节点，{{foo}}
    const data = (node as Text).data;
    if (data.includes("{{")) {
      let segments: string[] = [];
      let match;
      let lastIndex = 0;

      // 把文本全部放在数组里保存起来
      while ((match = interpolationRE.exec(data))) {
        const leading = data.slice(lastIndex, match.index);
        if (leading) {
          segments.push(JSON.stringify(leading));
        }
        // segments.push(`$s(${match[1]})`)
        segments.push(`(${match[1]})`);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < data.length) {
        segments.push(JSON.stringify(data.slice(lastIndex)));
      }

      applyDirective(node, text, segments.join("+"), ctx);
    }
  } else if (type === 11) {
    // 处理fragment文档碎片，实际并没有写处理函数，这里只是搭个架子
    walkChildren(node as DocumentFragment, ctx);
  }
};

// 遍历子节点
const walkChildren = (el: Element | DocumentFragment, ctx: Context): void => {
  let child = el.firstChild;
  while (child) {
    child = walk(child, ctx) || child.nextSibling;
  }
};
// 执行指令dir
const applyDirective = (
  el: Node,
  dir: Directive<any>,
  exp: string,
  ctx: Context,
  arg?: string
) => {
  const get = (e = exp) => evaluate(ctx.scope, e, el);

  // 执行指令，并收集返回值，返回值可以在需要时做清理工作
  const cleanup = dir({
    el,
    get,
    effect: ctx.effect,
    ctx,
    exp,
    arg,
  });

  // 仅收集，非核心不处理
  if (cleanup) {
    ctx.cleanups.push(cleanup);
  }
};

// 统一处理部分指令
const processDirective = (
  el: Element,
  raw: string,
  exp: string,
  ctx: Context
) => {
  let dir;
  let arg: string | undefined;
  // 处理@click等@开头的事件
  if (raw.startsWith("@")) {
    dir = on;
    arg = raw.slice(1);
  } else {
    // 处理show test html
    const dirName = raw.slice(2);
    dir = builtInDirectives[dirName];
    arg = exp;
  }

  if (dir) {
    el.removeAttribute(raw);
    applyDirective(el, dir, exp, ctx, arg);
  }
};

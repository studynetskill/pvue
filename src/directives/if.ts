import { Context } from "../context";
import { Block } from "../block";
import { effect } from "@vue/reactivity";
import { evaluate } from "../eval";
import { checkAttr } from "../utils";

interface Branch {
  el: Element;
  exp?: string | null;
}

export const _if = (el: Element, exp: string, ctx: Context) => {
  const parent = el.parentElement!;
  // 插入一个<!-- v-if --> 作为锚点，后面if的语句将插入这个前面
  const anchor = new Comment("v-if");
  parent.insertBefore(anchor, el);
  let branches: Branch[];
  // 收集所有的分支和条件到一个数组中
  branches = [
    {
      el,
      exp,
    },
  ];

  let elseEl: Element;
  let elseExp: string | null;
  // 收集v-else v-else-if 到分支数组中储存起来,并删除原来的分支节点
  while ((elseEl = el.nextElementSibling!)) {
    // console.log('if', elseEl)
    elseExp = null;
    if (
      checkAttr(elseEl, "v-else") === "" ||
      (elseExp = checkAttr(elseEl, "v-else-if"))
    ) {
      branches.push({
        el: elseEl,
        exp: elseExp,
      });
      parent.removeChild(elseEl);
    } else {
      break;
    }
  }

  const nextNode = el.nextSibling;
  parent.removeChild(el);

  let block: Block | undefined;
  // 用来记录当前的活动节点是哪个
  let activeBranchIndex = -1;
  // 删除当前节点
  const removeActiveBlock = () => {
    if (block) {
      parent.insertBefore(anchor, block.el);
      block.remove();
      block = undefined;
    }
  };
  // 每次v-if的值改变都会触发这个更新
  effect(() => {
    // 遍历分支数组，如果值已经改变，就删除当前节点，并从数组中找到exp值为真的节点插入锚点之前
    for (let i = 0; i < branches.length; i++) {
      const { exp, el } = branches[i];
      if (!exp || evaluate(ctx.scope, exp, el)) {
        if (i !== activeBranchIndex) {
          removeActiveBlock();
          block = new Block(el, ctx);
          block.insert(parent, anchor);
          parent.removeChild(anchor);
          activeBranchIndex = i;
        }
        return;
      }
    }
    // 如果所有的值都为假，就删除当前节点
    activeBranchIndex = -1;
    removeActiveBlock();
  });

  return nextNode;
};

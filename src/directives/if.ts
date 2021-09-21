import { Context } from "../context";
import { Block } from "../block";
import { effect } from "../../reactivity/effect";
import { evaluate } from "../eval";
import { checkAttr } from "../utils";

interface Branch {
  el: Element;
  exp?: string | null;
}

export const _if = (el: Element, exp: string, ctx: Context) => {
  const parent = el.parentElement!;
  const anchor = new Comment("v-if");
  parent.insertBefore(anchor, el);
  let branches: Branch[];

  branches = [
    {
      el,
      exp,
    },
  ];

  let elseEl: Element;
  let elseExp: string | null;

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
  let activeBranchIndex = -1;

  const removeActiveBlock = () => {
    if (block) {
      parent.insertBefore(anchor, block.el);
      block.remove();
      block = undefined;
    }
  };

  effect(() => {
    for (let i = 0; i < branches.length; i++) {
      const { exp, el } = branches[i];
      //  console.log('effect', exp,el)
      if (!exp || evaluate(ctx.scope, exp, el)) {
        if (i !== activeBranchIndex) {
          // console.log('beforechange', el)
          removeActiveBlock();
          block = new Block(el, ctx);
          block.insert(parent, anchor);
          parent.removeChild(anchor);
          activeBranchIndex = i;
        }
        //  console.log('before', el)
        return;
      }
    }

    activeBranchIndex = -1;
    removeActiveBlock();
  });
  //  console.log('if', nextNode)
  return nextNode;
};

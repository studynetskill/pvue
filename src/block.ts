import { Context } from "./context";
import { walk } from "./walk";

// dom的操作封装
export class Block {
  template: Element | DocumentFragment;
  ctx: Context;
  start?: Text;
  end?: Text;

  constructor(template: Element, ctx: Context, isRoot = false) {
    // 只处理Element节点
    if (isRoot) {
      this.template = template;
    } else {
      this.template = template.cloneNode(true) as Element;
    }
    this.ctx = ctx;
    // 遍历所有节点
    walk(this.template, this.ctx);
  }

  get el() {
    return this.start || this.template;
  }

  insert(parent: Element, anchor: Node | null = null) {
    parent.insertBefore(this.template, anchor);
  }

  remove() {
    this.template.parentElement!.removeChild(this.template);
  }
}

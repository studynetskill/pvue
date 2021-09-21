import { listen } from "../utils";
import { Directive } from ".";

const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;
// 判断是否是一个函数名

export const on: Directive = ({ el, get, exp, arg }) => {
  if (!arg) {
    console.warn("arg is undefined");
    return;
  }

  // 根据是否是一个函数名返回对应格式的监听器
  let handler = simplePathRE.test(exp)
    ? get(`(e => ${exp}(e))`) // e=>fun(e)
    : get(`($event => { ${exp} })`); // $event => console.log(1)

  listen(el, arg, handler);
};

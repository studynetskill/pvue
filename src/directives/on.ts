import { listen } from "../utils.ts";

const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;
// 判断是否是一个函数名

export const on = ({ el, get, exp, arg }) => {
  let handler = simplePathRE.test(exp)
    ? get(`(e => ${exp}(e))`)
    : get(`($event => { ${exp} })`);

  console.log(handler);
  listen(el, arg, handler);
};

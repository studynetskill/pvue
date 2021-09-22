const evalCache: Record<string, Function> = Object.create(null);

// 通过new Function返回html模板上的值，例如字符串的{foo:'bar'} 变成对象、返回函数等
export const evaluate = (scope: any, exp: string, el?: Node) =>
  execute(scope, `return(${exp})`, el);

const execute = (scope: any, exp: string, el?: Node) => {
  // 缓存
  const fn = evalCache[exp] || (evalCache[exp] = toFunction(exp));

  try {
    return fn(scope, el);
  } catch (e) {
    console.error(e);
  }
};

const toFunction = (exp: string): Function => {
  try {
    // 通过with改变上下文
    return new Function("$data", "$el", `with($data){${exp}}`);
  } catch (e) {
    console.error(e);
    return () => {};
  }
};

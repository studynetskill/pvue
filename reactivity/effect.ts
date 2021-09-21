let activeEffect = undefined;
let effectStack = [];

let targetMaps = new WeakMap();

function getDep(target, key) {
  let map;
  if (!(map = targetMaps.get(target))) {
    map = new Map();
    targetMaps.set(target, map);
  }

  let dep;
  if (!(dep = map.get(key))) {
    dep = new Set();
    map.set(key, dep);
  }

  return dep;
}

// 闭包可以触发多次effect
function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };

  return effectFn();
}

function track(target, key) {
  if (activeEffect) {
    let dep = getDep(target, key);
    dep.add(activeEffect);
  }
}

function trigger(target, key) {
  let dep = getDep(target, key);
  if (dep) {
    dep.forEach((effect) => {
      effect();
    });
  }
}

export { effect, track, trigger };

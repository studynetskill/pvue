// const { isObject, hasChanged, isArray } =require( '../utils/index.js');

import { track, trigger, effect } from "./effect.ts";

const reactiveMap = new WeakMap();
const reactiveHandler = {
  get(target, key, receiver) {
    // console.log("get", key);
    track(target, key);
    return Reflect.get(target, key, receiver);
  },

  /*
  get(target, key, receiver) {
      if (key === '__isReactive') {
        return true;
      }
      track(target, key);
      const res = Reflect.get(target, key, receiver);
      return isObject(res) ? reactive(res) : res;
    },
    
    */

  set(target, key, val, receiver) {
    let oldVal = target[key];
    let res = Reflect.set(target, key, val, receiver);
    if (oldVal !== val) {
      //    console.log("set", target, key, val);
      trigger(target, key);
    }
    return res;
  },

  /*
  set(target, key, value, receiver) {
    // console.log('set',key,value)
      const oldValue = target[key];
      let oldLength = target.length;
      const res = Reflect.set(target, key, value, receiver);
      if (hasChanged(value, oldValue)) {
        trigger(target, key);
        /*
        if (isArray(target) && target.length !== oldLength) {
          console.log('set length')
          trigger(target, 'length');
        }
        
      }
      return res;
    },
*/
  has(target, key, receiver) {
    track(target, key);
    return Reflect.has(target, key, receiver);
  },
};

function reactive(target) {
  /*
  if (!isObject(target)) {
    return target;
  }
  if (isReactive(target)) {
    return target;
  }
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }
  */
  const proxy = new Proxy(target, reactiveHandler);
  //  reactiveMap.set(target, proxy);
  return proxy;
}

function ref(raw) {
  const r = {
    get value() {
      track(r, "value");
      return raw;
    },
    set value(newVal) {
      trigger(r, "value");
      raw = newVal;
    },
  };

  return r;
}

function computed(fn) {
  let res = ref(0);
  effect(() => {
    res.value = fn();
  });

  return res;
}

function isReactive(target) {
  return !!(target && target.__isReactive);
}

function test() {
  let obj = reactive([1, 2, 3]);
  let flag = false;
  effect(() => {
    console.log("effect");
    for (let i = 0; i < obj.length; i++) {
      if (!flag) {
        console.log(obj[i]);
        flag = true;
        return;
      } else {
        console.log("else");
        console.log(obj[i]);
      }
    }
  });
  console.log("arr[2]");
  obj[0] = 5;
  obj[2] = 6;
}
// test()
export { reactive, ref, computed };

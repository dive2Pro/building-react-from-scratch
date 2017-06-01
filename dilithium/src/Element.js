'use strict';

/**
 *
 *  这个方法调用的非常频繁,组件的变动依赖次方法
 *
 * @param {*} type 实际的组件,这里是继承了 Dilithium.Component的类
 * @param {*} config  传递的 props
 * @param {*} children  顾名思义:
 *                  <CounterButton title="Hello React Rally!">
 *      =>               lalalalalalal{' '}
 *                     </CounterButton>,
 */
function createElement(type, config, children) {
  // Clone the passed in config (props). In React we move some special
  // props off of this object (keys, refs).
  let props = Object.assign({}, config);

  // Build props.children. We'll make it an array if we have more than 1.
  // 确定children的个数, 多于1个则是数组结构
  let childCount = arguments.length - 2;
  if (childCount === 1) {
    props.children = children;
  } else if (childCount > 1) {
    props.children = Array.prototype.slice.call(arguments, 2);
  }

  // React Features not supported:
  // - keys
  // - refs
  // - defaultProps (usually set here)
  // 所以就得到了
  /**
   *  {
   *    type:'div', 如果是Component,则是Component的名字
   *    children: children指的是 <Comp> 这里的组件 </Comp>, 而不是 render 方法中的组件
   * }
   */
  return {
    type,
    props,
  };
}

function isValidElement(element) {
  let typeofElement = typeof element;
  let typeofType = element.type && typeof element.type;
  return (
    typeofElement === 'string' ||
    typeofElement === 'number' ||
    typeofType === 'string' ||
    (typeofType === 'function' && element.type.isDilithiumClass)
  );
}

module.exports = {
  createElement,
  isValidElement,
};

'use strict';

const Element = require('./Element');
const assert = require('./assert');
const HostComponent = require('./HostComponent');

function instantiateComponent(element) {
  assert(Element.isValidElement(element));

  let type = element.type;

  let wrapperInstance;
  if (typeof type === 'string') {
    /**
     * 形如 <div>Hello World!</div>这样的对象,transform之后的element
     */
    wrapperInstance = HostComponent.construct(element);
  } else if (typeof type === 'function') {
    // 这里是一个继承了 Component的类, 所以直接实例化 constructor
    wrapperInstance = new element.type(element.props);
    wrapperInstance._construct(element);
  } else if (typeof element === 'string' || typeof element === 'number') {
    // 字符串
    wrapperInstance = HostComponent.constructTextComponent(element);
  }

  return wrapperInstance;

  // If we have a string type, create a wrapper
  // Otherwise we have a Component
  // return new element.type(element.props)
}

module.exports = instantiateComponent;

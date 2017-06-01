'use strict';

const assert = require('./assert');

let implementation;

function construct(element) {
  assert(implementation);

  return new implementation(element);
}

function constructTextComponent(element) {
  // Create wrapper element. It will just be a span.
  return construct({
    type: 'span',
    props: {
      children: element,
    },
  });
}
// 这里的实现是 DOMComponentWrapper

function inject(impl) {
  implementation = impl;
}

module.exports = {
  inject,
  construct,
  constructTextComponent,
};

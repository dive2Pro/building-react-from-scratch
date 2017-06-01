"use strict";

const Element = require("./Element");
const assert = require("./assert");
const DOM = require("./DOM");
const shouldUpdateComponent = require("./shouldUpdateComponent");
const instantiateComponent = require("./instantiateComponent");
const Reconciler = require("./Reconciler");

const ROOT_KEY = "dlthmRootId";
let rootID = 1;

// Used to track root instances.
const instancesByRootID = {};

function isRoot(node) {
  if (node.dataset[ROOT_KEY]) {
    return true;
  }
  return false;
}

/**
 * todo 这里的element是什么?
 * 这里使用了 virtual dom?
 *                    webpack中
 *                   `'transform-react-jsx', {pragma: 'Dilithium.createElement'}`
 *                    这里的 pragma 意味着什么?
 *  如果是Element中的方法,那么这个和默认的有什么区别?
 *
 * @param element
 * @param node
 */
function render(element, node) {
  assert(Element.isValidElement(element));

  // First check if we've already rendered into this node.
  // 第一步先检查是否已经渲染了这个node
  // If so, we'll be doing an update.
  // 已检查的话, 就直线更新操作
  // Otherwise we'll assume this is an initial render.
  // 不然就假设这是一个初始化渲染
  if (isRoot(node)) {
    update(element, node);
  } else {
    mount(element, node);
  }
}

function mount(element, node) {
  // Mark this node as a root.
  // 标记这个node为根
  node.dataset[ROOT_KEY] = rootID;

  // Create the internal instance. We're assuming for now that we only have
  // 新建element的内部实例. 现时我们假设只有
  // `Component`s being rendered at the root.
  // `Component` 是被渲染在根部
  let component = instantiateComponent(element);

  instancesByRootID[rootID] = component;

  // This will return a DOM node. React does more work here to determine if we're remounting
  // 这会返回一个DOM Node. React 在这里做了很多的工作去确定 当我们 remounting 服务端的内容时
  // server-rendered content.
  //
  let renderedNode = Reconciler.mountComponent(component, node);

  // Empty out `node` so we can put it under our control.
  // 置空 `node` , 使其更容易控制
  DOM.empty(node);
  //
  DOM.appendChild(node, renderedNode);

  // Incrememnt rootID so we can track appropriately.
  rootID++;
}

function update(element, node) {
  // Ensure we have a valid root node
  assert(node && isRoot(node));

  // Find the internal instance and update it
  let id = node.dataset[ROOT_KEY];

  let instance = instancesByRootID[id];

  if (shouldUpdateComponent(instance, element)) {
    // TODO: do the update
  } else {
    // Unmount and then mount the new one
    unmountComponentAtNode(node);
    mount(element, node);
  }

  // TODO: update
}

function unmountComponentAtNode(node) {
  // Ensure we have a valid root node
  assert(node && isRoot(node));

  let id = node.dataset[ROOT_KEY];

  // In React we would do a batch unmount operation. This would in turn call
  // componentWillUnmount for each instance. We aren't going to support that,
  // so we can just delete the top level instance and let everything get garbage
  // collected.
  let instance = instancesByRootID[id];
  Reconciler.unmountComponent(instance);

  delete instancesByRootID[id];

  // Reset the DOM node
  DOM.empty(node);
  delete node.dataset[ROOT_KEY];
}

module.exports = {
  render,
  unmountComponentAtNode
};

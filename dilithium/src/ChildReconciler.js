'use strict';

const instantiateComponent = require('./instantiateComponent');
const traverseAllChildren = require('./traverseAllChildren');
const shouldUpdateComponent = require('./shouldUpdateComponent');

const Reconciler = require('./Reconciler');

// This *right here* is why keys are critical to preventing reordering issues.
// 这里就是决定 为什么 keys 是 阻止重新排序的关键所在
// React will reuse an existing instance if there is one in this subtree.
// React 会返回子树中一个已经存在的实例
// The instance identity here is determined by the generated key based on
// 确定这个实例的身份是由依赖于其在子树中的深度,父组件,以及 React的props中的 key={}
// depth in the tree, parent, and (in React) the key={} prop.
// 生成的
function instantiateChild(childInstances, child, name) {
  let isUnique = childInstances[name] === undefined;

  if (isUnique) {
    childInstances[name] = instantiateComponent(child);
  }
}

function instantiateChildren(children) {
  // We store the child instances here, which are in turn used passed to
  // instantiateChild. We'll store this object for reuse when doing updates.
  let childInstances = {};

  traverseAllChildren(children, instantiateChild, childInstances);

  return childInstances;
}

function updateChildren(
  prevChildren, // Instances, as created above
  nextChildren, // Actually elements
  mountImages,
  removedChildren,
) {
  // Just make our code a little bit cleaner so we don't have to do null checks.
  // React skips this to avoid extraneous objects.
  prevChildren = prevChildren || {};

  // Loop over our new children and determine what is being updated, removed,
  // and created.
  Object.keys(nextChildren).forEach(childKey => {
    let prevChild = prevChildren[childKey];
    let prevElement = prevChild && prevChild._currentElement;
    let nextElement = nextChildren[childKey];

    // Update
    if (prevChild && shouldUpdateComponent(prevElement, nextElement)) {
      // Update the existing child with the reconciler. This will recurse
      // through that component's subtree.
      Reconciler.receiveComponent(prevChild, nextElement);
      // 也就是说将生成的和现有的进行比较后,更新现有的,将之前的抛弃掉,省却mound新的步骤
      // We no longer need the new instance, so replace it with the old one.
      nextChildren[childKey] = prevChild;
    } else {
      // Otherwise
      // Remove the old child. We're replacing.
      if (prevChild) {
        // TODO: make this work for composites
        removedChildren[childKey] = prevChild._domNode;
        Reconciler.unmountComponent(prevChild);
      }

      // Instantiate the new child.
      let nextChild = instantiateComponent(nextElement);
      nextChildren[childKey] = nextChild;

      // React does this here so that refs resolve in the correct order.
      mountImages.push(Reconciler.mountComponent(nextChild));
    }
  });

  // Last but not least, remove the old children which no longer have any presense.
  Object.keys(prevChildren).forEach(childKey => {
    // debugger;
    if (!nextChildren.hasOwnProperty(childKey)) {
      let prevChild = prevChildren[childKey];
      removedChildren[childKey] = prevChild._domNode;
      Reconciler.unmountComponent(prevChild);
    }
  });
}

function unmountChildren(renderedChildren) {
  if (!renderedChildren) {
    return;
  }
  Object.keys(renderedChildren).forEach(childKey => {
    Reconciler.unmountComponent(renderedChildren[childKey]);
  });
}

module.exports = {
  instantiateChildren,
  updateChildren,
  unmountChildren,
};

'use strict';

const Reconciler = require('./Reconciler');
const UpdateQueue = require('./UpdateQueue');
const assert = require('./assert');
const instantiateComponent = require('./instantiateComponent');
const DOM = require('./DOM');
const shouldUpdateComponent = require('./shouldUpdateComponent');

class Component {
  constructor(props) {
    this.props = props;
    this._currentElement = null;
    this._pendingState = null;
    this._renderedComponent = null;
    this._renderedNode = null;

    assert(typeof this.render === 'function');
  }

  setState(partialState) {
    // React uses a queue here to allow batching.
    this._pendingState = partialState;
    UpdateQueue.enqueueSetState(this, partialState);
  }

  // We have a helper method here to avoid having a wrapper instance.
  // React does that - it's a smarter implementation and hides required helpers, internal data.
  // That also allows renderers to have their own implementation specific wrappers.
  // This ensures that React.Component is available across platforms.
  _construct(element) {
    this._currentElement = element;
  }

  mountComponent() {
    // This is where the magic starts to happen. We call the render method to
    // get our actual rendered element. Note: since we (and React) don't support
    // Arrays or other types, we can safely assume we have an element.
    // 这里要注意的是  render 方法中的组件已经被转化为 {props,type}这样的形式了
    let renderedElement = this.render();

    // TODO: lifecycle methods: compnentWillMount

    // Actually instantiate the rendered element.
    let renderedComponent = instantiateComponent(renderedElement);

    this._renderedComponent = renderedComponent;

    // Generate markup for the child & effectively recurse!
    // 通过递归生成子组件
    // Since CompositeComponents instances don't have a DOM representation of

    // 所以子组件的初始化在父组件 componentWillMount 方法之后
    // their own, this markup will actually be the DOM nodes (or Native Views)
    let markup = Reconciler.mountComponent(renderedComponent);

    // React doesn't store this reference, instead working through a shared
    // interface for storing host nodes, allowing this to work across platforms.
    // We'll take a shortcut.
    // this._renderedNode = markup;

    return markup;
  }

  receiveComponent(nextElement) {
    this.updateComponent(this._currentElement, nextElement);
  }

  updateComponent(prevElement, nextElement) {
    // This is a props updates due to a re-render from the parent.
    if (prevElement !== nextElement) {
      // React would call componentWillReceiveProps here
    }

    // React would call shouldComponentUpdate here and short circuit.
    // let shouldUpdate = this.shouldComponentUpdate(nextElement.props, this._pendingState)

    // React would call componentWillUpdate here

    // Update instance data
    this._currentElement = nextElement;
    this.props = nextElement.props;
    this.state = this._pendingState;
    this._pendingState = null;

    // React has a wrapper instance, which complicates the logic. We'll do
    // something simplified here.
    let prevRenderedElement = this._renderedComponent._currentElement;
    // 重新执行 render , 如果state有作为props传递给其他组件,那么它就会得到在这里新的props
    let nextRenderedElement = this.render();

    // We check if we're going to update the existing rendered element or if
    // we need to blow away the child tree and start over.
    if (shouldUpdateComponent(prevRenderedElement, nextRenderedElement)) {
      Reconciler.receiveComponent(this._renderedComponent, nextRenderedElement);
    } else {
      // Blow away and start over - it's similar to mounting.
      // We don't actually need this logic for our example but we'll write it.
      Reconciler.unmountComponent(this._renderedComponent);
      let nextRenderedComponent = instantiateComponent(nextRenderedElement);
      let nextMarkup = Reconciler.mountComponent(nextRenderedComponent);
      // React defers to the host environment to keep this implementation agnostic.
      // We'll just call directly.
      DOM.replaceNode(this._renderedComponent._domNode, nextMarkup);
      this._renderedComponent = nextRenderedComponent;
    }
  }

  performUpdateIfNecessary() {
    // React handles batching so could potentially have to handle a case of a
    // state update or a new element being rendered. We just need to handle
    // state updates.
    this.updateComponent(this._currentElement, this._currentElement);
  }

  unmountComponent() {
    if (!this._renderedComponent) {
      return;
    }

    // TODO: call componentWillUnmount

    Reconciler.unmountComponent(this._renderedComponent);

    // TODO: reset fields so everything can get GCed appropriately
  }
}

// Mark this class so we can easily differentiate from classes that don't extend
// this base class.
Component.isDilithiumClass = true;

module.exports = Component;

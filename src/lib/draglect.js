import keys from 'ramda/src/keys'
import forEachObjIndexed from 'ramda/src/forEachObjIndexed'
import isNil from 'ramda/src/isNil'
import always from 'ramda/src/always'
import map from 'ramda/src/map'
import __ from 'ramda/src/__'
import reject from 'ramda/src/reject'
import compose from 'ramda/src/compose'
import equals from 'ramda/src/equals'
import cond from 'ramda/src/cond'
import is from 'ramda/src/is'
import pair from 'ramda/src/pair'
import fromPairs from 'ramda/src/fromPairs'
import append from 'ramda/src/append'

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

/*
 *
 *
 *
 *
 * ~~~ Selection
 *
 */
class Selection extends Component {

  constructor (props) {
    super(props)
    this.state = {
      mouseDown    : false,
      startPoint   : null,
      endPoint     : null,
      selectionBox : null,
      selectedItems: {},
      appendMode   : false
    }
    this.subscribed = {}
  }

  componentWillMount = () => this.selectedChildren = {}

  componentDidMount = () => this._selects(this.props.selects)

  componentWillReceiveProps = nextProps => {
    if (!nextProps.enabled) this.setState({selectedItems: {}})
    if (this.props.selects !== nextProps.selects) this._selects(nextProps.selects)
  }

  componentDidUpdate = () => {
    if (this.state.mouseDown && !isNil(this.state.selectionBox)) {
      this._updateCollidingChildren(this.state.selectionBox)
    }
  }

  _selects = x =>
    cond([
      [equals(true), this.selectAll],
      [equals(false), this.clearSelection],
      [is(Array), this.selectItems]
    ])(x)

  _onMouseDown = e => {
    if (!this.props.enabled || e.button === 2 || e.nativeEvent.which === 2) return
    const mouseDown = true
    const appendMode = e.ctrlKey || e.altKey || e.shiftKey
    const startPoint = {x: e.pageX, y: e.pageY}
    const endPoint = {x: e.pageX, y: e.pageY}
    const selectionBox = this._calculateSelectionBox(startPoint, endPoint)
    this.setState({mouseDown, appendMode, startPoint, endPoint, selectionBox})
    window.document.addEventListener('mousemove', this._onMouseMove)
    window.document.addEventListener('mouseup', this._onMouseUp)
  }

  _onMouseUp = e => {
    window.document.removeEventListener('mousemove', this._onMouseMove)
    window.document.removeEventListener('mouseup', this._onMouseUp)
    this.setState({
      mouseDown   : false,
      startPoint  : null,
      endPoint    : null,
      selectionBox: null,
      appendMode  : false
    })
    this.props.onSelectionChange.call(null, compose(reject(equals('selectionBox')), keys)(this.selectedChildren))
  }

  _onMouseMove = e => {
    e.preventDefault()
    if (this.state.mouseDown) {
      const endPoint = {
        x: e.pageX,
        y: e.pageY
      }
      this.setState({
        endPoint,
        selectionBox: this._calculateSelectionBox(this.state.startPoint, endPoint)
      })
    }
  }

  _boxIntersects = (boxA, boxB) =>
  this.props.sensibility < this.state.selectionBox.width * this.state.selectionBox.height &&
  boxA.left <= boxB.left + boxB.width &&
  boxA.left + boxA.width >= boxB.left &&
  boxA.top <= boxB.top + boxB.height &&
  boxA.top + boxA.height >= boxB.top

  _updateCollidingChildren = (selectionBox) => {
    let tmpNode = null
    let tmpBox = null
    forEachObjIndexed((ref, key) => {
      if (key !== 'selectionBox') {
        tmpNode = ReactDOM.findDOMNode(ref)
        tmpBox = {
          top   : tmpNode.offsetTop,
          left  : tmpNode.offsetLeft,
          width : tmpNode.clientWidth,
          height: tmpNode.clientHeight
        }
        if (this._boxIntersects(selectionBox, tmpBox)) {
          this.selectedChildren[key] = true
        } else if (!this.state.appendMode) {
          delete this.selectedChildren[key]
        }
      }
    }, this.subscribed)
    this._update()
  }

  _update = () =>
    forEachObjIndexed((ref, key) => {
      ref.setState({isSelected: !!this.selectedChildren[key]})
    }, this.subscribed)

  _calculateSelectionBox = (startPoint, endPoint) => {
    const parentNode = ReactDOM.findDOMNode(this.refs.selectionBox)
    const left = Math.min(startPoint.x, endPoint.x) - parentNode.offsetLeft
    const top = Math.min(startPoint.y, endPoint.y) - parentNode.offsetTop
    const width = Math.abs(startPoint.x - endPoint.x)
    const height = Math.abs(startPoint.y - endPoint.y)
    return {left, top, width, height}
  }

  _renderSelectionBox = () =>
    !this.state.mouseDown ||
    isNil(this.state.endPoint) ||
    isNil(this.state.startPoint) ||
    this.props.sensibility > this.state.selectionBox.width * this.state.selectionBox.height
      ? null
      : <div style={{position: 'absolute', zIndex: 99, ...this.props.styleSelectionBox, ...this.state.selectionBox}} />

  _subscribe = key => ref => {
    if (ref) this.subscribed[key] = ref
  }

  render = () => {
    let {style, className, ...others} = this.props
    return (
      <div
        style={{position: 'relative', ...style}}
        className={`${className} ${this.state.mouseDown && 'dragging'}`}
        ref='selectionBox'
        onMouseDown={this._onMouseDown}
      >
        {/*{this._renderChildren()}*/}
        {this.props.children(this._subscribe)}
        {this._renderSelectionBox()}
      </div>
    )
  }

  /**
   * Manually update the selection status of an array of items
   * @param {[string]} keyArray the item's target key value
   */
  selectItems = (keyArray) => {
    this.selectedChildren = compose(fromPairs, map(pair(__, true)), append('selectionBox'))(keyArray)
    this.props.onSelectionChange.call(null, keyArray)
    this._update()
  }

  /**
   * Manually update the selection status of an item
   * @param {string} key the item's target key value
   */
  selectItem = (key) => {
    this.selectItems([key])
  }

  /**
   * Manually select all items
   */
  selectAll = () => {
    forEachObjIndexed((ref, key) => {
      this.selectedChildren[key] = true
    }, this.subscribed)
    this.props.onSelectionChange.call(null, compose(reject(equals('selectionBox')), keys)(this.selectedChildren))
    this._update()
  }

  /**
   * Manually clear selected items
   */
  clearSelection = () => {
    this.selectedChildren = {}
    this.props.onSelectionChange.call(null, [])
    this._update()
  }

}

Selection.propTypes = {
  enabled          : PropTypes.bool,
  onSelectionChange: PropTypes.func,
  selects          : PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),
  sensibility      : PropTypes.number,
  styleSelectionBox: PropTypes.object
}

Selection.defaultProps = {
  enabled          : true,
  onSelectionChange: always(undefined),
  sensibility      : -1,
  styleSelectionBox: {
    background: 'rgba(0, 162, 255, 0.4)'
  }
}

/*
 *
 *
 *
 *
 * ~~~ SelectionItem
 *
 */
class SelectionItem extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state.isSelected !== nextState.isSelected
  }

  render () {
    let {className, children, ...other} = this.props
    if (this.state.isSelected) className += ' rds-item--selected'
    return <div className={className} {...other}>{children}</div>
  }
}

/*
 *
 *
 *
 *
 * ~~~ export
 *
 */
export { Selection, SelectionItem }

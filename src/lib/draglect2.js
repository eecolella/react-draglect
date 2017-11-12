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
class Selection2 extends Component {

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
  }

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

  _onMouseMove = e => {
    const el = document.elementFromPoint(e.pageX, e.pageY);
    const endPoint = {
      x: e.pageX,
      y: e.pageY
    }
    this.setState({
      endPoint,
      selectionBox: this._calculateSelectionBox(this.state.startPoint, endPoint)
    })
  }

  _onMouseUp = e => {
    window.document.removeEventListener('mousemove', this._onMouseMove)
    window.document.removeEventListener('mouseup', this._onMouseUp)
    console.log(this.state.selectionBox)
    this.setState({
      mouseDown   : false,
      startPoint  : null,
      endPoint    : null,
      selectionBox: null,
      appendMode  : false
    })
    // this.props.onSelectionChange.call(null, compose(reject(equals('selectionBox')), keys)(this.selectedChildren))
  }

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
        {this.props.children}
        {this._renderSelectionBox()}
      </div>
    )
  }
}

Selection2.propTypes = {
  enabled          : PropTypes.bool,
  onSelectionChange: PropTypes.func,
  selects          : PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),
  sensibility      : PropTypes.number,
  styleSelectionBox: PropTypes.object
}

Selection2.defaultProps = {
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
class SelectionItem2 extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state.isSelected !== nextState.isSelected
  }

  render () {
    let {className, style, styleIfSelected, children, ...other} = this.props
    if (this.state.isSelected) style = {...style, ...styleIfSelected}
    if (this.state.isSelected) className += ' rds-item--selected'
    return <div className={className} style={style} {...other}>{children}</div>
  }
}

SelectionItem2.propTypes = {
  className      : PropTypes.string,
  style          : PropTypes.object,
  styleIfSelected: PropTypes.object
}

SelectionItem2.defaultProps = {
  className      : '',
  style          : {},
  styleIfSelected: {
    background: 'rgba(0, 162, 255, 0.4)'
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
export { Selection2, SelectionItem2 }

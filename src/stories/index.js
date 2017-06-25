import React, {Component} from 'react';

import { storiesOf } from '@storybook/react';
import { Selection, SelectionItem } from '../lib/draglect'
import * as R from 'ramda'
import './styles.css'

storiesOf('Draglect', module)
  .add('main', () =><Demo/>)

/*
 *
 *
 *
 *
 * ~~~ Demo
 *
 */
class Demo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selects: undefined,
      selected: []
    }
  }

  render () {
    return (
      <div>
        <button onClick={e => this.setState({selects: true}) }>select all:</button>
        <button onClick={e => this.setState({selects: false}) }>clear all:</button>
        <button onClick={e => this.setState({selects: ['0', '2', '4']}) }>select 1 3 5</button>
        <div style={{margin: 20, height:50}}>{this.state.selected.join(' ')}</div>
        <Selection selects={this.state.selects} onSelectionChange={x => { console.log(x); this.setState({selected: x})}}>
          {(subscribeSelection) => (
            <div>
              <SelectionItem className="item" key="asdasd" ref={subscribeSelection("asdasd")}>asdasd</SelectionItem>
              {
                R.compose(
                  R.map(i => <SelectionItem className="item" key={i} ref={subscribeSelection(i)}>{i}</SelectionItem>),
                  R.times(R.identity),
                )(65)
              }
            </div>
          )}
        </Selection>
      </div>
    )
  }
}

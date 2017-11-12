import React, { Component } from 'react'

import { storiesOf } from '@storybook/react'
import { Selection, SelectionItem } from '../lib/draglect'
import * as R from 'ramda'
import './styles.css'
import { Selection2, SelectionItem2 } from '../lib/draglect2'

storiesOf('Draglect', module)
  .add('main', () => <Demo />)

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
        <h1>React Draglect</h1>
        <h3>React JS Component for drag select with mouse</h3>
        <button onClick={e => this.setState({selects: true}) }>select all:</button>
        <button onClick={e => this.setState({selects: false}) }>clear all:</button>
        <button onClick={e => this.setState({selects: ['0', '2', '4']}) }>select 1 3 5</button>
        <div style={{margin: 20, minHeight: 80}}>{this.state.selected.join(' ')}</div>
        <Selection2 selects={this.state.selects} onSelectionChange={x => {
          console.log(x)
          this.setState({selected: x})
        }}>
            <div>
              <table>
                <tbody>
                  {
                    R.compose(
                      R.map(i =>
                        <tr key={'row' + i}>
                          {
                            R.compose(
                              R.map(k => <td key={'cell' + i + k}><SelectionItem2 className="item">a</SelectionItem2></td> ),
                              R.times(R.identity)
                            )(15)
                          }
                        </tr>
                      ),
                      R.times(R.identity)
                    )(10)
                  }
                </tbody>
              </table>
            </div>
        </Selection2>
      </div>
    )
  }
}

import React, { Component } from 'react'
import Header from './Header'
import Contents from './Contents'
import "./index.scss"
export default class index extends Component {
  render() {
    return (
      <React.Fragment>
        <div className='home'>
          <Header></Header>
          <Contents></Contents>
        </div>
      </React.Fragment>
    )
  }
}

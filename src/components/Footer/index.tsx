import React, { Component } from 'react'
import "./index.scss"
export default class index extends Component {
  render() {
    return (
      <div className='footer'>
        <a href="https://twitter.com/baserc205547" target="_blank">
          <img src="twitter.png" alt="" width={40} height={40} />
        </a>
        <p>{new Date().getFullYear()}© BaseRC20. Develop By BaseRC20 Team.</p>
      </div>
    )
  }
}

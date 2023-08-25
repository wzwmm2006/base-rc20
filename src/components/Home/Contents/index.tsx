import React, { Component } from 'react'
import { Card, Skeleton, Progress, Button, message } from 'antd';
import PubSub from 'pubsub-js'
import "./index.scss"
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Web3 from "web3";
//alert(window.web3)
/* console.log(window.web3);
const web3 = new Web3(window.web3.currentProvider); */


declare global {
  interface Window {
    contract: any;
  }
}



const numbers = Array.from({ length: 21 }, (_, index) => index);
const { Meta } = Card;
// web3Modal初始化
const web3Modal = new Web3Modal({
  // 主网（以真钱去做互动的）、测试网（可以拿假钱去做互动）
  network: "https://goerli.infura.io/v3/", // 想要连的区块链是（主网 / 测试网） //
  providerOptions: {
    metamask: {
      package: '',
      options: {
        rpc: {
          5: "https://goerli.infura.io/v3/",
        }
      }
    }
  }
});

const contractAddr = "0x17C46eF61c196Ee355a0d71C88595f05f6c6a468";
const abi =[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"INIT_CLAIM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_ADDRESSES","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_REFER_TOKEN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_TOKEN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"_claimedUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"canClaimAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},{"internalType":"address","name":"referrer","type":"address"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimedCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimedPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimedSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"inviteRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"inviteUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"referReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"root","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_root","type":"bytes32"}],"name":"setRoot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"setToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
let dudu: any;
let times: any;
let web3: any;
export default class Contents extends Component {
  state = {
    loading: true,
    startPresale: false,
    presaleNum: 0,
    presaleQty: 0,
    decimalChainId: null,
    connectId: '',
    claimedSupply:0,
    claimedPercentage:0,
    canClaimAmount:0,
    MAX_TOKEN:84000000000000,
    referrer:"" // 用户用别人的invite链接进入网站：xxx?invite=invite_addr，refferrer = invite_addr
  }

  async componentDidMount() {
    let web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        // 请求用户授权
        window.ethereum.enable().then((res: any) => {
          this.setState({ connectId: res[0] })
          message.success('successfull connection!')
        }).catch((err: any) => {
          console.log(err);
        })
      } catch (error) {
        // 用户不授权时
        message.error('Please connect to the specified network')
      }
    }
    web3 = new Web3(web3Provider);
    dudu = new web3.eth.Contract(abi, contractAddr);
    setTimeout(() => {
      this.setState({ loading: false })
    }, 2000)
    PubSub.subscribe('chainId', (d, data) => {
      this.setState({ decimalChainId: data.decimalChainId })
      clearInterval(times)
      if (data.decimalChainId === 5) {
        this.init()
      }
    })
    PubSub.subscribe('connectId', (d, data) => {
      this.setState({ connectId: data.connectId })
    })
  }
  getMessage = async () => {
    //return await window.contract.getPresaleInfo()
    return await dudu.methods.getPresaleInfo().call()
  }

  preSale = async () => {
    // get proof
    const address = "124";   // 这个改成链接钱包的地址
    let proof = "";
    try {
      const response = await fetch('http://154.39.81.22:8080/api/proof?address='+address);
      const data = await response.json();
      if (data.code != 200){
        message.error(data.message)
        proof = data.data.proof;
        return
      }
      console.debug(data);
    }catch (err) {
      return
    }

    dudu.methods.claim(proof, this.state.referrer)
      .send(
        { from: this.state.connectId, value: web3.utils.toWei("0.00", "ether") }
      ).then((res: object) => { }).catch((err: any) => {
        const startMarker = '"message":"';
        const endMarker = '","data":';
        const startIndex = err.message.indexOf(startMarker) + startMarker.length;
        const endIndex = err.message.indexOf(endMarker, startIndex);
        const extractedContent = err.message.substring(startIndex, endIndex);
        message.error(extractedContent)
      })
  }
  preview = () => {
    window.open('https://app.uniswap.io/')
  }
  init = async () => {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    // 初始化合约
    const _contract = new ethers.Contract(contractAddr, abi, signer);
    window.contract = _contract;
    times = setInterval(() => {
      this.getMessage().then((res: any) => {
        for (const key in res) {
          let obj = {
            claimedSupply: res.claimedSupply,
            claimedPercentage: parseInt(res.claimedPercentage),
            canClaimAmount: res.canClaimAmount()
          }
          this.setState(obj)
        }
      })
    }, 1000)
  }
  render() {
    let styles = {
      fontSize: '13px',
    };
    return (
      <div className='home-contents'>
        <Card
          style={{ width: '100%', marginTop: 16 }}
        >
          <Skeleton loading={this.state.loading} active paragraph={{ rows: 15 }} >
            <h3 className='contents-title' >Friend Share</h3>
            <p className="contents-explain-pc mb-50px">People involved in Friend.tech get greater benefits.</p>
            <p className="contents-explain mt-20px" style={styles}>The addresses that interacted before the snapshot will be able to claim airdrop $FS.</p>
            <p className="contents-explain-code  mb-20px">
              <a href="https://goerli.etherscan.io/address/0x0a4d23cea4414c540c82223e0c773301a844578a">0x0A4d23CEa4414c540c82223e0c773301a844578A</a>
            </p>
            <p className='contents-number mt-20px'>
              <span className='contents-number-label'>Token:</span>
              <span className='contents-number-value'>$FS</span>
              <span className='contents-number-label'>Total Supply:</span>
              <span className='contents-number-value' style={{ marginRight: 0 }}>420,000,000,000,000</span>
              <span className='contents-number-label' style={{ marginLeft: 0 }}></span>
            </p>
            <div className="contents-total mb-20px">
              <div>
                <p className='contents-total-title'>Total Airdrop Amount</p>
                <p className='contents-total-value'>84,000,000,000,000</p>
              </div>
              <div>
                <p className='contents-total-title'>Total Claimed Address</p>
                <p className='contents-total-value'>{this.state.claimedSupply}</p>
              </div>
              <div>
                <p className='contents-total-title'>Individual CanClaim Amount</p>
                <p className='contents-total-value'>{this.state.canClaimAmount}</p>
              </div>
            </div>
            <div className='contents-claim mb-20px'>
              <Progress type="circle" percent={this.state.claimedPercentage} strokeColor={"#045ff3"} trailColor={"#fff"}></Progress>
              <div>
                <Button type="primary" className='mt-20px mr-20px' disabled={!this.state.connectId || this.state.decimalChainId != 5 || !this.state.startPresale || this.state.claimedSupply >= this.state.MAX_TOKEN} onClick={this.preSale}>Claim</Button>
                <Button type="primary" className='mt-20px' onClick={this.preview}>Invite</Button> // 点这个按钮，生成xxx?invite=address的链接，并复制
              </div>
             </div>
            <div className='contents-restrict'>
              <h3>FSTokenomic</h3>
              <p className='mt-10px'>
                <span className=''>*</span>
                Each address involved can claim tokens</p>
            </div>
            <div className='contents-hold mt-20px'>
              <p className='contents-hold-title'>
                <span>Allocation</span>
                <span>Percent</span>
              </p>
              <p>
                <span>Team</span>
                <span>10%(Lock for 6 months)</span>
              </p>
              <p>
                <span>Marketing</span>
                <span>15%</span>
              </p>
              <p>
                <span>LP</span>
                <span>55%</span>
              </p>
              <p>
                <span>Airdrop</span>
                <span>20%</span>
              </p>
            </div>
            <p className='contents-num-max'>There is no limit on holding tokens</p>
            <div className='contents-img-msg'>
              <h2>Our Products: </h2><h3>"Our product suite includes a range of exciting betting games. Players can participate using our tokens, with winners receiving substantial rewards. Our win-loss mechanism ensures platform liquidity while providing continuous incentives for players, creating a dynamic and engaging gaming experience."</h3>
              <h2>Reward Mechanism: </h2><h3>"Our reward mechanism is designed to benefit long-term token holders. They can enjoy additional benefits such as priority access to new games or lower transaction fees. This not only incentivizes holding onto our tokens but also fosters a loyal and engaged community."</h3>
            </div>

          </Skeleton>
        </Card>

      </div>
    )
  }
}

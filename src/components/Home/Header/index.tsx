import React, { useState, useEffect, useRef } from 'react';
import "./index.scss"
import { Button, message } from 'antd';
import PubSub from 'pubsub-js'
declare global {
  interface Window {
    ethereum: any;
  }
}

const MetamaskLink: React.FC = () => {
  const getId = () => {
    // 获取链的chainid
    window.ethereum.request({ method: 'eth_chainId' })
      .then((chainId: any) => {
        const decimalChainId = parseInt(chainId, 16);
        // console.log('Chain ID:', decimalChainId);
        // 在这里处理获取到的chainId
        if (decimalChainId !== 5) {
          messageApi.error({
            content: 'Please connect to the specified network',
            duration: 5
          });
        }
        PubSub.publish('chainId', {
          decimalChainId: decimalChainId
        })
      })
      .catch((error: any) => {
        console.log('Error request Chain ID:', error);
      });
  }
  const [isConnect, setIsConnect] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isInitializedRef = useRef(false);
  const handleLinkClick = async () => {
    if (isConnect) return
    (window as any).ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((res: any) => {
        console.log(res);
      })
      .catch((err: any) => {
        if (err.code === 4001) {
          // 用户拒绝连接
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
    try {
      if (typeof (window as any).ethereum !== 'undefined') {
        const provider = (window as any).ethereum;
        if (provider._metamask && provider._metamask.pendingRequest) {
          await provider._metamask.abort();
        }
        window.ethereum.enable().then((res: any) => {
          messageApi.success('successfu lconnection!');
        }).catch((err: any) => {
          messageApi.error('Please connect to the specified network');
        })
        // await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
      } else {
        messageApi.error({
          content: 'Please install Metamask',
          duration: 5
        });
      }
    } catch (error) {
      messageApi.error({
        content: 'Please connect to the specified network',
        duration: 5
      });
    }
  };
  useEffect(() => {
    if (isInitializedRef.current) return
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: any) => {
        if (accounts.length > 0) {
          setIsConnect(accounts[0])
          PubSub.publish('connectId', {
            connectId: accounts[0]
          })
          getId()
        } else {
          setIsConnect(false)
          PubSub.publish('connectId', {
            connectId: ''
          })
        }
      });
      // 监听网络切换事件
      window.ethereum.on('chainChanged', (chainId: any) => {
        getId();
      });
      // 获取初始连接状态
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: any) => {
          if (accounts.length > 0) {
            setIsConnect(accounts[0])
            PubSub.publish('connectId', {
              connectId: accounts[0]
            })
            getId()
          } else {
            setIsConnect(false)
            PubSub.publish('connectId', {
              connectId: ''
            })
          }
        })
        .catch((error: any) => {
          console.log('Error requesting MetaMask address:', error);
        });
      isInitializedRef.current = true;
    } else {
      messageApi.error({
        content: 'Please install Metamask',
        duration: 5
      });
    }
  }, [messageApi])

  return (
    <div className='header'>
      {contextHolder}
      <div className='header-name'>
      Friend Share TOKEN
      </div>
      <div className='header-right'>
        <img src="logo.png" alt="" />
        <Button type="primary" onClick={handleLinkClick}>{isConnect ? isConnect : 'CONNECT'}</Button>
      </div>
    </div>
  );
};

export default MetamaskLink;






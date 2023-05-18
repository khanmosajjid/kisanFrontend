import { useEffect, useState } from 'react';
import useStore from '../utility/store';
import mobileWallet from '../public/img/walletconnect1.svg';
import metamask from '../public/img/MetaMask_Fox.svg';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import {connectToMetaMask, connectWithWalletConnect } from '../utility/wallet';
import { useRouter } from "next/router";
export default function ConnectModal({ showModal, title = 'Connect Wallet' }) {   
  const router = useRouter();   
  const displayModal = useStore((state) => state.setDisplayModalFalse);
  const setBlurV = useStore((state) => state.setBlurV);
  const setWalletAccount = useStore((state) => state.setWalletAccount);
  const setProvInstance = useStore((state) => state.setProvInstance);
  const visibility = useStore((state) => state.displayModal);
  const walletAccount = useStore((state) => state.WalletAccount);

  //Close modal when "x" is clicked
  const handleClose = () => {
    setBlurV(false);
    displayModal();
  };


  useEffect(()=>{
    if(walletAccount){
    handleClose();
    }
  })

  //Handle wallet connection
  const connectWallet = async (type) => {
    let acc ;

    if(type == 'metamask'){
        acc = await connectToMetaMask();
        if(acc){
            setWalletAccount(acc.account);
            setProvInstance(acc.prov);
            localStorage.setItem('walletConnected',true)
            localStorage.setItem('walletAddress',acc.account);
            setTimeout(() => {
              router.reload(window.location.pathname);
            }, 1000);
        }

    }else if(type == 'walletconnect'){
        acc = await  connectWithWalletConnect();
        if(acc){
            setWalletAccount(acc.account);
            setProvInstance(acc.prov);
            localStorage.setItem('walletConnected', true);
            localStorage.setItem('walletAddress',acc.account);
        }
    }  
  }

  return (
    <>
      {visibility ? (
        <>
        {visibility? setBlurV(true): setBlurV(false)}
        <div className='walletModal d-flex align-items-center justify-content-center' style={{
            background: "#00000093",
            width: "100%",
            height: "100vh",
            overflow: "none",
            position: "fixed",
            zIndex: "99"
        }}>
            <div className='container modal-container' style={{
                background: "#080F18",
                maxWidth: "380px",
            }}>
                <div className='head d-flex  align-items-center justify-content-center' style={{
                    padding: "20px",
                    borderBottom: "1px solid #132236",
                    position: "relative"

                }}>
                    <p className=' text-white' style={{
                        width: "100%",
                        textAlign: "center",
                        margin: 0,
                        fontWeigth: "800",
                        fontFamily: "'Sen', sans-serif"
                    }}
                    >{title}</p>
                    <button className=" border-0 d-flex align-items-center justify-content-center" style={{
                        background: "#080F18",
                        color: "#9A9EB2",
                        fontSize: "2.4rem",
                        alignSelf: "end",
                        cursor: 'pointer'
                    }} onClick={handleClose}> <Icon icon="eva:close-fill" /></button>
                 <hr style={{
                      width: "107%",
                      bottom: "0",
                      position: "absolute",
                      color: "#132236"
                 }}></hr>
                </div>

                <div className={'body'}>
                <div className="wallet- d-flex flex-column">

                  <button className="d-flex align-items-center text-white mb-4 " style={{
                    background: "#13223633",
                    border: "1px solid #132236",
                    borderRadius: "5px",
                    padding: "17px",
                  }} onClick={()=>{connectWallet(`walletconnect`)}}>
                    <Image
                      src={mobileWallet}
                      alt="wallet"
                      width={'40'}
                      height={'40'}
                      className="align-straight pr-3"
                    />
                    <span style={{
                        marginLeft: "17px"
                    }} className="align-straight">Wallet Connect</span>
                  </button>

                  <button className="d-flex  align-items-center text-white mb-4" onClick={()=>{connectWallet(`metamask`)}}  style={{
                    background: "#13223633",
                    border: "1px solid #132236",
                    borderRadius: "5px",
                    padding: "17px",
                  }}>
                    <Image
                      src={metamask}
                      alt="metamask"
                      width={'40'}
                      height={'40'}
                      className="align-straight pr-3"
                    />
                    <span style={{
                        marginLeft: "17px"
                    }} className="align-straight">Metamask</span>
                  </button >
                  
                </div>
                </div>
            </div>
        </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}

import { useEffect, useState } from "react";
import { getContract } from "../utility/wallet"
import useStore from "../utility/store";
import Image from "next/image";

export function Modal(poolid, min_amount){
    const modalItem = useStore(state => state.modalData);
    const [inputAmt, setAmount] = useState(modalItem?.min_deposit);
   

    const stake = async ( amount, poolID ) => {
        let contract = await getContract();
        let stake = await contract.stake( amount, poolID  );
    }

    return (<>
    
    <div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                  <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalCenterTitle">Stake KSN</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true"> <Image height="auto" width="auto" src="/img/ex.svg" alt="" /></span>
                  </button>
                  </div>{JSON.stringify(inputAmt)}
                  <div className="modal-body">
                      <ul className="nav nav-pills" id="pills-tab" role="tablist">
                          <li className="nav-item">
                            <a className="nav-link active" id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">Staking</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Withdrawal</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link" id="pills-contact-tab" data-toggle="pill" href="#pills-contact" role="tab" aria-controls="pills-contact" aria-selected="false">Rewards</a>
                          </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                          <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                              
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between text-grey" style={{marginBottom: "10px"}}>
                                  <span>
                                      Amount
                                  </span>
                                  <span>
                                      KSN Balance: <span style={{fontWeight:"500"}}>200,000</span>
                                  </span>
                              </div>
  
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between" style={{
                              background: "#0E1725",
                              borderRadius: "8px",
                              padding: "28.5px",
                              fontWeight: "700",
                              fontSize: "1.8rem",
                              marginBottom: "32px"
                              }}>
                                  <span >20,000 <small>($1000)</small></span>
                                  <input type="text" onChange={(e)=>{ setAmount(e.target.value)}} value={inputAmt} />
                                  <span >KSN {JSON.stringify(inputAmt)}</span>
                              </div>
  
                              <div className="staking-category d-flec flex-column" style={{padding: "20px", background: "#0E1725", borderRadius: "9.75964px", marginBottom: "32px"}}>
                                  <span className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Staking Category</span>
                                      <span>Silver Pool</span>
                                  </span>
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Amount 
                                      <span> 
                                          <Image height="auto" width="auto" src="/img/info.png" alt="" />
                                      </span>
                                      </span>
                                      <span>20,000 KSN ($1,000)</span>
                                  </span>
  
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Duration 
                                          <span> 
                                              <Image  height="auto" width="auto" src="/img/info.png" alt="" />
                                          </span>
                                      </span>
                                      <span>30 Days</span>
                                  </span>
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Transaction Fee</span>
                                      <span>$2 <span style={{color:"rgba(171, 146, 252, 1)"}}> (Fast) </span> <span>
                                          <Image  height="auto" width="auto" src="/img/downarrow.png" alt="" />
                                      </span> </span>
                                  </span>
                              </div>
  
                              <div className="notice d-flex flex-wrap  flex-wrap " style={{background: "#0E1725", borderRadius: "8px" ,marginBottom: "32px", padding: "18px 33px"}}>
                                  <div className="img d-flex flex-wrap  flex-wrap  justify-content-center align-items-center" style={{position: "relative", marginRight: "25px"}}>
                                      <Image height="auto" width="auto"   style={{position: "absolute"}} src="/img/exclaim.png" alt="" />
                                      <Image height="auto" width="auto"  src="/img/shield.png" alt="" />
  
                                  </div>
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                      <span style={{fontWeight: "700", fontSize: "1.1rem"}}>Staking $1000 for 30 days</span>
                                      <span style={{color:"#AFBED0", fontWeight: "400"}}>There’s a 20% penalty for premature withdrawal</span>
                                  </div>
                              </div>
                              <div className="d-flex flex-wrap  flex-wrap ">
                                  <button className="btn flex-grow-1 stake-btn" style={{fontWeight: "800", fontSize: "24px"}} onClick={()=>{
                                    stake(modalItem?.amount, modalItem?.poolID);
                                  }}>
                                      Stake
                                  </button>
                              </div>
                              
  
                          </div>
                          <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">...</div>
                          <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
  
                              <p style={{color: "rgba(175, 190, 208, 1)"}}>Your Positions</p>
                              <div className="position-wrapper d-flex flex-wrap  flex-wrap  justify-content-between" style={{background: "#0E1725"
                              ,borderRadius: "8px", marginBottom: "32px", padding: "28px"}}>
                                  
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                      <span className="d-flex flex-wrap  flex-wrap  align-items-center">
                                          <span className="">
                                              <Image height="auto" width="auto"  src="/img/spaceship.png" alt="" />
                                          </span>
                                          <span className="text-white" style={{fontWeight: "700",
                                          fontSize: "24px", margin: "0 10px"}}>
                                              Silver
                                          </span>
                                          <span>
                                              <Image height="auto" width="auto"  src="/img/open.png" alt="" />
                                          </span> 
                                      </span>
                                      <p className="text-light-grey" style={{fontWeight: "400"}}>Duration: 21 July 2022 - 30 August 2022</p>
                                  </div>
              
  
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column" >
                                      <span className="text-light-grey"> Your Stake</span>
                                      <span> 
                                          <span className="text-white" style={{fonWeight: "700",
                                          fontSize: "1.5rem"}}>29,302 KSN</span>
                                          <span className="text-light-grey" style={{fontWeight: "400"}}>$9201</span>
                                      </span>
                                  </div>
              
              
                              </div>
  
                              <p style={{color: "rgba(175, 190, 208, 1)"}}>Your Positions</p>
  
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap " style={{marginBottom: "32px", fontWeight: "700",
                              fontSize: "36px", background: "#0E1725", borderRadius: "8px", padding: "28px"}}>
                                  <span className="text-white">2,291 KSN</span>
                              </div>
  
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap ">
                                  <button className="btn flex-grow-1 stake-btn" style={{fontWeight: "800", fontSize: "24px"}}>
                                      Claim reward
                                  </button>
                              </div>
  
                          </div>
                        </div>
                        
                  </div>
              </div>
              </div>
          </div>
    
    
    
    </>)
}
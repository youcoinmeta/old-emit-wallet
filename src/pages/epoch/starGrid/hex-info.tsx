import * as React from 'react'
import * as utils from "../../../utils";
import CounterSvg from "./counter-svg";
import {Hex, HexInfo} from "../../../components/hexagons/models";
import LandSvg from "./land-svg";
import {IonIcon,IonButton} from "@ionic/react";
import {eyeOffOutline, eyeOutline} from "ionicons/icons";
import {LockedInfo} from "../../../types";
interface Props{
    sourceHexInfo: HexInfo;
    attackHexInfo?: HexInfo;
    onShowDistribute?: ()=>void;
    onMove?:()=>void;
    onMoveTo?:(hex:Hex)=>void;
    onCapture?:()=>void;
    lockedInfo?:LockedInfo;
    hasCounters?:boolean
}

class HexInfoCard extends React.Component<Props, any>{

    state:any = {
        eyeOff:false,
        eyeOffAttack:false
    }

    render() {

        const {eyeOff,eyeOffAttack} = this.state;
        const {sourceHexInfo,attackHexInfo,onMoveTo,onMove,onShowDistribute,onCapture,lockedInfo,hasCounters} = this.props;
        const sourceCounter = sourceHexInfo.counter;
        const sourceLand = sourceHexInfo.land;
        const sourceHex = sourceHexInfo.hex;

        const attackCounter = attackHexInfo.counter;
        const attackLand = attackHexInfo.land;
        const attackHex = attackHexInfo.hex;

        return (
            <>
                {
                    sourceCounter && !eyeOff ?
                    <div className="owner-info">
                        <div className="avatar-l">
                            <div className="hex-head">
                                <CounterSvg counter={sourceCounter} land={sourceLand}/>
                                <div className="coo"><small>[{sourceHex.x},{sourceHex.z}]</small></div>
                            </div>
                            <div className="attr">
                                <div><img src="./assets/img/epoch/stargrid/icons/sword.png" width={20}/></div>
                                <div><img src="./assets/img/epoch/stargrid/icons/defense.png" width={20}/></div>
                                <div><img src="./assets/img/epoch/stargrid/icons/shot.png" width={20}/></div>
                                <div><img src="./assets/img/epoch/stargrid/icons/lucky.png" width={20}/></div>
                            </div>
                            <div className="attr">
                                <div>{sourceCounter.force}</div>
                                <div>{sourceCounter.defense}</div>
                                <div>{sourceCounter.move}</div>
                                <div>{sourceCounter.luck}</div>
                            </div>
                        </div>
                        <div className="cap-info">
                            <div className="capacity"><img src="./assets/img/epoch/stargrid/icons/level.png" width={20}/><span>{utils.fromValue(sourceCounter.capacity,18).toFixed(2,2)}</span></div>
                            <div className="capacity"><img src="./assets/img/epoch/stargrid/icons/level.png" width={20}/><span>{utils.fromValue(sourceCounter.life,18).toFixed(2,2)}</span></div>
                            <div className="rate"><img src="./assets/img/epoch/stargrid/icons/rate.png" width={20}/><span>{utils.fromValue(sourceCounter.rate,16).toFixed(2,2)}%</span></div>
                            <div className="attribute" onClick={()=>{
                                if(onShowDistribute){
                                    onShowDistribute()
                                }
                            }}><img src="./assets/img/epoch/stargrid/icons/plus.png" width={20}/>
                                <span>{sourceCounter.level}<img src="./assets/img/epoch/stargrid/icons/add.png" width={20}/></span>
                            </div>
                        </div>
                        <div className="eye">
                           <IonIcon src={eyeOutline} color="light" onClick={()=>{
                               this.setState({
                                   eyeOff:true
                               })
                           }}/>
                        </div>
                    </div>
                        :
                        sourceLand && (eyeOff || !sourceCounter)?
                            <div className="owner-info">
                                <div className="avatar-l">
                                    <div className="hex-head">
                                       <LandSvg land={sourceLand} />
                                       <div className="coo"><small>[{sourceHex.x},{sourceHex.z}]</small></div>
                                    </div>
                                    <div className="attr"></div>
                                    <div className="attr"></div>
                                </div>
                                <div className="cap-info">
                                    <div className="capacity"><img src="./assets/img/epoch/stargrid/icons/level.png" width={20}/><span>{utils.fromValue(sourceLand.capacity,18).toFixed(2,2)}</span></div>
                                    <div className="rate"><img src="./assets/img/epoch/stargrid/icons/rate.png" width={20}/><span>{utils.fromValue(sourceLand.level,16).toFixed(2,2)}%</span></div>
                                    {
                                        lockedInfo&&lockedInfo.counter.counterId!="0" ? sourceLand && sourceLand.canCapture && <div className="operator-btn">
                                            <IonButton size="small" color="success" onClick={()=>{
                                                onMoveTo(sourceHex)
                                            }}>Move to the land</IonButton>
                                        </div>:
                                            <div className="operator-btn">
                                                <IonButton size="small" color="warning" onClick={()=>{
                                                    onCapture()
                                                }}>{hasCounters?"Capture":"Create COUNTERS"}</IonButton>
                                            </div>
                                    }

                                </div>
                                <div className="eye">
                                    <IonIcon src={eyeOffOutline} color="light"  onClick={()=>{
                                        this.setState({
                                            eyeOff:false
                                        })
                                    }}/>
                                </div>
                            </div>
                            :
                            <div className="owner-info">
                                <div className="avatar-l">
                                    <div className="hex-head" style={{backgroundColor:"#000"}}>
                                        <LandSvg />
                                        <div className="coo"><small>[{sourceHex.x},{sourceHex.z}]</small></div>
                                    </div>
                                    <div className="attr"></div>
                                    <div className="attr"></div>
                                </div>
                                <div className="cap-info">
                                    <div style={{border:"none"}}></div>
                                    {
                                        (!lockedInfo || lockedInfo.counter.counterId == "0") &&
                                        <div className="operator-btn">
                                            <IonButton size="small" color="warning" onClick={()=>{
                                                onCapture()
                                            }}>{hasCounters?"Capture":"Create COUNTERS"}</IonButton>
                                        </div>
                                    }
                                </div>
                            </div>
                }
                {
                    attackCounter && !eyeOffAttack ? <div className="enemy-info">
                            <div className="avatar-l">
                                <div className="hex-head">
                                    <CounterSvg counter={attackCounter} land={attackLand}/>
                                    <div className="coo"><small>[{attackHex.x},{attackHex.z}]</small></div>
                                </div>
                                <div className="attr">
                                    <div><img src="./assets/img/epoch/stargrid/icons/sword.png" width={20}/></div>
                                    <div><img src="./assets/img/epoch/stargrid/icons/defense.png" width={20}/></div>
                                    <div><img src="./assets/img/epoch/stargrid/icons/shot.png" width={20}/></div>
                                    <div><img src="./assets/img/epoch/stargrid/icons/lucky.png" width={20}/></div>
                                </div>
                                <div className="attr">
                                    <div>{attackCounter.force}</div>
                                    <div>{attackCounter.defense}</div>
                                    <div>{attackCounter.move}</div>
                                    <div>{attackCounter.luck}</div>
                                </div>
                            </div>
                        <div className="cap-info">
                            <div className="capacity"><img src="./assets/img/epoch/stargrid/icons/level.png" width={20}/><span>{utils.fromValue(attackCounter.capacity,18).toFixed(2,2)}</span></div>
                            <div className="capacity"><img src="./assets/img/epoch/stargrid/icons/level.png" width={20}/><span>{utils.fromValue(attackCounter.life,18).toFixed(2,2)}</span></div>
                            <div className="rate"><img src="./assets/img/epoch/stargrid/icons/rate.png" width={20}/><span>{utils.fromValue(attackCounter.rate,16).toFixed(2,2)}%</span></div>
                            <div className="attribute"><img src="./assets/img/epoch/stargrid/icons/plus.png" width={20}/>
                                <span>{sourceCounter.level}<img src="./assets/img/epoch/stargrid/icons/add.png" width={20}/></span>
                            </div>
                            <div className="operator-btn">
                                <IonButton size="small" color="danger" onClick={()=>{
                                    onMove()
                                }}>Attack</IonButton>
                            </div>
                        </div>

                        <div className="eye">
                            <IonIcon src={eyeOutline} color="light" onClick={()=>{
                                this.setState({
                                    eyeOffAttack:true
                                })
                            }}/>
                        </div>
                    </div>:
                        attackLand ? <div className="enemy-info">
                            <div className="avatar-l">
                                <div className="hex-head">
                                    <LandSvg land={attackLand} />
                                    <div className="coo"><small>[{attackHex.x},{attackHex.z}]</small></div>
                                </div>
                                <div className="attr">
                                </div>
                                <div className="attr"></div>
                            </div>
                            <div className="cap-info">
                                <div className="capacity"><img src="./assets/img/epoch/stargrid/icons/level.png" width={20}/><span>{utils.fromValue(attackLand.capacity,18).toFixed(2,2)}</span></div>
                                <div className="rate"><img src="./assets/img/epoch/stargrid/icons/rate.png" width={20}/><span>{utils.fromValue(attackLand.level,16).toFixed(2,2)}%</span></div>
                                <div className="operator-btn">
                                    <IonButton size="small" color={attackCounter?"danger":"success"} onClick={()=>{
                                        onMove()
                                    }}>{attackCounter?"ATTACK":"MOVE"}</IonButton>
                                </div>
                            </div>

                            <div className="eye">
                                <IonIcon src={eyeOffOutline} color="light" onClick={()=>{
                                    this.setState({
                                        eyeOffAttack:false
                                    })
                                }}/>
                            </div>
                        </div>
                            : attackHex ?
                            <div className="enemy-info">
                                <div className="avatar-l">
                                    <div className="hex-head" style={{backgroundColor:"#000"}}>
                                        <LandSvg />
                                        <div className="coo"><small>[{attackHex.x},{attackHex.z}]</small></div>
                                    </div>
                                    <div className="attr"></div>
                                    <div className="attr"></div>
                                </div>
                                <div className="cap-info">
                                    <div style={{border:"none"}}></div>
                                    <div className="operator-btn">
                                        <IonButton size="small" color="success" onClick={()=>{
                                            onMove()
                                        }}>Move</IonButton>
                                    </div>
                                </div>
                            </div>:
                            <div style={{flex:1}}>

                            </div>
                }

            </>

    );
    }

    componentDidMount() {

    }
}

export default HexInfoCard
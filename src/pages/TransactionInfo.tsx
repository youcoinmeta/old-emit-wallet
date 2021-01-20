/**
 * Copyright 2020 EMIT Foundation.
 This file is part of E.M.I.T. .

 E.M.I.T. is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 E.M.I.T. is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with E.M.I.T. . If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import {
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage, IonProgressBar,
    IonRouterLink,
    IonSpinner,
    IonText,
    IonTitle,
    IonToast,
    IonToolbar
} from "@ionic/react";
import copy from 'copy-to-clipboard';
import walletWorker from "../worker/walletWorker";
import * as utils from "../utils";
import rpc from "../rpc";
import BigNumber from "bignumber.js";
import {ChainType, Transaction} from "../types";
import {chevronBack, copyOutline} from 'ionicons/icons';
import url from "../utils/url";
import i18n from "../locales/i18n";
import {Plugins} from "@capacitor/core";
import GasPriceActionSheet from "../components/GasPriceActionSheet";
import ConfirmTransaction from "../components/ConfirmTransaction";

class TransactionInfo extends React.Component<any, any> {

    state: any = {
        info: {},
        tokens: [],
        chain: ChainType._,
        address: "",
        events: {},
        showToast:false,
        showActionSheet:false

    }

    componentDidMount() {

        this.init().catch()
    }

    init = async () => {
        const account = await walletWorker.accountInfo()

        const txHash = this.props.match.params.hash;
        const chain = this.props.match.params.chain;
        console.log("ChainType[chain]", ChainType[chain])
        const address = account.addresses[chain];
        const rest: any = await rpc.getTxInfo(chain, txHash)
        const records: Array<any> = rest.records;
        const amountMap: Map<string, BigNumber> = new Map<string, BigNumber>();
        console.log(records,"records")
        for (let r of records) {
            if (r.address == address) {
                if (amountMap.has(r.currency)) {
                    const tmp: any = amountMap.get(r.currency);
                    tmp.amount = new BigNumber(tmp.amount).plus(r.amount);
                    amountMap.set(r.currency, tmp);
                } else {
                    amountMap.set(r.currency, r);
                }
            }
        }
        console.log(amountMap,"amountMap")
        const tokens: Array<any> = [];
        const entry = amountMap.entries();
        let next = entry.next();
        while (!next.done) {
            const v: any = next.value[1];
            tokens.push({cy: next.value[0], value: v.amount})
            next = entry.next();
        }
        console.debug("rest", rest)
        const events = await this.getEvent(chain,rest.txHash);
        this.setState({
            address: address,
            chain: chain,
            info: rest,
            tokens: tokens,
            events:events
        })
    }

    getEvent = async (chain:ChainType,txHash:string)=>{
        const result:any = {};
        let events = [];
        events = await rpc.getEvents(chain,txHash,"")
        if(events && events.length>0){
            let c = ChainType.ETH == chain?ChainType.SERO:ChainType.ETH;
            const target = await rpc.getEvents(c,"",events[0].event.depositNonce)
            events = events.concat(target)
            // events.sort((a:any,b:any)=>{
            //     const aStatus = a.eventName == 3?0:parseInt(a.event.status);
            //     const bStatus = b.eventName == 3?0:parseInt(b.event.status);
            //     return aStatus - bStatus;
            // })
        }
        for(let e of events){
            const state = e.eventName == 3?"0":e.event.status
            result[state] = e;
        }
        return result;
    }

    setShowModal = (f:boolean)=>{
        const {chain,info} = this.state;
        if(f){
            this.getEvent(chain,info.txHash).then((event)=>{
                this.setState({
                    showModal:f,
                    events:event
                })
            })
        }
        this.setState({
            showModal:f,
        })
    }

    setShowToast =(f:boolean,toastColor?:string,toastMsg?:string)=>{
        this.setState({
            showToast:f,
            toastColor:toastColor,
            toastMsg:toastMsg
        })
    }

    speedEthTx = async (gasPrice:any) =>{
        const txHash = this.props.match.params.hash;
        const rest:any = await rpc.post("eth_getTransactionByHash",[txHash]);
        const tx:Transaction = {
            from:rest.from,
            to:rest.to,
            cy:ChainType[ChainType.ETH],
            amount:"0x0",
            chain:ChainType.ETH,
            feeCy:ChainType[ChainType.ETH]
        };
        tx.gas = rest.gas;
        tx.gasPrice = utils.toHex(utils.toValue(gasPrice,9));
        tx.input = rest.input;
        tx.value = rest.value;
        tx.nonce = rest.nonce;
        this.setState({
            tx:tx,
            showSpeedAlert:true
        })
    }

    setShowSpeedAlert(f:boolean){
        this.setState({
            showSpeedAlert:f
        })
    }

    setShowProgress = (f:boolean)=>{
        this.setState({
            showProgress:f
        })
    }

    setShowActionSheet = (f:boolean)=>{
        this.setState({
            showActionSheet:f
        })
    }

    setGasPrice = (v:any)=>{
        this.setState({
            gasPrice:v
        })

        this.speedEthTx(v).catch(e=>{
            console.error(e)
        })
    }

    confirm = async (hash:string) => {
        const {chain,cy} = this.state;
        let intervalId:any = 0;
        intervalId = setInterval(()=>{
            rpc.getTxInfo(chain,hash).then((rest)=>{
                if(rest){
                    this.setShowToast(true,"success","Commit Successfully!")
                    clearInterval(intervalId);
                    url.transactionInfo(chain,hash,cy);
                    this.setShowProgress(false);
                }
            }).catch(e=>{
                console.error(e)
            })
        },1000)
        this.setShowSpeedAlert(false)
    }

    render() {
        const {info, tokens, chain,tx,toastColor,toastMsg,showProgress, showActionSheet,gasPrice,events,showModal,showToast,showSpeedAlert} = this.state;
        console.info("tokens", tokens)
        return <IonPage>
            <IonContent fullscreen>
                <IonHeader>
                    <IonToolbar mode="ios" color="primary">
                        <IonIcon src={chevronBack} slot="start" size="large" onClick={()=>{url.back()}}/>
                        <IonTitle>Transaction Info</IonTitle>
                    </IonToolbar>
                    {showProgress && <IonProgressBar type="indeterminate"/>}
                </IonHeader>
                <IonList>
                    <IonItem  mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("transactionHash")}:</IonLabel>
                        <div className="text-small-x2 word-break text-padding-normal">
                            <IonRouterLink onClick={()=>{
                                Plugins.Browser.open({url:utils.getExplorerTxUrl(chain,info.txHash)}).catch(e=>{
                                    console.log(e)
                                })
                            }}>{info.txHash}</IonRouterLink>
                            <IonIcon src={copyOutline} size="small"  onClick={() => {
                                copy(info.txHash)
                                copy(info.txHash)
                                this.setShowToast(true)
                            }} />
                        </div>
                    </IonItem>
                    <IonItem  mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("status")}:</IonLabel>
                        {events && events["0"] && <IonButton size="small" fill="outline" slot="end" onClick={()=>{
                            this.setShowModal(true)
                        }}
                        >{i18n.t("viewCrossInfo")}</IonButton>}
                        <div className="text-small-x2 word-break text-padding-normal">
                            {info.num>0?<IonBadge color="success">{i18n.t("success")}</IonBadge>:
                                <IonBadge color="warning">{i18n.t("pending")}</IonBadge>}
                        </div>
                        <div slot="end">
                            {
                                chain == ChainType.ETH && info.num == 0 &&
                                <IonButton size="small" fill="outline" slot="end" onClick={()=>{
                                    this.setShowActionSheet(true);
                                }}>{i18n.t("speedUp")}</IonButton>
                            }
                        </div>
                    </IonItem>
                    <IonItem  mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("block")}:</IonLabel>
                        <div className="text-small-x2 word-break text-padding-normal">
                            <IonRouterLink className="info-block" onClick={()=>{
                                Plugins.Browser.open({url:utils.getExplorerBlockUrl(chain,info.txHash,info.num)}).catch(e=>{
                                    console.log(e)
                                })
                            }}>{info.num}</IonRouterLink>
                        </div>
                        <IonBadge color="light" slot="end">{ChainType[chain]} {i18n.t("chain")}</IonBadge>
                    </IonItem>
                    <IonItem  mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("timestamp")}:</IonLabel>
                        <div className="text-small-x2 word-break text-padding-normal">
                            {new Date(info.timestamp*1000).toString()}
                        </div>
                    </IonItem>
                    <IonItem  mode="ios" onClick={() => {
                        copy(info.fromAddress)
                        copy(info.fromAddress)
                        this.setShowToast(true)
                    }} >
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("from")}:</IonLabel>
                        <div className="text-small-x2 word-break text-padding-normal">
                            {info.fromAddress}
                            <IonIcon src={copyOutline} size="small"/>
                        </div>
                    </IonItem>
                    <IonItem  mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("to")}:</IonLabel>
                        <div className="text-small-x2 word-break text-padding-normal" style={{maxHeight:"20vh",overflowY:"scroll"}}>{
                            info.contractAddress ?<div>{info.contractAddress}<IonIcon src={copyOutline} size="small" onClick={() => {
                                    copy(info.contractAddress)
                                    copy(info.contractAddress)
                                    this.setShowToast(true)
                                }} /></div>:

                                info.toAddress && info.toAddress.map((addr: string) => {
                                    if(addr !== info.fromAddress || info.toAddress.length == 1){
                                        return <div style={{padding:"5px 0"}}>{addr}<IonIcon src={copyOutline} size="small" onClick={() => {
                                            copy(addr)
                                            copy(addr)
                                            this.setShowToast(true)
                                        }} /></div>
                                        }
                                    return ""
                                })
                        }</div>
                    </IonItem>
                    <IonItem  mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("value")}:</IonLabel>
                        <IonText>{
                            tokens && tokens.length > 0 && tokens.map((v: any) => {
                                const symbol = new BigNumber(v.value).toNumber()>0?"+":""
                                return <IonBadge color="light">
                                    {symbol}{utils.fromValue(v.value, utils.getCyDecimal(v.cy, ChainType[chain])).toString(10)} {v.cy}
                                </IonBadge>
                            })
                        }</IonText>
                    </IonItem>
                    <IonItem lines="none" mode="ios">
                        <IonLabel color="dark" className="info-label" position="stacked">{i18n.t("transactionFee")}:</IonLabel>
                        <IonText className={"text-small"}>
                            {info.fee && utils.fromValue(info.fee, utils.getCyDecimal(info.feeCy, ChainType[chain])).toString(10)} {info.feeCy}
                            <div>
                                <IonText color="medium">{utils.fromValue(info.gasUsed?info.gasUsed:info.gas, 0).toString(10)}({i18n.t("gas")})
                                    * {utils.fromValue(info.gasPrice, 9).toString(10)} {utils.gasUnit(chain)}</IonText>
                            </div>
                        </IonText>
                    </IonItem>
                </IonList>

                <IonModal isOpen={showModal} mode="ios" swipeToClose={true} >
                    <IonList mode="ios">
                        <IonItem>
                            <IonLabel>{i18n.t("deposit")}</IonLabel>
                            <IonText>{events["0"] && <IonBadge color="success">{i18n.t("success")}</IonBadge>}</IonText>
                        </IonItem>
                        <IonItem>
                            <IonLabel>{i18n.t("approve")}</IonLabel>
                            <IonText>{ events["1"] ?
                                <IonBadge color="success">{i18n.t("success")}</IonBadge> : events["4"]?
                                    <IonBadge color="danger">{i18n.t("failed")}</IonBadge>: events["3"]?
                                        <IonBadge color="success">{i18n.t("success")}</IonBadge>:<IonSpinner name="bubbles" />
                            }</IonText>
                        </IonItem>
                        <IonItem>
                            <IonLabel>{i18n.t("validate")}</IonLabel>
                            <IonText>
                                { events["2"] ?
                                    <IonBadge color="success">{i18n.t("success")}</IonBadge> : events["4"]?
                                        <IonBadge color="danger">{i18n.t("failed")}</IonBadge>: events["3"]?
                                            <IonBadge color="success">{i18n.t("success")}</IonBadge>:<IonSpinner name="bubbles" />
                                }
                            </IonText>
                        </IonItem>
                        <IonItem>
                            <IonLabel>{i18n.t("execute")}</IonLabel>
                            <IonText>
                                {events["3"] ? <IonBadge color="success">{i18n.t("success")}</IonBadge> :
                                    events["4"]?<IonBadge color="danger">{i18n.t("failed")}</IonBadge>:<IonSpinner name="bubbles" />}
                            </IonText>
                        </IonItem>
                    </IonList>
                    <IonButton mode="ios" onClick={() => this.setShowModal(false)}>{i18n.t("close")}</IonButton>
                </IonModal>

                <IonToast
                    color={toastColor?toastColor:"dark"}
                    position="top"
                    isOpen={showToast}
                    onDidDismiss={() => this.setShowToast(false)}
                    message={toastMsg?toastMsg:"Copied to clipboard!"}
                    duration={1500}
                    mode="ios"
                />

                <GasPriceActionSheet onClose={()=>this.setShowActionSheet(false)}  show={showActionSheet} onSelect={this.setGasPrice} value={gasPrice} chain={chain}/>

                <ConfirmTransaction show={showSpeedAlert} transaction={tx} onProcess={(f)=>this.setShowProgress(f)} onCancel={()=>this.setShowSpeedAlert(false)} onOK={this.confirm}/>

            </IonContent>
        </IonPage>;
    }
}

export default TransactionInfo
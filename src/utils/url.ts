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

import {ChainType} from "../types";

class Url {
    private base = "#"

    private account = {
        create: "account/create",
        confirm: "account/confirm",
        backup: "account/backup",
        import: "account/import",
        export: "account/export",
        receive: "account/receive"
    }

    private transaction = {
        tunnel:"tunnel",
        transfer: "transfer",
        list: "transaction/list",
        info: "transaction/info",
    }

    private settings = {
        setting: "tabs/settings",
        about:"manage/about",
    }

    private scan = "scan";

    constructor() {
    }

    path_settings = () => {
        return [this.base, this.settings.setting].join("/")
    }

    /**
     * go to page
     * @param path
     * @param delay seconds
     */
    goTo(path: string, pre: string, delay?: number) {
        const data: any = sessionStorage.getItem("history");
        if (pre) {
            const pathArr = data && JSON.parse(data);
            if (pathArr && pathArr.length > 0) {
                pathArr.push(pre);
                sessionStorage.setItem("history", JSON.stringify(pathArr))
            } else {
                sessionStorage.setItem("history", JSON.stringify([pre]))
            }
        }
        if (delay) {
            setTimeout(() => {
                window.location.href = path
                // window.location.reload();
            })
            return
        }
        window.location.href = path
        // window.location.reload();
        return;
    }

    back() {
        const data: any = sessionStorage.getItem("history");
        const pathArr = data && JSON.parse(data)
        if (pathArr && pathArr.length > 0) {
            const pre = pathArr.pop();
            sessionStorage.setItem("history", JSON.stringify(pathArr));
            window.location.href = pre;
            // window.location.reload();
        } else {
            this.home();
        }
    }


    home() {
        this.goTo(this.base, "/");
        return
    }

    accountCreate() {
        this.goTo([this.base, this.account.create].join("/"), "");
    }

    accountBackup(pre?: string) {
        this.goTo([this.base, this.account.backup].join("/"), pre ? pre : [this.base, this.account.create].join("/"));
    }

    accountConfirm() {
        this.goTo([this.base, this.account.confirm].join("/"), [this.base, this.account.backup].join("/"));
    }

    accountImport() {
        this.goTo([this.base, this.account.import].join("/"), [this.base, this.account.create].join("/"));
    }

    accountExport() {
        this.goTo([this.base, this.account.export].join("/"), [this.base, this.settings].join("/"));
    }

    receive(address: string) {
        this.goTo([this.base, this.account.receive, address].join("/"), [this.base].join("/"))
    }

    transfer(cy: string, chain: string,to?:string) {
        to ?this.goTo([this.base, this.transaction.transfer, cy, chain,to].join("/"), [this.base].join("/")):
            this.goTo([this.base, this.transaction.transfer, cy, chain].join("/"), [this.base].join("/"))
        return
    }

    tunnel(cy: string) {
        this.goTo([this.base, this.transaction.tunnel, cy].join("/"), [this.base].join("/"));
        return
    }

    transactionList(cy: string, chainName: string) {
        this.goTo([this.base, this.transaction.list, chainName, cy].join("/"), [this.base].join("/"));
        return
    }

    transactionInfo(chain: ChainType, hash: string, cy: string) {
        this.goTo([this.base, this.transaction.info, chain, hash].join("/"), [this.base, this.transaction.list, ChainType[chain], cy].join("/"));
        return
    }

    aboutUs(){
        this.goTo([this.base,this.settings.about].join("/"),this.path_settings());
    }

    qrScan(pre:string){
        this.goTo([this.base,this.scan].join("/"),[this.base].join("/"));
    }

}

const url = new Url();
export default url;
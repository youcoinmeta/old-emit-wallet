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
import {IonContent, IonHeader, IonPage} from "@ionic/react";
import {BarcodeScanner} from "@ionic-native/barcode-scanner";

class Scan extends React.Component<any, any>{

    componentDidMount() {
        this.openScanner().then().catch(e=>{
            console.log(e)
        });
    }

    openScanner = async () => {
        const data = await BarcodeScanner.scan({
            formats: "QR_CODE",
            prompt: "Scan QR Code."
        });
        console.log(`Barcode data: ${data.text}`);
    };

    render() {
        return <IonPage>
            <IonContent fullscreen>
                <IonHeader>
                </IonHeader>
            </IonContent>
        </IonPage>;
    }
}

export default Scan;
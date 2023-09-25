import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable} from 'rxjs';
import * as signalR from '@microsoft/signalr';

import { ModelsStatesService } from './models-states.service';


@Injectable({
  providedIn: 'root'
})

export class ConstructionWorkService {
  private apiUrl = 'https://safesignapi.azurewebsites.net/'; // Replace with API endpoint
  private hubConnection!: signalR.HubConnection;
 
  private hasErrorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  hasError$ = this.hasErrorSubject.asObservable();

  constructor(private http: HttpClient, private modelsStates: ModelsStatesService ) {
    this.initializeSignalR();
   }

  private initializeSignalR() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://lionfunctionapp.azurewebsites.net/api/') // Replace with your SignalR hub URL
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection started');
        // this.subscribeToSignUpdates(); // Subscribe to SignalR events
        this.subscribeToSensorUpdate();
      })
      .catch((error) => {
        console.error('Error while starting SignalR connection:', error);
      });
  }

  // private signUpdateSubject: BehaviorSubject<Signs> = new BehaviorSubject<Signs>({ id: 0, csId: 0, planId: 0, ogAngle: 0, currAngle: 0, issue: '' });
  // signUpdate$ = this.signUpdateSubject.asObservable();

  private sensorUpdateSubject: BehaviorSubject<Sensor> = new BehaviorSubject<Sensor>({ Id: "", CSId: "", PlanId: "",  OgAngle: 0, CurrAngle: 0, Issue: "",
  SensorId: "", Type: 0, OgX: 0, OgY: 0, OgZ:0, CurrX: 0, CurrY: 0, CurrZ: 0 });
  sensorUpdate$ = this.sensorUpdateSubject.asObservable();


  // private subscribeToSignUpdates() {
  //   console.log('SignUpdate subribed');
  //   this.hubConnection.on('signangleissue', (sign: Signs) => {
  //     // Handle the received sign update from SignalR
  //     console.log('Received sign update:', sign);
  //     this.signUpdateSubject.next(sign);
  //     // Update your local data or trigger any necessary actions here
  //   });
  // }

  private subscribeToSensorUpdate() {
    console.log('SensorUpdate subsribed');
    this.hubConnection.on('signpositionissue', (sensor: Sensor) => {
      // Handle the received sign update from SignalR
      console.log('Received Sensor update:', sensor);
      this.sensorUpdateSubject.next(sensor);
      // Update your local data or trigger any necessary actions here
    });
  }


  setHasError(hasError: boolean) {
    this.hasErrorSubject.next(hasError);
  }

  addConstructionWorkwithSignsSensors(payload: any): Observable<any> {
    return this.http.post(this.apiUrl + 'ConstructionSite/sensor', payload);
  }

  // Delete Construction Work
  deleteConstructionWork(workId: number): Observable<any> {
    return this.http.delete(this.apiUrl + `ConstructionSite/${workId}`);
  }

  // Get All Construction Work
  getAllConstructionWork(): Observable<ConstructionWork[]> {
    return this.http.get<ConstructionWork[]>(this.apiUrl + 'ConstructionSite');
  }

  getSignsByWorkId(workId: number): Observable<Signs[]> {
    return this.http.get<Signs[]>(this.apiUrl + `sign/cs/${workId}`);
  }

  // Get All Signs
  getAllSigns(): Observable<Signs[]> {
    return this.http.get<Signs[]>(this.apiUrl + 'sign');
  }

  updateSign(sign: Signs): Observable<any> {
    console.log("update service", sign, sign.id)
    return this.http.put(this.apiUrl + `sign/${sign.id}`,sign);
  }

  checkSignAngle(sign: Signs): Observable<any> {
    console.log("update service" + sign.id)
    return this.http.get(this.apiUrl + `sign/checksignangle/${sign.id}`);
  }
}

interface ConstructionWork {
  id: number;
  planId: number;
  street: string;
  city: string;
  startDate: string;
  endDate: string;
  status: boolean;
}

interface Signs {
  id: number;
  csId: number;
  planId: number;
  sensorId: string;
  ogAngle: number;
  currAngle: number;
  issue: string;
  // type?: number;
  ogX?: number;
  ogY?: number;
  ogZ?: number;
  currX?: number;
  currY?: number;
  currZ?: number;
}


interface Sensor {
  Id: string;
  CSId: string;
  PlanId: string;
  SensorId: string;
  OgAngle: number;
  CurrAngle: number;
  Issue: string;
  Type: number;
  OgX: number;
  OgY: number;
  OgZ: number;
  CurrX: number;
  CurrY: number;
  CurrZ: number;
}

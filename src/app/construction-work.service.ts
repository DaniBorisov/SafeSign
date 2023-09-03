import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class ConstructionWorkService {
  private apiUrl = 'https://safesignapi.azurewebsites.net/'; // Replace with API endpoint

  private constructionWork: ConstructionWork[] = [
    {id:0,
    street:'Test',
    city:'Horsens',
    startDate:'22.02.23',
    endDate:'08.08.23',
    status:'TILT',
    planId: 898}]

  // private signs: Signs[] = [{signId:0,
  //   workId: 0,
  //   issueDate: '10.05.23',
  //   issueTime: '23:32',
  //   issue: 'Tilt'}]

  private signs: Signs[] = []

  constructor(private http: HttpClient) { }

  private hasErrorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  hasError$ = this.hasErrorSubject.asObservable();

  setHasError(hasError: boolean) {
    this.hasErrorSubject.next(hasError);
  }

  addConstructionWork(payload: any): Observable<any> {
    return this.http.post(this.apiUrl + 'ConstructionSite/fullPackage', payload);
  }


  // Delete Construction Work
  deleteConstructionWork(workId: number): Observable<any> {
    return this.http.delete(this.apiUrl + `ConstructionSite/${workId}`);
  }

  // Get Construction Work by ID
  // getConstructionWorkById(workId: number): Observable<ConstructionWork> {
  //   return this.http.get<ConstructionWork>(this.apiUrl + `plan/${workId}`);
  // }


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
    console.log("update service" + sign.id)
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
  status: string;
}

interface Signs {
  id: number;
  csId: number;
  planId: number;
  ogAngle: number;
  currAngle: number;
  issue?: string;
}

interface Plan {
  id: string;
  csId: string;
  responsible: string;
}
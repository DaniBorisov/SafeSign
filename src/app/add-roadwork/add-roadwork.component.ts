import { Component, OnInit,ViewChild,HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { ConstructionWorkService } from '../construction-work.service';
import { ModelsStatesService } from '../models-states.service';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { NgxScannerQrcodeService,ScannerQRCodeResult,NgxScannerQrcodeComponent ,ScannerQRCodeConfig } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-add-roadwork',
  templateUrl: './add-roadwork.component.html',
  styleUrls: ['./add-roadwork.component.css']
})


export class AddRoadworkComponent implements OnInit {

  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth
      },
    },
  };

  macAddress: string = ''; 
  
  @ViewChild('action') action!: NgxScannerQrcodeComponent;

  constructor(
    private router: Router,
    private constructionWorkService: ConstructionWorkService,
    private qrcode: NgxScannerQrcodeService,
    private modelsService: ModelsStatesService,
    ) { }

  showImageCont: boolean = false;
  showSignCont: boolean = false;
  isScanning: boolean = false;

  isMobileView: boolean = false;

  qrCodeResult: string | null = null;

  newConstructionWork: ConstructionWork = {
    "id": Math.floor(Math.random() * (50 - 1 + 1)) + 1,
    "planId": Math.floor(Math.random() * (47 - 1 + 1)) + 1,
    "street": '',
    "city": '',
    "startDate": '10.07.23',
    "endDate": '28.08.23',
    "status": false
  };

  signsData: Signs[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobileView = window.innerWidth <= 769; // Adjust the breakpoint as needed
  }

  ngOnInit(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  ngAfterViewInit(): void {
    this.action.isReady.subscribe((res: any) => {
      // this.handle(this.action, 'start');
    });
  }

  headerText: string = 'New Roadwork';
  showBackArrow: boolean = true;

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    if (e && e.length > 0) {
      this.qrCodeResult = e[0].value;
      const macRegex = /MAC:([^,]+)/; // Define a regular expression to match MAC address
      const match = this.qrCodeResult.match(macRegex);

      if (match && match[1]) {
        this.macAddress = match[1]; // Extract the MAC address
        console.log("MAC Address:", this.macAddress);
        console.log("event:", e);
        action.stop();
      } else {
        console.log("MAC address not found in the QR code result.");
        console.log("event:", e);
      }
    } else {
      console.log("No QR code data available.");
    }
  }

  public handle(action: any, fn: string): void {
    // Fix issue #27, #29
    const playDeviceFacingBack = (devices: any[]) => {
      // front camera or back camera check here!
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe((r: any) => console.log(fn, r), alert);
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }

  showImageContainer() {
    const imageContainer = document.getElementById("imageContainer") as HTMLElement;
    const inputContainer = document.getElementById("InputContainer") as HTMLElement;
    const confirmButton = document.querySelector(".confirm-button") as HTMLElement;
    // const confirmButtonBottom = document.querySelector(".confirm-button-bottom") as HTMLElement;
    const bottombuttonsContainer = document.getElementById("bottom-buttons") as HTMLElement;
  
    if (this.showImageCont == false) {
      imageContainer.style.display = "block";
      confirmButton.style.display = "none";
      inputContainer.style.display = "none";
      bottombuttonsContainer.style.display = "flex"
      this.showImageCont = true;
    }
    else if (this.showImageCont == true){
      imageContainer.style.display = "none";
      confirmButton.style.display = "block";
      inputContainer.style.display = "block";
      bottombuttonsContainer.style.display = "none";
      this.showImageCont = false;
    }
  }

  showSignContainer() {
    const imageContainer = document.getElementById("imageContainer") as HTMLElement;
    const signContainer = document.getElementById("signsContainer") as HTMLElement;
    const bottombuttonsContainer = document.getElementById("bottom-buttons") as HTMLElement;

    if (this.showSignCont == false) {
      imageContainer.style.display = "none";
      bottombuttonsContainer.style.display = "none"
      signContainer.style.display = "block";
      this.showSignCont = true;
    }
    // else if (this.showSignCont == true){
    //   imageContainer.style.display = "none";
    //   confirmButton.style.display = "block";
    //   inputContainer.style.display = "block";
    //   bottombuttonsContainer.style.display = "none";
    //   this.showImageCont = false;
    // }
  }

  placeOnMaster() {
    // document.getElementById('mainImage') as HTMLImageElement.src='../../assets/TestPlan.PNG';
    var img = document.getElementById('QrImage') as HTMLImageElement;
    img.src = "./assets/TestPlan.PNG"
  }

  placeNext() {
    this.qrCodeResult = null;
    this.macAddress = '';
    // Add logic to hide elements or reset any other relevant data
  }

  handleConfirmCreation() {
    this.router.navigate(['/dashboard']);
  }

  addConstructionWork() {
    const payload = {
      cSite: {
        id: this.newConstructionWork.id.toString(),
        planId: this.newConstructionWork.planId.toString(),
        city: this.newConstructionWork.city,
        street: this.newConstructionWork.street,
        startDate: this.newConstructionWork.startDate,
        endDate: this.newConstructionWork.endDate,
        mainResponsible: 'string', // Set this value as appropriate
        // status: true,
      },
      signs: this.signsData.map(sign => ({
        id: sign.id.toString(),
        csId: sign.csId.toString(),
        planId: sign.planId.toString(),
        sensorId: sign.sensorId,
        issue: sign.issue
        // ogAngle: sign.ogAngle,
        // currAngle: sign.currAngle
      }))
    };

    this.constructionWorkService.addConstructionWorkwithSignsSensors(payload)
      .subscribe(() => {
        console.log("API call successful. Adding new ConstructionWork with signs.");
        console.log("Payload." + payload);
        const updatedConstructionWorks = [...this.modelsService.getConstructionWorks(), this.newConstructionWork];
        this.modelsService.setConstructionWorks(updatedConstructionWorks);
        // Clear form fields after successful addition
        this.newConstructionWork = {
          id: 0,
          planId: 0,
          street: '',
          city: '',
          startDate: '',
          endDate: '',
          status: false
        };
        this.signsData = []; // Clear the signs data as well

      },
      error => {
        console.error("API call failed:", error);
      }
      );

    this.router.navigate(['/dashboard']);
  }



  addSign() {
    const newId = Number(`${this.newConstructionWork.id}${ Math.floor(Math.random() * (200 - 1 + 1)) + 1}`);
    const newSign: Signs = {
      "id": newId,
      "csId": this.newConstructionWork.id,
      "planId":  this.newConstructionWork.planId,
      "ogAngle": 60,
      "currAngle": 60,
      "sensorId": this.macAddress,
      "issue": "OK"
    };
    const updatedsigns = [...this.modelsService.getSigns(), newSign];
    this.modelsService.setSigns(updatedsigns);
    console.log("psuh new sign into storage",updatedsigns)
    this.signsData.push(newSign);
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
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConstructionWorkService } from '../construction-work.service';

@Component({
  selector: 'app-add-roadwork',
  templateUrl: './add-roadwork.component.html',
  styleUrls: ['./add-roadwork.component.css']
})
export class AddRoadworkComponent implements OnInit {

  constructor(private router: Router,private constructionWorkService: ConstructionWorkService) { }

  showImageCont: boolean = false;
  showSignCont: boolean = false;

  newConstructionWork: ConstructionWork = {
    "id": Math.floor(Math.random() * (50 - 1 + 1)) + 1,
    "planId": Math.floor(Math.random() * (47 - 1 + 1)) + 1,
    "street": '',
    "city": '',
    "startDate": '10.07.23',
    "endDate": '28.08.23',
    "status": ''
  };

  signsData: Signs[] = [];

  ngOnInit(): void {
  }

  headerText: string = 'New Roadwork';
  showBackArrow: boolean = true;

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
    img.src = "../../assets/TestPlan.PNG"
  }

  handleConfirmCreation() {
    this.router.navigate(['/dashboard']);
  }

  addConstructionWork() {
    const payload = {
      csSite: {
        id: this.newConstructionWork.id.toString(),
        planId: this.newConstructionWork.planId.toString(),
        city: this.newConstructionWork.city,
        street: this.newConstructionWork.street,
        startDate: this.newConstructionWork.startDate,
        endDate: this.newConstructionWork.endDate,
        mainResponsible: 'string', // Set this value as appropriate
        // signIds: this.signsData.map(sign => sign.id.toString())
      },
      signs: this.signsData.map(sign => ({
        id: sign.id.toString(),
        csId: sign.csId.toString(),
        planId: sign.planId.toString(),
        ogAngle: sign.ogAngle,
        currAngle: sign.currAngle
      }))
    };

    this.constructionWorkService.addConstructionWork(payload)
      .subscribe(() => {
        // Clear form fields after successful addition
        this.newConstructionWork = {
          id: 0,
          planId: 0,
          street: '',
          city: '',
          startDate: '',
          endDate: '',
          status: 'OK'
        };
        this.signsData = []; // Clear the signs data as well
      });
    console.log("diddd " + this.newConstructionWork.id)
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
    };
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

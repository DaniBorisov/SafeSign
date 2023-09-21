import { Component, HostListener, OnInit, ElementRef, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ConstructionWorkService } from '../construction-work.service';
import { Subscription, forkJoin, switchMap, take } from 'rxjs';

import { ModelsStatesService } from '../models-states.service'; // Import your shared service



function mapReceivedSignToInterface(sign: any): Signs {
  return {
    id: sign.Id,
    csId: sign.CSId,
    planId: sign.PlanId,
    sensorId: sign.SensorId,
    ogAngle: sign.OgAngle,
    currAngle: sign.CurrAngle,
    issue: sign.Issue,
    ogX: sign.OgX,
    ogY: sign.OgY,
    ogZ: sign.OgZ,
    currX: sign.CurrX,
    currY: sign.CurrY,
    currZ: sign.CurrZ
     // Map any other properties as needed
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  @ViewChild('notificationSound', { static: true }) notificationSound!: ElementRef;
  
  hasError: boolean = false;
  csRetrived: boolean = false;
  soundPlayed: boolean = false;
  hasAngleIssue: boolean = false;

  cards = [
    {img: './assets/icons8-plus.svg', content: 'New RoadWork'},
    {img: './assets/icons8-close.svg', content: 'Close Roadwork'},
    {img: './assets/icons8-list-48.png', content: 'Log Overview'},
    {img: './assets/icons8-user-account-26.png', content: 'Contact List'},
    {img: './assets/icons8-settings.svg', content: 'App Settings'},
    {img: './assets/icons8-account-50.png', content: 'Account Settings'},
  ]

  constructionWorks: ConstructionWork[] = [];
  
  private signUpdateSubscription!: Subscription;
  private sensorUpdateSubscription!: Subscription;

  constructor(
    private router: Router,
    private constructionWorkService: ConstructionWorkService,
    private modelsService: ModelsStatesService,
    ) {}

  ngOnInit(): void {
    this.getConstructionWorks();
    this.getSigns();
    this.subscribeToSignUpdates1();
  }

  ngOnChanges():void {
    this.getConstructionWorks();
    this.getSigns();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the sign update subscription when the component is destroyed
    if (this.signUpdateSubscription) {
      this.signUpdateSubscription.unsubscribe();
    }
    if (this.sensorUpdateSubscription) {
      this.sensorUpdateSubscription.unsubscribe();
    }
  }

// Main functionalities

getConstructionWorks() {
  this.constructionWorkService.getAllConstructionWork()
    .subscribe((works: ConstructionWork[]) => {
    
      // Store the data in SessionStorage
      sessionStorage.setItem('constructionWorks', JSON.stringify(works));
      console.log("get constructionworjs",works )
      const observables = works.map(work => {
        return this.modelsService.signs$.pipe(
          take(1), // Take only one emission from the observable
          switchMap(() => this.constructionWorkService.getSignsByWorkId(work.id))
        );
      });

      forkJoin(observables).subscribe((responses: Signs[][]) => {
        for (let i = 0; i < works.length; i++) {
          const signs = responses[i];
          this.hasAngleIssue = signs.some(sign =>  Math.abs(sign.ogAngle - sign.currAngle) > 5 || 
                                                    Math.abs(sign.ogX! - sign.currX!) > 40 ||
                                                    Math.abs(sign.ogY! - sign.currY!) > 40 ||
                                                    Math.abs(sign.ogZ! - sign.currZ!) > 40);
          console.log("hasAngleissue",this.hasAngleIssue)                                          
          works[i].status = this.hasAngleIssue;
        }
        this.modelsService.setConstructionWorks(works);
        this.csRetrived = true;
      });
    });
}

getSigns() {
  this.constructionWorkService.getAllSigns()
    .subscribe((signs: Signs[]) => {
      this.modelsService.setSigns(signs);
   });
}
  isStatusOK(): boolean {
    const constructionWorks = this.modelsService.getConstructionWorks();
    if (this.csRetrived) {
       // Get constructionWorks from the service
      console.log("isStatusOK",constructionWorks)
      for (let work of constructionWorks) {
        if (work.status === undefined) {
          break;
        }
        if (work.status || this.hasAngleIssue) {
          if (!this.soundPlayed) {
            this.playNotificationSound();
            this.soundPlayed = true;
          }
          return false;
        }
      }
    }
    this.soundPlayed = false;
    return true;
  }


  //  trigger function subsribtions

  private subscribeToSignUpdates1(): void {
    // console.log("subscribe! Sensors",this.constructionWorkService.sensorUpdate$);
    this.sensorUpdateSubscription = this.constructionWorkService.sensorUpdate$
      .subscribe((receivedSign: any) => {
        console.log(" DASHBOARD | Subscribe object received",receivedSign);
        // Handle the received sign update
        if (receivedSign) {
          // Map the received sign to match the local interface naming
          const sign = mapReceivedSignToInterface(receivedSign);
          console.log("DASHBOARD | Subscribe  MAPPED SIGN: " , sign)
          this.modelsService.setSigns([sign]);
          console.log("DASHBOARD | Subscribe  Calling update " , sign)
          this.constructionWorkService.updateSign(sign)

          // Get the construction works from the service
          const constructionWorks = this.modelsService.getConstructionWorks();
          const workToUpdate = constructionWorks.find(work => work.id === sign.csId);
          if (workToUpdate) {
            console.log("Dashboard | subsribe sign issue: ",sign.issue)
            if (sign.issue !== "OK" && sign.issue !== "") {     
              workToUpdate.status = true;
            } else {
              workToUpdate.status = false;
            }
            // console.log("all constructionworks AFTER UPDATE OF STATUS",constructionWorks);
            this.modelsService.setConstructionWorks([...constructionWorks]);
          }
        }
      });
  }


// View Controls

  playNotificationSound() {
    const audioElement: HTMLAudioElement = this.notificationSound.nativeElement;

    if (audioElement) {
      audioElement.play();
    }
  }


  handleCardClick(card: any): void {
    switch (card.content) {
      case 'New RoadWork': {
        this.router.navigate(['/add-roadwork']);
        break;
      }
      case 'Close Roadwork': {
        this.router.navigate(['/close-roadwork']);
        break;
      }
      case 'Contact List': {
        // this.router.navigate(['/add-roadwork']);
        alert('Card clicked' + card.content);
        break;
      }
      case 'App Settings': {
        // this.router.navigate(['/add-roadwork']);
        alert('Card clicked' + card.content);
        break;
      }
      case 'Account Settings': {
        // this.router.navigate(['/add-roadwork']);
        alert('Card clicked' + card.content);
        break;
      }
    }
  }

  handleCardClickStatus(): void {
    this.router.navigate(['/status']);
  }
}


// Interfaces

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
  ogX?: number;
  ogY?: number;
  ogZ?: number;
  currX?: number;
  currY?: number;
  currZ?: number;
}

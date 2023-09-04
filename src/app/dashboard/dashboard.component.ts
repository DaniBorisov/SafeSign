import { Component, HostListener, OnInit, ElementRef, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ConstructionWorkService } from '../construction-work.service';
import { Subscription } from 'rxjs';



function mapReceivedSignToInterface(sign: any): Signs {
  return {
    id: sign.Id,
    csId: sign.CSId,
    planId: sign.PlanId,
    ogAngle: sign.OgAngle,
    currAngle: sign.CurrAngle,
    issue: sign.Issue // Map any other properties as needed
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

  constructor(private router: Router, private constructionWorkService: ConstructionWorkService) {}

  ngOnInit(): void {
    this.getConstructionWorks();
    this.subscribeToSignUpdates(); // Subscribe to sign updates
  }

  ngOnUpdate():void {
    // this.getConstructionWorks();
    // this.subscribeToSignUpdates();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the sign update subscription when the component is destroyed
    if (this.signUpdateSubscription) {
      this.signUpdateSubscription.unsubscribe();
    }
  }

  playNotificationSound() {
    const audioElement: HTMLAudioElement = this.notificationSound.nativeElement;

    if (audioElement) {
      audioElement.play();
    }
  }
  // private subscribeToSignUpdates(): void {
  //   console.log("subsribe!")
  //   this.signUpdateSubscription = this.constructionWorkService.signUpdate$
  //     .subscribe((sign: Signs) => {
  //       // Handle the received sign update
  //       if (sign) {
  //         // Find the construction work item that corresponds to the received sign.
  //         console.log("sign.csId")
  //         console.log(sign)
  //         const workToUpdate = this.constructionWorks.find(work => work.id === sign.csId);
  //         console.log(workToUpdate)
  //         if (workToUpdate) {
  //           // Update the sign information in the construction work item
  //           console.log("Work status updates after sign change.")
  //           workToUpdate.status = sign.issue;
  //           // You can also update any other relevant properties here
  //         }
  //       }
  //     });
  // }

  private subscribeToSignUpdates(): void {
    console.log("subscribe!");
    this.signUpdateSubscription = this.constructionWorkService.signUpdate$
      .subscribe((receivedSign: any) => {
        // Handle the received sign update
        if (receivedSign) {
          // Map the received sign to match the local interface naming
          const sign = mapReceivedSignToInterface(receivedSign);
  
          // Find the construction work item that corresponds to the received sign.
          console.log("sign.csId")
          console.log(sign)
          const workToUpdate = this.constructionWorks.find(work => work.id === sign.csId);
          console.log(workToUpdate)
          if (workToUpdate) {
            // Update the sign information in the construction work item
            console.log("Work status updates after sign change.")
            const angleDifference = Math.abs(sign.ogAngle - sign.currAngle);
            if (angleDifference > 5) {
              workToUpdate.status = 'Angle issue';
            } else {
              workToUpdate.status = 'OK';
            }
            // You can also update any other relevant properties here
          }
        }
      });
  }

  isStatusOK(): boolean {
    // console.log(this.csRetrived)
    if (this.csRetrived)
    {
      for (let work of this.constructionWorks) {
        console.log("work with id " + work.id + " has staus : " + work.status)
        if ( work.status == undefined) 
          break
        if (work.status !== 'OK') {
          if (!this.soundPlayed)
          {
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

  getConstructionWorks() {
    this.constructionWorkService.getAllConstructionWork()
      .subscribe((works: ConstructionWork[]) => {
        this.constructionWorks = works;
        // console.log("COnstruction works subscribe ")
        // Iterate through constructionWorks to update status
        for (let work of this.constructionWorks) {
          this.constructionWorkService.getSignsByWorkId(work.id)
            .subscribe((signs: Signs[]) => {
              const hasAngleIssue = signs.some(sign => Math.abs(sign.ogAngle - sign.currAngle) > 5);
              // console.log("sign  subscribe ")
              if (hasAngleIssue) {
                work.status = 'Angle issue';
              } else {
                work.status = 'OK';
              }
              this.csRetrived = true;
            });
        }
      });
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

interface ConstructionWork {
  id: number;
  planId: number;
  street: string;
  city: string;
  startDate: string;
  endDate: string;
  status?: string;
}

interface Signs {
  id: number;
  csId: number;
  planId: number;
  ogAngle: number;
  currAngle: number;
  issue?: string;
}

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
  private sensorUpdateSubscription!: Subscription;

  constructor(
    private router: Router,
    private constructionWorkService: ConstructionWorkService,
    private modelsService: ModelsStatesService,
    ) {}

  ngOnInit(): void {
    this.getConstructionWorks();
    this.getSigns();
    this.subscribeToSignUpdates();
    this.subscribeToSignUpdates1();
    // this.subscribeToSensorUpdate(); // Subscribe to sign updates
  }

  ngOnUpdate():void {
    this.getConstructionWorks();
    this.getSigns();
    // this.subscribeToSignUpdates();
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
          const hasAngleIssue = signs.some(sign =>  Math.abs(sign.ogAngle - sign.currAngle) > 5 || 
                                                    Math.abs(sign.ogX! - sign.currX!) > 20 ||
                                                    Math.abs(sign.ogY! - sign.currY!) > 20 ||
                                                    Math.abs(sign.ogZ! - sign.currZ!) > 20);
          console.log("hasAngleissue",hasAngleIssue)                                          
          works[i].status = hasAngleIssue;
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

  // getConstructionWorks() {
  //   this.constructionWorkService.getAllConstructionWork()
  //     .subscribe((works: ConstructionWork[]) => {
  //       // Use the shared object service to set constructionWorks
  //       this.modelsService.setConstructionWorks(works);

  //       for (let work of works) {
  //         this.constructionWorkService.getSignsByWorkId(work.id)
  //           .subscribe((signs: Signs[]) => {
  //             const hasAngleIssue = signs.some(sign => Math.abs(sign.ogAngle - sign.currAngle) > 5);
  //             if (hasAngleIssue) {
  //               work.status = 'Angle issue';
  //             } else {
  //               work.status = 'OK';
  //             }
  //             this.csRetrived = true;
  //           });
  //       }
  //     });
  // }



  // isStatusOK(): boolean {
  //   if (this.csRetrived) {
  //     const constructionWorks = this.modelsService.getConstructionWorks(); // Get constructionWorks from the service
  //   console.log("isStatusOK")
  //     for (let work of constructionWorks) {
  //       console.log("work status",work.status)
  //       if (work.status === undefined) {
  //         break;
  //       }
  //       if (work.status) {
  //         if (!this.soundPlayed) {
  //           this.playNotificationSound();
  //           this.soundPlayed = true;
  //         }
  //         return false;
  //       }
  //     }
  //   }
  //   this.soundPlayed = false;
  //   return true;
  // }



  isStatusOK(): boolean {
    const constructionWorks = this.modelsService.getConstructionWorks();
    if (this.csRetrived) {
       // Get constructionWorks from the service
      console.log("isStatusOK",constructionWorks)
      for (let work of constructionWorks) {
        console.log("works status: ",work.status)
        if (work.status === undefined) {
          break;
        }
        if (work.status) {
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

  private subscribeToSignUpdates(): void {
    console.log("subscribe! Signs",this.constructionWorkService.signUpdate$);
    this.signUpdateSubscription = this.constructionWorkService.signUpdate$
      .subscribe((receivedSign: any) => {
        console.log(" object received",receivedSign)
        // Handle the received sign update
        if (receivedSign) {

          const sign = mapReceivedSignToInterface(receivedSign);
          const constructionWorks = this.modelsService.getConstructionWorks();
          // Find the construction work item that corresponds to the received sign.

          this.modelsService.setSigns([sign]);
          const workToUpdate = constructionWorks.find(work => work.id === sign.csId);

          console.log("all constructionworks",constructionWorks);
          console.log("work to update",workToUpdate);

          if (workToUpdate) {
            // Update the sign information in the construction work item
            console.log("Work status updates after sign change.")
            const angleDifference = Math.abs(sign.ogAngle - sign.currAngle);
            if (angleDifference > 5) {
              workToUpdate.status == true;
            } else {
              workToUpdate.status == false;
            }
            console.log("Work status updates after sign change.",workToUpdate)
            // You can also update any other relevant properties here
            console.log("all constructionworks AFTER UPDATE OF STATUS",constructionWorks);
            // Update the construction works in the service
            this.modelsService.setConstructionWorks([...constructionWorks]);
            console.log("all constructionworks AFTER UPDATE OF STATUS",constructionWorks);
          }
        }
      });
  }

  private subscribeToSignUpdates1(): void {
    console.log("subscribe! Sensors",this.constructionWorkService.sensorUpdate$);
    this.sensorUpdateSubscription = this.constructionWorkService.sensorUpdate$
      .subscribe((receivedSign: any) => {
        console.log(" object received",receivedSign);
        // Handle the received sign update
        if (receivedSign) {
          // Map the received sign to match the local interface naming
          const sign = mapReceivedSignToInterface(receivedSign);
  
          // Get the construction works from the service
          const constructionWorks = this.modelsService.getConstructionWorks();
          const workToUpdate = constructionWorks.find(work => work.id === sign.csId);
          if (workToUpdate) {
            // Update the sign information in the construction work item
            if (receivedSign.issue !== "Angle issue") {
              workToUpdate.status == false;
            } else {
              workToUpdate.status == true;
            }
            // Update the construction works in the service
            this.modelsService.setConstructionWorks([...constructionWorks]);
          }
        }
      });
  }


// Local Objects methods

// getConstructionWorks() {
//   this.constructionWorkService.getAllConstructionWork()
//     .subscribe((works: ConstructionWork[]) => {
//       this.constructionWorks = works;
//       // console.log("COnstruction works subscribe ")
//       // Iterate through constructionWorks to update status
//       for (let work of this.constructionWorks) {
//         this.constructionWorkService.getSignsByWorkId(work.id)
//           .subscribe((signs: Signs[]) => {
//             const hasAngleIssue = signs.some(sign => Math.abs(sign.ogAngle - sign.currAngle) > 5);
//             // console.log("sign  subscribe ")
//             if (hasAngleIssue) {
//               work.status = 'Angle issue';
//             } else {
//               work.status = 'OK';
//             }
//             this.csRetrived = true;
//           });
//       }
//     });
// }


//   isStatusOK(): boolean {
//   // console.log(this.csRetrived)
//   if (this.csRetrived)
//   {
//     for (let work of this.constructionWorks) {
//       // console.log("work with id " + work.id + " has staus : " + work.status)
//       if ( work.status == undefined) 
//         break
//       if (work.status !== 'OK') {
//         if (!this.soundPlayed)
//         {
//           this.playNotificationSound();
//           this.soundPlayed = true;
//         }
//         return false;
//       }
//     }
//   }
//   this.soundPlayed = false;
//   return true;
// }

// private subscribeToSignUpdates(): void {
//   console.log("subscribe!");
//   this.signUpdateSubscription = this.constructionWorkService.signUpdate$
//     .subscribe((receivedSign: any) => {
//       // Handle the received sign update
//       if (receivedSign) {
//         // Map the received sign to match the local interface naming
//         const sign = mapReceivedSignToInterface(receivedSign);

//         // Find the construction work item that corresponds to the received sign.
//         console.log("sign.csId")
//         console.log(sign)
//         const workToUpdate = this.constructionWorks.find(work => work.id === sign.csId);
//         console.log(workToUpdate)
//         if (workToUpdate) {
//           // Update the sign information in the construction work item
//           console.log("Work status updates after sign change.")
//           const angleDifference = Math.abs(sign.ogAngle - sign.currAngle);
//           if (angleDifference > 5) {
//             workToUpdate.status = 'Angle issue';
//           } else {
//             workToUpdate.status = 'OK';
//           }
//           // You can also update any other relevant properties here
//         }
//       }
//     });
// }





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
  ogAngle: number;
  currAngle: number;
  issue?: string;
  ogX?: number;
  ogY?: number;
  ogZ?: number;
  currX?: number;
  currY?: number;
  currZ?: number;
}

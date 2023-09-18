import { Component, HostListener, OnInit} from '@angular/core';
import { ConstructionWorkService } from '../construction-work.service';

import { ModelsStatesService } from '../models-states.service'; // Import your shared service

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})

export class StatusComponent implements OnInit {

  selectedConstructionWork: any;
  selectedCard: any;
  isMobileView: boolean = false;
    
  // leftSideWidth = '30%';
  // rightSideWidth = '70%';
  leftSideFlex = '0 0 30%';
  rightSideFlex = '1 1 70%';

  searchText: string = '';
  constructionWorks: ConstructionWork[] = [];
  allSigns:Signs[] =[];
  retrievedSigns: Signs[] = [];

  constructor(
    private constructionWorkService: ConstructionWorkService,
    private modelsService: ModelsStatesService,
    ) { }

  ngOnInit(): void {
         // Check if constructionWorks data is available in SessionStorage

    const constructionWorksData = sessionStorage.getItem('constructionWorks');
    const signsData = sessionStorage.getItem('signs');

    console.log("---------------")
    console.log(constructionWorksData)

    console.log("---------------")
    console.log(signsData)
    if (constructionWorksData) {
      // Data is available in SessionStorage, parse and use it
      this.constructionWorks = JSON.parse(constructionWorksData);
      // this.getSigns(); // You can call getSigns() here if needed
    } else {

    }

    if(signsData){
      this.allSigns = JSON.parse(signsData);
    }
    else{
      this.getSigns()
    }

    // this.getConstructionWorks();
    this.getSigns()
    this.checkViewport();


    // this.modelsService.constructionWorks$.subscribe((works: ConstructionWork[]) => {
    //   this.constructionWorks = works;
    //   // console.log("get all C Works" + this.constructionWorks);
    // });

    this.modelsService. signs$.subscribe((signs:Signs[]) => {
    this.allSigns = signs;

      // console.log("get all Signs Status" + this.allSigns);
    });
  }

  // Main functionallities

// using shared model

getSigns() {
  this.constructionWorkService.getAllSigns()
    .subscribe((signs: Signs[]) => {
      this.modelsService.setSigns(signs);
   });
}


retrieveSignsByWorkId(card: any) {
  console.log("all signs", this.allSigns)
  this.selectedConstructionWork = card;
  const signsData = sessionStorage.getItem('signs');
  if (this.allSigns) {
    // Data is available in SessionStorage, parse and use it
    // const signs: Signs[] = JSON.parse(signsData);
    this.retrievedSigns = this.allSigns.filter(sign => {
      return Number(sign.csId) === Number(card.id);
    });
    console.log("retrived", this.retrievedSigns)
  } 
}

  hasIssues(workId: number): boolean {
    const selectedWork = this.constructionWorks.find(work => work.id === workId);
    const relatedSigns = this.allSigns.filter(sign => sign.csId === workId);
    
    let hasIssue = false;

    relatedSigns.forEach(sign => {
      if (Math.abs(sign.currAngle - sign.ogAngle) > 5 ||
          Math.abs(sign.currX! - sign.ogX!) > 20 ||
          Math.abs(sign.currY! - sign.ogY!) > 20 ||
          Math.abs(sign.currZ! - sign.ogZ!) > 20 ) {
        sign.issue = "Angle Issue";
        hasIssue = true;
      } else {
        sign.issue = "OK";
      }   
    });
  
    if(selectedWork){
      selectedWork.status = hasIssue ;
    }
    return hasIssue;
  }

  UpdateAngle(Id: number, workId: number) {
    const selectedSign = this.allSigns.find(sign => sign.csId === workId && sign.id === Id);
  
    if (selectedSign) {
      console.log('Updated sign id:' + Id + "  workid  " + workId); // Debug line
      console.log('Updated selectedSign:', selectedSign); // Debug line
      console.log('Updated selected Card:',this.selectedCard); // Debug line
  
      // Set currAngle to ogAngle
      selectedSign.currAngle = selectedSign.ogAngle;
  
      this.constructionWorkService.updateSign(selectedSign)
        .subscribe(() => {
          console.log("Sign updated successfully!");
  
          // Check the angle after updating
          this.constructionWorkService.checkSignAngle(selectedSign)
            .subscribe(() => {
              console.log("Sign angle Correct!");

              if (Math.abs(selectedSign.currAngle - selectedSign.ogAngle) > 5) {
                selectedSign.issue = "Angle Issue";
                this.selectedCard.issue = "Angle Issue";
              } else {
                selectedSign.issue = "OK";
                this.selectedCard.issue = "OK";
                selectedSign.currAngle = selectedSign.ogAngle;
                this.selectedCard.currAngle = this.selectedCard.ogAngle;
              }
              
              this.retrievedSigns = this.retrievedSigns.map(sign => {
                if (sign.csId === workId && sign.id === Id) {
                  return selectedSign; // Replace the matching sign with the updated one
                }
                return sign; // Keep other signs unchanged
              });
            });
        });
    }
  }


  get filteredConstructionWorks(): ConstructionWork[] {
    if (!this.searchText) {
      return this.constructionWorks;
    } else {
      // Search text entered, filter construction works based on the search text
      const searchText = this.searchText.toLowerCase();
      return this.constructionWorks.filter(work => {
        return work.street.toLowerCase().includes(searchText) || work.city.toLowerCase().includes(searchText);
      });
    }
  }

  //  View Controls

  startResize(event: MouseEvent) {
    event.preventDefault();
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  resize = (event: MouseEvent) => {
    const splitPageWidth = document.querySelector('.split-page')?.clientWidth || 0;
    const x = event.pageX;
    const leftSideWidth = ((x / splitPageWidth) * 100).toFixed(2);
    this.leftSideFlex = `0 0 ${leftSideWidth}%`;
    this.rightSideFlex = `1 1 ${100 - Number(leftSideWidth)}%`;
  };

  stopResize = () => {
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResize);
  };

  showDetails(card: any) {
    // console.log(card)
    this.selectedCard = card;
  }

  showSigns(card:any){

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkViewport();
  }

  checkViewport() {
    this.isMobileView = window.innerWidth <= 767; // Adjust the breakpoint as needed
  }

  goBack() {
    this.selectedCard = null;

  }

  goBackSigns() {
    this.hasIssues(this.selectedConstructionWork.id);
    this.selectedConstructionWork = null;
    this.selectedCard = null;
    this.retrievedSigns = [];
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


// using local objects

  // getConstructionWorks() {
  //   this.constructionWorkService.getAllConstructionWork()
  //     .subscribe((works: ConstructionWork[]) => {
  //       this.constructionWorks = works
  //       console.log("get all C Works" +this.constructionWorks);
  //     });
  // }

  // getSigns() {
  //   this.constructionWorkService.getAllSigns()
  //     .subscribe((signs: Signs[]) => {
  //       this.allSigns = signs.map(sign => ({ ...sign, issue: 'OK' }));
  //       console.log("get all signs : " + this.allSigns[0].issue);
  //       this.constructionWorks.forEach(work => {
  //         if (this.hasIssues(work.id)) {
  //           work.status = "Angle Issue";
  //         }
  //       });
  //     });
  // }



  // retrieveSignsByWorkId(card: any) {
  //   this.selectedConstructionWork = card;
  //   this.constructionWorkService.getSignsByWorkId(card.id)
  //     .subscribe((signs) => {
  //       this.retrievedSigns = signs.map(sign => {
  //         if (Math.abs(sign.currAngle - sign.ogAngle) > 5) {
  //           sign.issue = "Angle Issue";
  //         } else {
  //           sign.issue = "OK";
  //         }
  //         return sign;
  //       });
  
  //       // Update the issue and status fields for the selected construction work
  //       this.selectedConstructionWork.status = this.retrievedSigns.some(sign => sign.issue === "Angle Issue") ? "Angle Issue" : "OK";
  //     });
  // }

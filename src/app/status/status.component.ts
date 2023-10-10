import { Component, HostListener, OnInit} from '@angular/core';
import { ConstructionWorkService } from '../construction-work.service';

import { ModelsStatesService } from '../models-states.service'; // Import your shared service
import { catchError, switchMap, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})

export class StatusComponent implements OnInit {

  selectedConstructionWork: any;
  selectedCard: any;
  isMobileView: boolean = false;
  hasIssue: boolean = false;
  testSIngs:Signs[] =[];
    
  // leftSideWidth = '30%';
  // rightSideWidth = '70%';
  leftSideFlex = '0 0 30%';
  rightSideFlex = '1 1 70%';

  axisXIssue = false;
  axisYIssue = false;
  axisZIssue = false;

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

    console.log("STATUS | ON init constructionWorksData",constructionWorksData)
    console.log("STATUS | ON init signsData",signsData)

    if (constructionWorksData) {
      // Data is available in SessionStorage, parse and use it
      this.constructionWorks = JSON.parse(constructionWorksData);
      // this.getSigns(); // You can call getSigns() here if needed
    }

    if(signsData){
      this.allSigns = JSON.parse(signsData);
    }
    // else{
    //   this.getSigns()
    // }


    this.getSigns()
    this.checkViewport();

    // this.modelsService. signs$.subscribe((signs:Signs[]) => {
    // this.allSigns = signs;

    // });
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
  // console.log("all signs", this.allSigns)
  this.selectedConstructionWork = card;
  // const signsData = sessionStorage.getItem('signs');
  if (this.allSigns) {
    this.retrievedSigns = this.allSigns.filter(sign => {
      return Number(sign.csId) === Number(card.id);
    });
    // console.log("retrived", this.retrievedSigns)
  } 
}

  hasIssues(workId: number): boolean {
    const selectedWork = this.constructionWorks.find(work => work.id === workId);
    const relatedSigns = this.allSigns.filter(sign => sign.csId === workId);


    let hasXIssue = false;
    let hasYIssue = false;
    let hasZIssue = false;
    
    // console.log("STATUS | HAS ISSUEz Related sign: " , relatedSigns)
    // console.log("STATUS | HAS ISSUE Selected card", this.selectedCard)
    // relatedSigns.forEach(sign => {
    //   // console.log("STATUS | HAS ISSUEz SIGN ISSUE: " , sign.issue)
    //   if (sign.issue !== "OK" )
    //   {
    //     this.hasIssue = true;
    //   }
    // });

    relatedSigns.forEach(sign => {
      if (sign.issue.includes('X')) {
        hasXIssue = true;
      }
      if (sign.issue.includes('Y')) {
        hasYIssue = true;
      }
      if (sign.issue.includes('Z')) {
        hasZIssue = true;
      }
    });
  
    if(selectedWork){
      // selectedWork.status = this.hasIssue ;
      // this.axisXIssue = hasXIssue;
      // this.axisYIssue = hasYIssue;
      // this.axisZIssue = hasZIssue;
      selectedWork.status = hasXIssue || hasYIssue || hasZIssue;
    }
    this.hasIssue = hasXIssue || hasYIssue || hasZIssue;
    return this.hasIssue;
  }

  // UpdateAngle(Id: number, workId: number) {
  //   const selectedSign = this.allSigns.find(sign => sign.csId === workId && sign.id === Id);
  //   console.log("STATUS | UpdateAngle slelected mac:",selectedSign?.sensorId )
  //   if (!selectedSign) {
  //         return; // Exit early if selectedSign is not foundS
  //       }
  //   const tempIssue = selectedSign.issue;
  //   const tempcurrX = selectedSign.currX;
  //   const tempcurrY = selectedSign.currY;
  //   const tempcurrZ = selectedSign.currZ;
  //     // Set currAngle to ogAngle
  //   selectedSign.currX = selectedSign.ogX;
  //   selectedSign.currY = selectedSign.ogY;
  //   selectedSign.currZ = selectedSign.ogZ;
  //   selectedSign.issue = "OK";

  //     console.log("STATUS | UpdateAngle selectedSign: " , selectedSign)
  //     this.constructionWorkService.updateSign(selectedSign)
  //     .pipe(
  //       tap(() => {
  //         console.log("Sign updated successfully!");

  //         selectedSign.issue = "OK";
  //         // this.selectedCard.issue = "OK";
  //         // this.selectedCard.currAngle = this.selectedCard.ogAngle;
  //         selectedSign.currX = selectedSign.ogX;
  //         // this.selectedCard.currX = this.selectedCard.ogX;
  //         selectedSign.currY = selectedSign.ogY;
  //         // this.selectedCard.currY = this.selectedCard.ogY;
  //         selectedSign.currX = selectedSign.ogX;
  //         // this.selectedCard.currZ = this.selectedCard.ogZ;
          
  //       }),
  //       catchError(error => {
  //         // Handle the error case here if needed
  //         selectedSign.currX = tempcurrX;
  //         selectedSign.currY = tempcurrY;
  //         selectedSign.currZ = tempcurrZ;
  //         if(tempIssue === "")
  //         {
  //           selectedSign.issue = "OK";
  //         }
  //         else
  //         {
  //           selectedSign.issue = tempIssue;
  //         }
  //         console.error("Error updating sign:", error);
  //         return throwError("Failed to update sign",error);
  //       })
  //     )
  //     .subscribe(() => {

  //       this.retrievedSigns = this.retrievedSigns.map(sign => {
  //         if (sign.csId === workId && sign.id === Id) {
  //           console.log(" LOG FOR Updated selected sign objrect" ,selectedSign );
  //           return selectedSign; // Replace the matching sign with the updated one
  //         }
  //         return sign; // Keep other signs unchanged

  //       });
  //   });
  // }

  UpdateAngle(Id: number, workId: number) {
    const selectedSign = this.allSigns.find(sign => sign.csId === workId && sign.id === Id);
    console.log("STATUS | UpdateAngle slelected mac:",selectedSign?.sensorId )
    if (selectedSign) {
      // console.log('Updated sign id:' + Id + "  workid  " + workId); // Debug line
      // console.log('Updated selectedSign:', selectedSign); // Debug line
      // console.log('Updated selected Card:',this.selectedCard); // Debug line
  
      // Set currAngle to ogAngle
      selectedSign.currAngle = selectedSign.ogAngle;
      selectedSign.currX = selectedSign.ogX;
      selectedSign.currY = selectedSign.ogY;
      selectedSign.currZ = selectedSign.ogZ;
      selectedSign.issue = "OK";

      console.log("STATUS | UpdateAngle selectedSign: " , selectedSign)
      

      this.constructionWorkService.checkSignAngle(selectedSign)
            .subscribe(() => {
              console.log("Sign angle Correct!");
      // this.constructionWorkService.updateSign(selectedSign)
      //   .subscribe(() => {
      //     console.log("Sign updated successfully!");
  
          // Check the angle after updating
          // this.constructionWorkService.checkSignAngle(selectedSign)
          //   .subscribe(() => {
          //     console.log("Sign angle Correct!");
          this.constructionWorkService.updateSign(selectedSign)
          .subscribe(() => {
            console.log("Sign updated successfully!");
            
              // console.log("+++++++++++++  issue ======" ,selectedSign.issue )
              if (selectedSign.issue === "Angle Issue")
              {
                selectedSign.issue = "Angle Issue";
                this.selectedCard.issue = "Angle Issue";
              }
              else
              {
                selectedSign.issue = "OK";
                this.selectedCard.issue = "OK";
                selectedSign.currAngle = selectedSign.ogAngle;
                this.selectedCard.currAngle = this.selectedCard.ogAngle;
                selectedSign.currX = selectedSign.ogX;
                this.selectedCard.currX = this.selectedCard.ogX;
                selectedSign.currY = selectedSign.ogY;
                this.selectedCard.currY = this.selectedCard.ogY;
                selectedSign.currX = selectedSign.ogX;
                this.selectedCard.currZ = this.selectedCard.ogZ;
              }
              
              this.retrievedSigns = this.retrievedSigns.map(sign => {
                if (sign.csId === workId && sign.id === Id) {
                  // console.log(" LOG FOR Updated selected sign objrect" ,selectedSign );
                  this.axisXIssue = false;
                  this.axisYIssue = false;
                  this.axisZIssue = false;
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

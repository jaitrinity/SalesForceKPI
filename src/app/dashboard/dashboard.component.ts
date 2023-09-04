import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '../services/ConfigService';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, transition, style, sequence, animate } from '@angular/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface DialogData {
  regName: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations : [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-550px)', 'box-shadow': 'none' }),
        sequence([
          animate(".35s ease", style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none'  })),
          animate(".35s ease", style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
        ])
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {

  displayedColumns: string[] = ['Type', 'Registration', 'Total_Visit', 'Total_Unique_Visit', 'Pending'];
  attendanceDisColumn: string[] = ['Type',"Total_Attendance"];
  inProgress : boolean = false;
  kpiData;
  attendanceData;
  visitData = [];

  empId = "";
  period = "YTD";
  
  constructor(private route: ActivatedRoute, public dialog: MatDialog,
    private configService : ConfigService) { 
    this.route.queryParams.subscribe(params => {
      this.empId = params['empId'];
    });
  }
  

  ngOnInit(): void {
    this.getKpiData();
  }

  getKpiData(){
    this.inProgress = true;
    let jsonData = {
      empId : this.empId,
      period : this.period
    }
    this.configService.getPostRequestData(jsonData, "getKpiData")
      .subscribe(response => {
        // console.log(JSON.stringify(response));
        this.visitData = response.wrappedList;
        let attData = [{
          'type': 'Total_Attendance',
          'total': response.totalAttendance
        }]
        this.kpiData = new MatTableDataSource<object>(this.visitData);
        this.attendanceData = new MatTableDataSource<object>(attData);
        this.inProgress = false;
      }    
    );
  }

  getPendingData(type : string){
    
    for(let i=0;i<this.visitData.length;i++){
      let loopType = this.visitData[i].type;
      if(loopType == type){
        let pendingVisitData = this.visitData[i].pendingVisitRegistration;
        const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
          width: '1200px',
          data: pendingVisitData
        });
        
        break;
      } 
    }
  }

}

@Component({
  selector: 'pending.visit.dialog',
  templateUrl: 'pending.visit.dialog.html',
})
export class DialogOverviewExampleDialog {
  pendingVisitData : any = []
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data1: DialogData) {
      this.pendingVisitData = data1;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}



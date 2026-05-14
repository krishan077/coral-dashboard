import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as HighCharts from 'highcharts';


@Component({
  selector: 'app-group-perfromance-barchart',
  imports: [],
  templateUrl: './group-perfromance-barchart.html',
  styleUrl: './group-perfromance-barchart.css',
})
export class GroupPerfromanceBarchart implements OnChanges {
  chart:any;
  options:any;
@Input() groupPerformanceFirstData: any;


  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.createChart();
    
  }

  createChart(){
    this.options = {
    chart: {
        type: 'column',
            marginTop: 40

    },
    title: {
       text: ''
    },
    xAxis: {
        categories: ['Group 1', 'Group 2', 'Group 3', 'Group 4'],
        crosshair: true,
        accessibility: {
            description: 'Group'
        }
    },
    yAxis: {
        min: 0,
        title: {
            enabled: false
        }
    },
    tooltip: {
        valueSuffix: ' (1000 MT)'
    },
      plotOptions: {
        column: {
          pointPadding: 0.05,
          groupPadding: 0.05,
          borderWidth: 0,
          pointWidth: 40
        }
      },
    series: [
        {
            name: 'Engagement %',
            data: [49, 28, 12, 64]
        },
        {
            name: 'Completion %',
            data: [45, 14, 10, 14]
        }
    ],
    credits: {
        enabled: false
    }
};

  this.chart = HighCharts.chart('group-performance', this.options);
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.createChart();
  }

}

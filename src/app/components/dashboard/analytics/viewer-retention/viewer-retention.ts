import {
  Component,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges
} from '@angular/core';

import * as HighCharts from 'highcharts';

@Component({
  selector: 'app-viewer-retention',
  standalone: true,
  templateUrl: './viewer-retention.html',
  styleUrl: './viewer-retention.css',
})
export class ViewerRetention implements AfterViewInit, OnChanges {

  @Input() data: any;

  @ViewChild('chartContainer', { static: false })
  chartContainer!: ElementRef;

  viewerRetentionChart: any;

  chartReady = false;

  viewRetentionData: any[] = [];

  // ---------------------------
  // VIEW INIT
  // ---------------------------

  ngAfterViewInit(): void {

    this.chartReady = true;

    // create chart after DOM ready
    if (this.viewRetentionData.length) {
      this.createReactionChart();
    }
  }

  // ---------------------------
  // INPUT CHANGES
  // ---------------------------

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data'] && this.data) {

      console.log('RAW DATA => ', this.data);

      // map incoming data
      this.viewRetentionData = this.data.map((item: any) => ({

        // use item.name OR item.title depending on API
        name: item.name || item.title,

        data:
          item.groups
            ?.find((groupItem: any) => groupItem.group === 'Overall')
            ?.emotionTimelineFirstExposure
            ?.viewRetention || []

      }));

      console.log('MAPPED DATA => ', this.viewRetentionData);

      // create/update chart only if view ready
      if (this.chartReady) {
        this.createReactionChart();
      }
    }
  }

  // ---------------------------
  // CREATE CHART
  // ---------------------------

  createReactionChart(): void {

    if (!this.viewRetentionData?.length) return;

    // destroy old chart
    if (this.viewerRetentionChart) {
      this.viewerRetentionChart.destroy();
    }

    // convert into Highcharts series
    const seriesData: any[] = this.viewRetentionData.map((item: any) => ({

      type: 'spline',

      name: item.name,
      marker: {enabled: false},

      data: item.data.map((d: any) => ({
        x: d.time,
        y: d.percentage
      }))

    }));

    console.log('SERIES DATA => ', seriesData);

    // create chart
    this.viewerRetentionChart = HighCharts.chart(
      this.chartContainer.nativeElement,
      {

        chart: {
          type: 'spline',
          height: 400
        },

        title: {
          text: ''
        },

        xAxis: {

          title: {
            text: 'Time (seconds)'
          },

          allowDecimals: false
        },

        yAxis: {

          title: {
            text: 'Retention %'
          },

          max: 100,

          labels: {
            formatter: function (this: any): string {
              return this.value + '%';
            }
          }
        },

        legend: {
          enabled: true
        },

        credits: {
          enabled: false
        },

plotOptions: {
  spline: {

    lineWidth: 2,

    marker: {
      enabled: false
    },

    states: {
      hover: {
        lineWidth: 4
      }
    }
  }
},

        tooltip: {

          formatter: function (this: any): string {

            return `
              <b>${this.series.name}</b><br/>
              <b>Time:</b> ${this.x}s<br/>
              <b>Retention:</b> ${this.y}%
            `;
          }
        },

        series: seriesData

      } as any
    );
  }
}
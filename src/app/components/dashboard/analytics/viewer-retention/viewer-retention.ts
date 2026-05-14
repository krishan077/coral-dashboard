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
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/offline-exporting';

@Component({
  selector: 'app-viewer-retention',
  standalone: true,
  templateUrl: './viewer-retention.html',
  styleUrl: './viewer-retention.css',
})
export class ViewerRetention implements AfterViewInit, OnChanges {

  @Input() data: any;

  @Input() selectedGroup: number = 0;

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

    if (this.viewRetentionData.length) {

      this.createReactionChart();
    }
  }

  // ---------------------------
  // ON CHANGES
  // ---------------------------

  ngOnChanges(changes: SimpleChanges): void {

    if (
      (changes['data'] || changes['selectedGroup'])
      && this.data
    ) {

      this.mapRetentionData();

      if (this.chartReady) {

        this.createReactionChart();
      }
    }
  }

  // ---------------------------
  // MAP DATA
  // ---------------------------

  mapRetentionData(): void {

    this.viewRetentionData = this.data.map((item: any) => {

      const selectedGroupData =
        item.groups?.[this.selectedGroup];

      return {

        name: item.name || item.title,

        data:
          selectedGroupData
            ?.emotionTimelineFirstExposure
            ?.viewRetention || []
      };
    });

    console.log(
      'UPDATED RETENTION DATA => ',
      this.viewRetentionData
    );
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

    // convert to highcharts series

    const seriesData: any[] =
      this.viewRetentionData.map((item: any) => ({

        type: 'spline',

        name: item.name,

        marker: {
          enabled: false
        },

        data: item.data.map((d: any) => ({
          x: d.time,
          y: d.percentage
        }))
      }));

    console.log('SERIES DATA => ', seriesData);

    // create chart

    this.viewerRetentionChart =
      HighCharts.chart(
        this.chartContainer.nativeElement,
        {

          chart: {
            type: 'spline',
            height: 400,
            marginTop: 40
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

          series: seriesData,
          exporting: {
            enabled: true
          }

        } as any
      );
  }
}
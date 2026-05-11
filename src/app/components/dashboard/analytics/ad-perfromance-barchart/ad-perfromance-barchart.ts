import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({ selector: 'app-ad-perfromance-barchart', imports: [], templateUrl: './ad-perfromance-barchart.html', styleUrl: './ad-perfromance-barchart.css', })

export class AdPerfromanceBarchart implements OnChanges {

  @ViewChild('chartContainer', { static: true }) chartEl!: ElementRef;

  chart: any;
  @Input() performanceData: any;

  ngOnChanges(changes: SimpleChanges): void {
    ////console.log(this.performanceData);
    
    if (this.performanceData?.length) {
      this.createChart();
    }
  }

  createChart() {
    if (!this.chartEl) return;

    const categories = this.performanceData.map((item: any) => item.title);
    const engagementData = this.performanceData.map((item: any) => Math.round(item.engagement));
    const completionData = this.performanceData.map((item: any) => Math.round(item.completion));

    const options: Highcharts.Options = {
      chart: { type: 'column' },
      title: { text: '' },
      xAxis: { categories },
      yAxis: { min: 0, title: { text: '' } },
      tooltip: { shared: true, valueSuffix: '%' },
      plotOptions: {
        column: {
          pointPadding: 0.05,
          groupPadding: 0.05,
          borderWidth: 0,
          pointWidth: 40
        }
      },
      series: [
        { type: 'column', name: 'Engagement', data: engagementData },
        { type: 'column', name: 'Completion', data: completionData }
      ],
      credits: { enabled: false }
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = Highcharts.chart(this.chartEl.nativeElement, options);
  }
}
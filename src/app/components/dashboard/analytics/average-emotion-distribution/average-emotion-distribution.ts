import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import 'highcharts/highcharts-more'; // ✅ only this

@Component({
  selector: 'app-average-emotion-distribution',
  templateUrl: './average-emotion-distribution.html',
  styleUrl: './average-emotion-distribution.css',
})
export class AverageEmotionDistribution {
  chart: any;
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.length) {
      this.createChart();
    }
  }

  createChart() {
    if (!this.data?.length) return;

    const avgData = this.getAverageEmotionData(this.data);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = Highcharts.chart('emotion-distribution', {
      chart: {
        polar: true,  
        type: 'area',
            marginTop: 40
      },

      title: {
        text: ''
      },

      pane: { size: '80%' },

      xAxis: {
        categories: [
          'Happy', 'Angry', 'Surprised',
          'Sad', 'Disgusted', 'Valence', 'Engagement'
        ],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        // min: 0,
        // max: 100,
        tickInterval: 20
      },

      plotOptions: {
        area: {
          fillOpacity: 0.4
        },
        series: {
          pointPlacement: 'on'
        }
      },

      legend: {
        enabled: false
      },

      series: [{
        type: 'area',
        name: 'Emotion',
        data: avgData
      }],

      credits: { enabled: false }
    });
  }

  getAverageEmotionData(data: any[]) {
    const totals: any = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      disgusted: 0,
      valence: 0,
      engagement: 0
    };

    const count = data.length;

    data.forEach(d => {
      totals.happy += d.happy || 0;
      totals.sad += d.sad || 0;
      totals.angry += d.angry || 0;
      totals.surprised += d.surprised || 0;
      totals.disgusted += d.disgusted || 0;
      totals.valence += d.scaledValence || 0;
      totals.engagement += d.engagement || 0;
    });

    return [
      Math.round(totals.happy / count),
      Math.round(totals.angry / count),
      Math.round(totals.surprised / count),
      Math.round(totals.sad / count),
      Math.round(totals.disgusted / count),
      Math.round(totals.valence / count),
      Math.round(totals.engagement / count)
    ];
  }
}
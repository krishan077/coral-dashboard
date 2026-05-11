import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import * as Highcharts from 'highcharts';
import { ViewerRetention } from '../viewer-retention/viewer-retention';

@Component({
  selector: 'app-executive',
  templateUrl: './executive.html',
  styleUrl: './executive.css',
  imports: [ViewerRetention]
})
export class Executive implements OnChanges, AfterViewInit {

  @Input() ads: any;

  Highcharts: typeof Highcharts = Highcharts;

  charts: any[] = [];

  private timers = new WeakMap<HTMLVideoElement, any>();

  private pausedStates = new WeakMap<HTMLVideoElement, {
    wasPlaying: boolean;
    currentTime: number;
  }>();

  emotionLegends = [
    { name: 'Happy', color: '#22c55e', visible: false },
    { name: 'Angry', color: '#dc2626', visible: false },
    { name: 'Surprised', color: '#f59e0b', visible: false },
    { name: 'Sad', color: '#2563eb', visible: false },
    { name: 'Disgusted', color: '#7c3aed', visible: false },
    { name: 'Valence', color: '#06b6d4', visible: true },
    { name: 'Arousal', color: '#f97316', visible: false },
    { name: 'Engagement', color: '#e11d48', visible: false }
  ];

  ngAfterViewInit(): void {
    this.initCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['ads'] && this.ads) {

      setTimeout(() => {
        this.initCharts();
      });
    }
  }

  initCharts() {

    if (!this.ads) return;

    this.ads.forEach((ad: any, index: number) => {

      const emotionData =
        ad.groups
          ?.find((x: any) => x.group === 'Overall')
          ?.emotionTimelineFirstExposure?.overall
          ?.perSecond || [];

      ad.playheadPosition = 0;

      ad.currentTime = 0;

      ad.duration = 0;

      ad.isPlaying = false;
      ad['showGraph'] = true;

      const chart = Highcharts.chart(`emotion-chart-${index}`, {

        chart: {
          type: 'spline',
          backgroundColor: 'transparent',
          margin: [10, 10, 30, 10],
          animation: false,
        },

        title: {
          text: '',
        },

        credits: {
          enabled: false,
        },

        legend: {
          enabled: false,
        },

        xAxis: {

          categories: emotionData.map(
            (x: any) => `${x.time}s`
          ),

          gridLineWidth: 0,

          lineColor: '#777',

          tickColor: '#777',

          labels: {
            style: {
              color: '#fff',
              fontSize: '9px'
            }
          }
        },

        yAxis: {

          gridLineWidth: 0,

          title: {
            text: '',
          },

          labels: {
            style: {
              color: '#fff',
              fontSize: '9px'
            }
          }
        },

        tooltip: {
          shared: true,
        },

        plotOptions: {

          spline: {

            lineWidth: 3,

            marker: {
              enabled: false
            },

            states: {
              hover: {
                lineWidth: 4
              }
            }
          },

          series: {
            animation: false
          }
        },

        series: [
          {
            name: 'Happy',
            data: emotionData.map((d: any) => this.getRoundedValue(d.happy)),
            visible: false,
            color: '#22c55e'
          },
          {
            name: 'Angry',
            data: emotionData.map((d: any) => this.getRoundedValue(d.angry)),
            visible: false,
            color: '#dc2626'
          },
          {
            name: 'Surprised',
            data: emotionData.map((d: any) => this.getRoundedValue(d.surprised)),
            visible: false,
            color: '#f59e0b'
          },
          {
            name: 'Sad',
            data: emotionData.map((d: any) => this.getRoundedValue(d.sad)),
            visible: false,
            color: '#2563eb'
          },
          {
            name: 'Disgusted',
            data: emotionData.map((d: any) => this.getRoundedValue(d.disgust)),
            visible: false,
            color: '#7c3aed'
          },
          {
            name: 'Valence',
            data: emotionData.map((d: any) => this.getRoundedValue(d.scaledValence)),
            visible: true,
            color: '#06b6d4'
          },
          {
            name: 'Arousal',
            data: emotionData.map((d: any) => this.getRoundedValue(d.scaledArousal)),
            visible: false,
            color: '#f97316'
          },
          {
            name: 'Engagement',
            data: emotionData.map((d: any) => this.getRoundedValue(d.engagement)),
            visible: false,
            color: '#e11d48'
          }
        ]

      } as any);

      this.charts[index] = chart;
    });
  }

  toggleSeries(chartIndex: number, seriesName: string) {

    const chart = this.charts[chartIndex];

    if (!chart) return;

    const series = chart.series.find(
      (s: any) => s.name === seriesName
    );

    if (!series) return;

    series.setVisible(!series.visible);

    const legend = this.emotionLegends.find(
      x => x.name === seriesName
    );

    if (legend) {
      legend.visible = series.visible;
    }
  }

  toggleVideo(video: HTMLVideoElement, ad: any) {

    if (video.paused) {

      video.play();

      ad.isPlaying = true;

    } else {

      video.pause();

      ad.isPlaying = false;
    }
  }

  seekVideo(
    event: Event,
    video: HTMLVideoElement,
    ad: any
  ) {

    const value = +(event.target as HTMLInputElement).value;

    video.currentTime = value;

    ad.currentTime = value;
  }

  changePlaybackSpeed(
    event: Event,
    video: HTMLVideoElement
  ) {

    const speed = +(event.target as HTMLSelectElement).value;

    video.playbackRate = speed;
  }

  onVideoLoaded(video: HTMLVideoElement, adIndex: number) {

    this.ads[adIndex].duration = video.duration;

    this.ads[adIndex].currentTime = 0;

    this.ads[adIndex].isPlaying = false;
  }

  onVideoTimeUpdate(event: Event, adIndex: number) {

    const video = event.target as HTMLVideoElement;

    const duration = video.duration || 1;

    const current = video.currentTime;

    const ad = this.ads[adIndex];

    ad.currentTime = current;

    ad.duration = duration;

    ad.playheadPosition =
      (current / duration) * 100;

    if (video.ended) {
      ad.isPlaying = false;
    }
  }

  formatTime(seconds: number): string {

    if (!seconds) return '0:00';

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  playScene(
    event: MouseEvent,
    sceneTime: number,
    mainVideo: HTMLVideoElement,
    ad: any
  ) {

    const container = event.currentTarget as HTMLElement;

    const previewVideo =
      container.querySelector('video') as HTMLVideoElement;

    if (!previewVideo) return;

    // SAVE MAIN VIDEO STATE
    this.pausedStates.set(mainVideo, {
      wasPlaying: !mainVideo.paused,
      currentTime: mainVideo.currentTime
    });

    // PAUSE MAIN VIDEO
    mainVideo.pause();

    ad.isPlaying = false;

    const start = Math.max(sceneTime - 3, 0);

    const end = sceneTime + 3;

    this.clearTimer(previewVideo);

    // PAUSE OTHER PREVIEW VIDEOS
    document.querySelectorAll('video').forEach(v => {

      if (v !== previewVideo && v !== mainVideo) {
        v.pause();
      }
    });

    previewVideo.currentTime = start;

    previewVideo.play();

    const timer = setInterval(() => {

      if (previewVideo.currentTime >= end) {

        previewVideo.pause();

        previewVideo.currentTime = start;
      }

    }, 100);

    this.timers.set(previewVideo, timer);
  }

  stopScene(
    event: MouseEvent,
    mainVideo: HTMLVideoElement,
    ad: any
  ) {

    const container = event.currentTarget as HTMLElement;

    const previewVideo =
      container.querySelector('video') as HTMLVideoElement;

    if (!previewVideo) return;

    // STOP PREVIEW
    previewVideo.pause();

    this.clearTimer(previewVideo);

    // RESTORE MAIN VIDEO
    const state = this.pausedStates.get(mainVideo);

    if (state) {

      mainVideo.currentTime = state.currentTime;

      if (state.wasPlaying) {

        mainVideo.play();

        ad.isPlaying = true;
      }
    }
  }

  private clearTimer(video: HTMLVideoElement) {

    const timer = this.timers.get(video);

    if (timer) {

      clearInterval(timer);

      this.timers.delete(video);
    }
  }

  setThumbnail(event: Event, sceneTime: number) {

    const video = event.target as HTMLVideoElement;

    setTimeout(() => {

      video.currentTime =
        Math.min(sceneTime, video.duration || sceneTime);

      video.pause();

    }, 50);
  }

  getRoundedValue(value: number) {
    return Number(value?.toFixed(2)) || 0;
  }

  toggleGraph(ad: any, index: number) {

  ad.showGraph = !ad.showGraph;

  setTimeout(() => {

    const chart = this.charts[index];

    if (chart) {
      chart.reflow();
    }

  });
}
}
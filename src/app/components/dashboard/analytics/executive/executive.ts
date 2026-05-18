import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  signal,
  SimpleChanges
} from '@angular/core';

import * as Highcharts from 'highcharts';
import { ViewerRetention } from '../viewer-retention/viewer-retention';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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

  groups: any = signal([]);

  environment = environment;

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

  downloadingScenes = signal<Record<string, boolean>>({});

  selectedGroup: any = signal(0);

  constructor(private http: HttpClient) { }

  async ngAfterViewInit(): Promise<void> {
    this.initCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ads'] && this.ads) {
      console.log(this.ads);
      this.groups.set(this.ads[0]?.groups || []);
      setTimeout(() => {
        this.initCharts();
      });
    }
  }

  getSelectedGroup(event: any) {
    this.selectedGroup.set(event.target.value);
    console.log(this.selectedGroup());
    this.updateCharts();
  }

   getEmotionData(ad: any) {

    const selectedGroup =
      ad.groups?.[this.selectedGroup()];

    return selectedGroup
      ?.emotionTimelineFirstExposure
      ?.overall
      ?.perSecond || [];
  }

initCharts() {

    if (!this.ads) return;

    this.ads.forEach((ad: any, index: number) => {

      const emotionData = this.getEmotionData(ad);

      ad.playheadPosition = 0;
      ad.currentTime = 0;
      ad.duration = 0;
      ad.isPlaying = false;

      if (ad.showGraph === undefined) {
        ad.showGraph = true;
      }

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

        series: this.getSeriesData(emotionData),
        exporting: {
          enabled: false,
        }

      } as any);

      this.charts[index] = chart;
    });
  }

  updateCharts() {

    this.ads.forEach((ad: any, index: number) => {

      const chart = this.charts[index];

      if (!chart) return;

      const emotionData = this.getEmotionData(ad);

      chart.xAxis[0].setCategories(
        emotionData.map((x: any) => `${x.time}s`),
        false
      );

      const updatedSeries = this.getSeriesData(emotionData);

      updatedSeries.forEach((series: any, seriesIndex: number) => {

        if (chart.series[seriesIndex]) {

          chart.series[seriesIndex].setData(
            series.data,
            false
          );
        }
      });

      chart.redraw();
    });
  }

getSeriesData(emotionData: any[]) {

    return [
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
    ];
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


  seekVideo(event: Event, video: HTMLVideoElement, ad: any) {
    const value = +(event.target as HTMLInputElement).value;
    video.currentTime = value;
    ad.currentTime = value;
  }

  changePlaybackSpeed(event: Event, video: HTMLVideoElement) {
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
    ad.playheadPosition = (current / duration) * 100;
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

    this.pausedStates.set(mainVideo, {
      wasPlaying: !mainVideo.paused,
      currentTime: mainVideo.currentTime
    });

    mainVideo.pause();

    ad.isPlaying = false;

    const start = Math.max(sceneTime - 3, 0);

    const end = sceneTime + 3;

    this.clearTimer(previewVideo);

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

    previewVideo.pause();

    this.clearTimer(previewVideo);

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

  isSceneDownloading(key: string): boolean {

    return this.downloadingScenes()[key] || false;
  }

  setSceneDownloading(
    key: string,
    value: boolean
  ) {

    this.downloadingScenes.update(current => ({
      ...current,
      [key]: value
    }));
  }

  async downloadScene(
    videoUrl: string,
    sceneTime: number,
    title: string,
    sceneKey: string
  ) {
    this.setSceneDownloading(sceneKey, true);
    let params = {
      "videoUrl": videoUrl,
      "startTime": Math.max(sceneTime - 3, 0),
      "endTime": sceneTime + 3
    };

    this.http.post(
    `${this.environment.apiUrl}download-video-clip`,
    params,
    {
      responseType: 'blob', // important
      observe: 'response'
    } 
  ).subscribe({
    next: (response) => {
      const blob = response.body;

      if (!blob) {
        console.error('No blob received');
        return;
      }

      let fileName = `${title}_(${params.startTime}_${params.endTime}).mp4`;

      const contentDisposition = response.headers.get('Content-Disposition');

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);

        if (match?.[1]) {
          fileName = match[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
        this.setSceneDownloading(sceneKey, false);
    },

    error: async (error) => {
      console.error('Download failed:', error);

      // Backend JSON error also comes as Blob because responseType is blob
      if (error.error instanceof Blob) {
        const errorText = await error.error.text();

        try {
          const errorJson = JSON.parse(errorText);
          alert(errorJson.message || 'Download failed');
        } catch {
          alert(errorText || 'Download failed');
        }

        return;
      }

      alert('Download failed');
        this.setSceneDownloading(sceneKey, false);

    }
  });
}

  downloadVideo(videoUrl: string) {
    console.log('Downloading video from URL:', videoUrl);
    fetch(videoUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'video.mp4';
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  }
}
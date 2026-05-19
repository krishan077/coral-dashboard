import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, signal,ElementRef,ViewChild } from '@angular/core';
import * as HighCharts from 'highcharts';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-emotion-timeline',
    imports: [CommonModule],
    templateUrl: './emotion-timeline.html',
    styleUrl: './emotion-timeline.css',
})
export class EmotionTimeline {
    fullSeriesData: any[] = [];
isPlayingMode: boolean = false;
emotiontimelineData: any;
salientScenesData: any;
    @Input() data: any;
    @Input() selectedParticipant: any;
    @Input() showScenes: boolean = false;
    @Input() videoUrl: any;
   @Input() video?: HTMLVideoElement;
   previewMode = true;
    emotionChart: any;
    options: any;
    hoveredScene: any = null;
    currentVideo: HTMLVideoElement | null = null;
    hoveredIndex: number | null = null;
    activeVideo: HTMLVideoElement | null = null;
    sceneSummaries: { [key: number]: string } = {};
    // emotionEmojiMap: any = {
    //     happy: '😊',
    //     surprise: '😲',
    //     surprised: '😲',
    //     angry: '😡',
    //     sad: '😢',
    //     disgust: '🤢',
    //     disgusted: '🤢',
    //     neutral: '😐'
    // };
      emotionEmojiMap: any = {
      happy: 'assets/emotions/happy.svg',
      surprise: 'assets/emotions/surprise.svg',
      //surprised: 'assets/emotions/surprise.svg',
      angry: 'assets/emotions/angry.svg',
      sad: 'assets/emotions/sad.svg',
      disgust: 'assets/emotions/disgust.svg',
     // disgusted: 'assets/emotions/disgust.svg',
      neutral: '😐' // Kept as text
  };

    expandScene: any = signal(false);
    @Input() cnt_id: any;
    videoDuration: any = signal(0)
    videoInitialized = false;


    constructor(private http: HttpClient) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data) {
            ////console.log(this.data);
            this.salientScenesData = this.data.salientScenes
            // this.videoUrl.set(this.data.video_URL);
            this.salientScenesData.forEach((scene: any) => {
                this.fetchSceneSummary(scene);
            });
        }

        if (changes['selectedParticipant'] && this.selectedParticipant) {
            //console.log(this.selectedParticipant);

            this.emotiontimelineData = this.selectedParticipant.persecond || this.selectedParticipant.perSecond;
            //console.log(this.emotiontimelineData);

        const duration =
    this.video?.duration ||
    Math.max(...this.emotiontimelineData.map((d: any) => d.time));

this.createReactionChart(duration);
        }
    }
    ngAfterViewInit() {

    if (!this.video) return;

this.video.onplay = () => {

    if (!this.emotionChart) return;

    this.isPlayingMode = true;

    this.lastIndex = -1;

    this.emotionChart.series.forEach((series: any) => {
        series.setData([], false);
    });

    this.emotionChart.redraw();
};

this.video.onended = () => {

    this.isPlayingMode = false;

    this.previewMode = true;

    this.lastIndex = -1;

    this.video!.currentTime = 0;

    this.renderFullChart();
};

this.video.onpause = () => {
    this.isPlayingMode = false;
};
}
ngAfterViewChecked() {

    if (this.video && !this.videoInitialized) {

        this.videoInitialized = true;

        console.log('VIDEO CONNECTED');

        this.syncWithVideo();

    this.video.onplay = () => {

        this.isPlayingMode = true;

        this.previewMode = false;

        this.lastIndex = -1;

        this.clearChart();
    };
        this.video.onpause = () => {
            this.isPlayingMode = false;
        };
    }
}
renderFullChart() {

    if (!this.emotionChart) return;

    this.fullSeriesData.forEach((s: any, i: number) => {

        this.emotionChart.series[i].setData(
            s.data,
            false
        );

    });

    this.emotionChart.redraw();
}
clearChart() {

    if (!this.emotionChart) return;

    this.emotionChart.series.forEach((series: any) => {
        series.setData([], false);
    });

    this.emotionChart.redraw();
}
createReactionChart(duration?: number) {

    if (!this.emotiontimelineData?.length) return;

    if (this.emotionChart) {
        this.emotionChart.destroy();
        this.emotionChart = null;
    }

    const chartDuration =
        duration ||
        this.video?.duration ||
        Math.max(...this.emotiontimelineData.map((d: any) => d.time));

    this.fullSeriesData = [
        {
            name: 'Happy',
            color: '#22c55e',
            visible: false,
            key: 'happy'
        },
        {
            name: 'Angry',
            color: '#dc2626',
            visible: false,
            key: 'angry'
        },
        {
            name: 'Surprised',
            color: '#f59e0b',
            visible: false,
            key: 'surprised'
        },
        {
            name: 'Sad',
            color: '#2563eb',
            visible: false,
            key: 'sad'
        },
        {
            name: 'Disgusted',
            color: '#7c3aed',
            visible: false,
            key: 'disgust'
        },
        {
            name: 'Valence',
            color: '#06b6d4',
            visible: true,
            key: 'scaledValence'
        },
        {
            name: 'Arousal',
            color: '#f97316',
            visible: false,
            key: 'scaledArousal'
        },
        {
            name: 'Engagement',
            color: '#e11d48',
            visible: false,
            key: 'engagement'
        }
    ].map((s: any) => ({
        ...s,
        data: this.emotiontimelineData.map((d: any, i: number) => [
            Number(d.time ?? i),
            this.getRoundedValue(d[s.key])
        ])
    }));

    this.options = {
        chart: {
            type: 'spline',
            backgroundColor: 'transparent',
            marginTop: 40,
        },

        title: {
            text: ''
        },

        xAxis: {
            type: 'linear',
            min: 0,
            max: chartDuration,
            title: {
                text: 'Time (seconds)'
            }
        },

        yAxis: {
            title: {
                text: 'Intensity'
            },
            gridLineWidth: 0,
        },

        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
        },

        credits: {
            enabled: false
        },

        series: this.fullSeriesData.map((s: any) => ({
            name: s.name,
            color: s.color,
            visible: s.visible,
            data: [],
            marker: { enabled: false }
        }))
    };

setTimeout(() => {

    this.emotionChart = HighCharts.chart(
        'emotion-timeline',
        this.options
    );

    // show full graph initially
    this.renderFullChart();

    // attach video sync
    this.syncWithVideo();

}, 0);
}

lastIndex = -1;

syncWithVideo() {

    if (!this.video) return;

    this.video.ontimeupdate = () => {

        if (
            !this.video ||
            !this.emotionChart ||
            !this.isPlayingMode
        ) {
            return;
        }

        const currentTime = Math.floor(
            this.video.currentTime
        );

        if (currentTime === this.lastIndex) {
            return;
        }

        this.lastIndex = currentTime;

        this.emotionChart.series.forEach(
            (series: any, i: number) => {

                const fullData =
                    this.fullSeriesData[i].data;

                const point = fullData.find(
                    (d: any) =>
                        Math.floor(d[0]) === currentTime
                );

                if (point) {
                    series.addPoint(
                        point,
                        false,
                        false
                    );
                }
            }
        );

        this.emotionChart.redraw();
    };
}

    onVideoLoad(event: any, time: number) {
        const video = event.target as HTMLVideoElement;

        const start = Math.max(0, time - 3);
        const end = time + 3;
        this.videoDuration.set(Math.round(video.duration))


        video.ontimeupdate = () => {
            if (video.currentTime >= end) {
                video.pause(); // stop instead of loop
            }
        };
    }

    getRoundedValue(value: number) {
        return Number(value?.toFixed(2)) || 0;
    }


    getYValue(time: number): number {
        const point = this.emotiontimelineData.find((d: any) => d.time === time);
        return point ? this.getRoundedValue(point.happy) : 0; // change to any metric
    }

// getPixelPosition(time: number) {

//     if (!this.emotionChart) {
//         return { x: 0, y: 0 };
//     }

//     const x = this.emotionChart.xAxis[0].toPixels(time, false);

//     const point = this.emotiontimelineData.find(
//         (d: any) => d.time === time
//     );

//     const yValue = point
//         ? this.getRoundedValue(point.scaledValence)
//         : 0;

//     const y = this.emotionChart.yAxis[0].toPixels(yValue, false);

//     return { x, y };
// }
  getPixelPosition(time: number) {
        if (!this.emotionChart) return { x: 0, y: 0 };

        const x = this.emotionChart.xAxis[0].toPixels(time, false);
        // const yValue = this.getYValue(time);
        // const y = this.emotionChart.yAxis[0].toPixels(yValue, false);
        const y = 100;

        return { x, y };
    }

    playScene(event: any, time: number, index: number) {
        const video = event.currentTarget.querySelector('video') as HTMLVideoElement;

        if (this.activeVideo && this.activeVideo !== video) {
            this.activeVideo.pause();
        }

        this.activeVideo = video;
        this.hoveredIndex = index;

        const start = Math.max(0, time - 3);
        video.currentTime = start;
        video.play();
    }

    stopScene(event: any) {
        const video = event.currentTarget.querySelector('video') as HTMLVideoElement;

        video.pause();
        this.hoveredIndex = null;
    }

    fetchSceneSummary(scene: any) {
        const start = Math.max(0, scene.time - 3);
        const end = scene.time + 3;

        const url = `https://background.monetlive.com/post_processing/transcribe/audio?from=silent_scene`;

        const params = {
            video_url: this.videoUrl,
            start_time: start,
            end_time: end,
            cnt_id: this.cnt_id
        };

        this.http.post<any>(url, params).subscribe({
            next: (res) => {
                ////console.log(res);

                this.sceneSummaries[scene.time] = res.summary;
            },
            error: () => {
                this.sceneSummaries[scene.time] = 'No summary available';
            }
        });
    }

    getDominantEmotion(scene: any): string {
        return scene?.tags?.[0] || 'neutral';
    }

    // getEmotionEmoji(scene: any): string {
    //     const emotion = this.getDominantEmotion(scene);
    //     return this.emotionEmojiMap[emotion] || '😐';
    // }
       getEmotionEmoji(scene: any): string {
      const emotion = this.getDominantEmotion(scene);
      return this.emotionEmojiMap[emotion] || '😐';
  }

    isEmojiAsset(scene: any): boolean {
      return this.getEmotionEmoji(scene).includes('.svg');
  }
}

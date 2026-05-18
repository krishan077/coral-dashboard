import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, signal } from '@angular/core';
import * as HighCharts from 'highcharts';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-emotion-timeline',
    imports: [CommonModule],
    templateUrl: './emotion-timeline.html',
    styleUrl: './emotion-timeline.css',
})
export class EmotionTimeline {
    @Input() data: any;
    @Input() selectedParticipant: any;
    @Input() showScenes: boolean = false;
    @Input() videoUrl: any;
    emotionChart: any;
    options: any;
    hoveredScene: any = null;
    currentVideo: HTMLVideoElement | null = null;
    hoveredIndex: number | null = null;
    activeVideo: HTMLVideoElement | null = null;
    sceneSummaries: { [key: number]: string } = {};
    emotionEmojiMap: any = {
        happy: '😊',
        surprise: '😲',
        surprised: '😲',
        angry: '😡',
        sad: '😢',
        disgust: '🤢',
        disgusted: '🤢',
        neutral: '😐'
    };
    emotiontimelineData: any;
    salientScenesData: any;
    expandScene: any = signal(false);
    @Input() cnt_id: any;
    videoDuration: any = signal(0)


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

            this.createReactionChart();
        }
    }

    createReactionChart() {

        if (!this.emotiontimelineData || !this.emotiontimelineData.length) return;

        if (this.emotionChart) {
            this.emotionChart.destroy();
        }

        const time = this.emotiontimelineData.map((d: any) => d.time);

        this.options = {
            chart: {
                type: 'spline',
            marginTop: 40,
            backgroundColor: 'transparent',

            },

            title: {
                text: ''
            },

            xAxis: {
                categories: time,
                title: {
                    text: 'Time (seconds)'
                }
            },

            yAxis: {
                title: {
                    text: 'Intensity'
                },
            },

            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },

            credits: {
                enabled: false
            },

            series: [
                {
                    name: 'Happy',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.happy)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#22c55e' // bright green
                },
                {
                    name: 'Angry',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.angry)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#dc2626' // strong red
                },
                {
                    name: 'Surprised',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.surprised)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#f59e0b' // amber
                },
                {
                    name: 'Sad',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.sad)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#2563eb' // deep blue
                },
                {
                    name: 'Disgusted',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.disgust)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#7c3aed' // violet
                },
                {
                    name: 'Valence',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.scaledValence)),
                    marker: { enabled: false },
                    visible: true,
                    color: '#06b6d4' // cyan
                },
                {
                    name: 'Arousal',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.scaledArousal)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#f97316' // orange (changed from pink)
                },
                {
                    name: 'Engagement',
                    data: this.emotiontimelineData.map((d: any) => this.getRoundedValue(d.engagement)),
                    marker: { enabled: false },
                    visible: false,
                    color: '#e11d48' // rose (distinct from angry)
                }
            ]
        };


        this.emotionChart = HighCharts.chart('emotion-timeline', this.options);
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

    getEmotionEmoji(scene: any): string {
        const emotion = this.getDominantEmotion(scene);
        return this.emotionEmojiMap[emotion] || '😐';
    }
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, signal, SimpleChanges } from '@angular/core';
import * as HighCharts from 'highcharts';
@Component({
    selector: 'app-per-second-chart',
    imports: [CommonModule],
    templateUrl: './per-second-chart.html',
    styleUrl: './per-second-chart.css',
})
export class PerSecondChart {
    @Input() videoUrl: any;
    @Input() showScenes: boolean = false;
    @Input() data: any;
    emotionChart: any;
    options: any;
    hoveredScene: any = null;
    currentVideo: HTMLVideoElement | null = null;
    hoveredIndex: number | null = null;
    activeVideo: HTMLVideoElement | null = null;
    @Input() seriesConfig: any;
    @Input() video!: HTMLVideoElement;
    fullSeriesData: any[] = [];
    @Input() cnt_id: any;
    @Input() selectedParticipant: any;


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
    salientScenesData: any;
    emotiontimelineData: any;
    isPlayingMode: boolean = false;
    expandScene: any = signal(false);


    constructor(private http: HttpClient) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedParticipant'] && this.selectedParticipant) {
            console.log(this.selectedParticipant);
            this.emotiontimelineData = [];
            this.salientScenesData = [];
            this.emotiontimelineData = this.selectedParticipant.perSecond;
            this.salientScenesData = this.selectedParticipant.salientScenes;
            this.salientScenesData.forEach((scene: any) => {
                this.fetchSceneSummary(scene);
            });
            const duration = this.video?.duration || 100;
            this.initChart(duration);
        }

    }

    ngAfterViewInit() {
        if (this.video) {
            this.video.onplay = () => {
                this.isPlayingMode = true;

                // reset chart to empty before progressive draw
                this.emotionChart.series.forEach((series: any) => {
                    series.setData([], false);
                });

                this.emotionChart.redraw();
            };

            this.syncWithVideo();
        }
    }

    createReactionChart(duration: number) {

        if (this.emotionChart) {
            this.emotionChart.destroy();
            this.emotionChart = null;
        }

        this.options = {
            chart: {
                type: 'spline',
                backgroundColor: 'transparent',
                margin: [10, 10, 40, 40],
                spacing: [0, 0, 0, 0]
            },

            title: {
                text: ''
            },

            xAxis: {
                type: 'linear',
                min: 0,
                max: duration,
                visible: true,
                labels: {
                    style: {
                        color: '#fff',
                        fontSize: '12px'
                    }
                }
            },

            yAxis: {
                visible: true,
                // min: 0,
                // max: 100,
                title: {
                    text: 'Emotion Intensity',
                    style: { color: '#fff' }
                },
                labels: {
                    style: {
                        color: '#fff',
                        fontSize: '12px'
                    }
                },
                gridLineColor: '#444' // optional for better visibility
            },

            legend: { enabled: false },
            credits: { enabled: false },
            series: this.fullSeriesData.map((s: any) => ({
                name: s.name,
                color: s.color,
                visible: s.visible,
                data: s.data, // ✅ show full data initially
                marker: { enabled: false }
            }))
        };

        setTimeout(() => {
            this.emotionChart = HighCharts.chart('emotion-timeline', this.options);
        }, 0);
    }

    onVideoLoad(event: any, time: number) {
        const video = event.target as HTMLVideoElement;

        const start = Math.max(0, time - 3);
        const end = time + 3;

        video.ontimeupdate = () => {
            if (video.currentTime >= end) {
                video.pause();
            }
        };
    }

    getRoundedValue(value: number) {
        return Number(value?.toFixed(2)) || 0;
    }


    getYValue(time: number): number {
        const point = this.emotiontimelineData.find((d: any) => d.time === time);
        return point ? this.getRoundedValue(point.happy) : 0;
    }

    getPixelPosition(time: number) {
        if (!this.emotionChart) return { x: 0, y: 0 };

        const x = this.emotionChart.xAxis[0].toPixels(time, false);
        // const yValue = this.getYValue(time);
        // const y = this.emotionChart.yAxis[0].toPixels(yValue, false);
        const y = 40;

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

    updateSeriesVisibility(index: number, visible: boolean) {
        if (this.emotionChart?.series[index]) {
            this.emotionChart.series[index].setVisible(visible);
        }
    }

    syncWithVideo() {
        if (!this.video) return;

        this.video.ontimeupdate = () => {
            if (!this.emotionChart || !this.isPlayingMode) return;

            const currentTime = this.video.currentTime;

            this.emotionChart.series.forEach((series: any, i: number) => {
                const fullData = this.fullSeriesData[i].data;

                const visibleData = fullData.filter((d: any) => d[0] <= currentTime);

                series.setData(visibleData, false);
            });

            this.emotionChart.redraw();
        };
    }

    initChart(duration: number) {
        if (!this.emotiontimelineData?.length) return;

        this.fullSeriesData = this.seriesConfig.map((s: any) => ({
            name: s.name,
            color: s.color,
            visible: s.visible,
            data: this.emotiontimelineData.map((d: any, i: number) => [
                Number(d.time ?? i),
                this.getRoundedValue(d[s.key])
            ])
        }));

        this.createReactionChart(duration);
        this.syncWithVideo();
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
                //console.log(res);

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

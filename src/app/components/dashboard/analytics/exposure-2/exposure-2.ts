import { Component, ElementRef, Input, signal, SimpleChanges, ViewChild } from '@angular/core';
import { GroupPerfromanceBarchart } from "../group-perfromance-barchart/group-perfromance-barchart";
import { AverageEmotionDistribution } from "../average-emotion-distribution/average-emotion-distribution";
import { EmotionTimeline } from '../emotion-timeline/emotion-timeline';
import { PerSecondChart } from '../per-second-chart/per-second-chart';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { Loader } from '../../../loader/loader';

@Component({
  selector: 'app-exposure-2',
  imports: [GroupPerfromanceBarchart, AverageEmotionDistribution, PerSecondChart, CommonModule, MarkdownModule, Loader],
  templateUrl: './exposure-2.html',
  styleUrl: './exposure-2.css',
})
export class Exposure2 {
  @Input() data: any;
  @Input() selectedParticipant: any;
  @Input() performanceData: any;
  @ViewChild(PerSecondChart) chartComp!: PerSecondChart;
  @Input() videoUrl: any
  @Input() cnt_id: any;
   @Input() groupPerformanceForceData: any
  isPlaying = false;
  summaryData: any = signal(null);

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
@ViewChild('userVideo') userVideo!: ElementRef<HTMLVideoElement>;
@Input() selectedGroup: any;


  topStats: any = signal([
    {
      title: 'Avg Engagement',
      value: 0
    },
    {
      title: 'Avg Valence',
      value: 0
    },
    {
      title: 'Avg Arousal',
      value: 0
    },
        {
      title: 'Dominant Emotion',
      value: 0
    },
  ]);

  dominantEmotion: any = signal(null);
  showScenes = false;
  progress: any = signal(0);
  isMuted = false;

  seriesConfig = [
    { name: 'Happy', key: 'happy', color: '#22c55e', visible: false },
    { name: 'Angry', key: 'angry', color: '#dc2626', visible: false },
    { name: 'Surprised', key: 'surprised', color: '#f59e0b', visible: false },
    { name: 'Sad', key: 'sad', color: '#2563eb', visible: false },
    { name: 'Disgusted', key: 'disgust', color: '#7c3aed', visible: false },
    { name: 'Valence', key: 'scaledValence', color: '#06b6d4', visible: false },
    { name: 'Arousal', key: 'scaledArousal', color: '#f97316', visible: false },
    { name: 'Engagement', key: 'engagement', color: '#e11d48', visible: false }
  ];
id: any;

constructor(private http: HttpClient){}

  ngOnInit() {
    this.seriesConfig = this.seriesConfig.map(s => ({
      ...s,
      visible: s.key === 'scaledValence'
    }));
  }
  ngOnChanges(changes: SimpleChanges): void {
    ////console.log(this.data);
    if (changes['selectedParticipant'] && this.selectedParticipant) {
      console.log(this.selectedParticipant);
      console.log(this.data);
      
      this.topStats.set(this.topStats().map((stat: any) => {
        if (stat.title === 'Avg Engagement') {
          return { ...stat, value: Math.round(this.selectedParticipant.emotion.engagement) }
        } else if (stat.title === 'Avg Valence') {
          return { ...stat, value: Math.round(this.selectedParticipant.emotion.scaledValence) }
        } else if (stat.title === 'Avg Arousal') {
          return { ...stat, value: Math.round(this.selectedParticipant.emotion.scaledArousal) }
        }
        else if(stat.title === 'Dominant Emotion'){
          return { ...stat, value: this.selectedParticipant.emotion.dominant_emotion }
        }
        else {
          return stat;
        }
      }));

      const main = this.videoRef?.nativeElement;
      if(main){
        main.currentTime = 0;
        this.isPlaying = false;
        main.pause();
      }


    }
    console.log(this.selectedGroup);

    this.getSummaryData();
    
  }

  toggleScenes() {
    this.showScenes = !this.showScenes;
  }

  onVideoLoaded(video: HTMLVideoElement) {
    if (this.chartComp) {
      this.chartComp.initChart(video.duration);
    }
  }

  toggleSeries(index: number) {
    this.seriesConfig[index].visible = !this.seriesConfig[index].visible;

    this.chartComp.updateSeriesVisibility(
      index,
      this.seriesConfig[index].visible
    );
  }

  togglePlay() {
  const main = this.videoRef.nativeElement;
  const user = this.userVideo?.nativeElement;

  if (main.paused) {
    main.play();
    if(user){
    user.currentTime = main.currentTime; // sync before play
    user.play();
    }

    this.isPlaying = true;
  } else {
    main.pause();
    if(user){
      user.pause();
    }
    this.isPlaying = false;
  }
}

ngAfterViewInit() {
  const main = this.videoRef.nativeElement;
  const user = this.userVideo?.nativeElement;

  if(user){
  main.addEventListener('timeupdate', () => {
    const diff = Math.abs(main.currentTime - user.currentTime);

    // small tolerance to avoid jitter
    if (diff > 0.3) {
      user.currentTime = main.currentTime;
    }
  });
  }

}

onTimeUpdate() {
  const main = this.videoRef.nativeElement;
  this.progress.set((main.currentTime / main.duration) * 100);
  if(main.currentTime == main.duration){
    this.isPlaying = false;
  }
}

seek(event: any) {
  const value = event.target.value;
  const main = this.videoRef.nativeElement;
  const user = this.userVideo?.nativeElement;

  const time = (value / 100) * main.duration;

  main.currentTime = time;
  if(user){
    user.currentTime = time;
  }
}

toggleMute() {
  const main = this.videoRef.nativeElement;
  main.muted = !main.muted;
  this.isMuted = main.muted;
}

  getSummaryData() {
        const url = `https://background.monetlive.com/post_processing/summary/coral/reaction_summary?from=silent_scene`;

        let params: any = {
            video_url: this.videoUrl,
            cnt_id: this.cnt_id,
            group_id: this.selectedGroup.group
        };
        
        console.log(this.selectedParticipant.wh_mo_id);
        

        if(this.selectedParticipant.wh_mo_id != 'All'){
          params['wh_mo_id'] = this.selectedParticipant.wh_mo_id.toString();
        }

        console.log(params);
        
        this.summaryData.set(null)

        this.http.post<any>(url, params).subscribe({
            next: (res) => {
                ////console.log(res);

                // this.sceneSummaries[scene.time] = res.summary;
                this.summaryData.set(res.summary)
            },
            error: () => {
                // this.sceneSummaries[scene.time] = 'No summary available';
            }
        });
    }
}

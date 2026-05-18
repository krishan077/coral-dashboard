import { Component, ElementRef, Input, signal, SimpleChanges, ViewChild } from '@angular/core';
import { GroupPerfromanceBarchart } from '../group-perfromance-barchart/group-perfromance-barchart';
import { AdPerfromanceBarchart } from '../ad-perfromance-barchart/ad-perfromance-barchart';
import { EmotionTimeline } from '../emotion-timeline/emotion-timeline';
import { ViewerRetention } from '../viewer-retention/viewer-retention';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exposure-1',
  imports: [GroupPerfromanceBarchart, AdPerfromanceBarchart, EmotionTimeline, ViewerRetention, CommonModule],
  templateUrl: './exposure-1.html',
  styleUrl: './exposure-1.css',
})
export class Exposure1 {

  @Input() data: any;
  @Input() selectedParticipant: any;
  @Input() performanceData: any;
  @Input() videoUrl: any
  @Input() cnt_id: any
  @Input() groupPerformanceFirstData: any
    isPlaying = false;
      isMuted = false;

 @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
@ViewChild('userVideo') userVideo!: ElementRef<HTMLVideoElement>;
  topStats: any = signal([
    {
      title: 'Avg Engagement',
      value: 0,
      description: 'FACS measurement',
    },
    {
      title: 'Completion Rate',
      value: 0,
      description: 'Watched to end'
    },
    {
      title: 'Skip Rate',
      value: 0,
      description: 'Users who skipped'
    },
    {
      title: 'Avg Skip Time',
      value: 0,
      description: 'When skipped'
    },
  ]);

  topStatsPerParticipant: any = signal([
    {
      title: 'Avg Engagement',
      value: 0,
      // description: 'FACS measurement',
    },
    {
      title: 'Avg Valence',
      value: 0,
      // description: 'Watched to end'
    },
    {
      title: 'Avg Arousal',
      value: 0,
      // description: 'Users who skipped'
    },
    {
      title: 'Skip Time',
      value: 0,
      description: 'When skipped'
    },
  ]);

  showScenes: any = signal(false);
  progress: any = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    ////console.log(this.performanceData);
    console.log(this.data);
    //console.log(this.selectedParticipant);
    
    if(changes['data'] && this.data && this.selectedParticipant){
      console.log(this.selectedParticipant);
      
    this.topStats.set(this.topStats().map((stat: any) => {
      if(stat.title === 'Avg Engagement'){
        return { ...stat, value: Math.round(this.selectedParticipant.emotion.engagement)}
      }else if(stat.title === 'Completion Rate'){
        return { ...stat, value: Math.round(this.data.completion) }
      }else if(stat.title === 'Skip Rate'){
        return { ...stat, value: Math.round(this.data.skip) }
      }else if(stat.title === 'Avg Skip Time'){
        return { ...stat, value: Math.round(this.data.viewthrough) }
      }else{
        return stat;
      }
    }));
    }

    this.topStatsPerParticipant.set(this.topStatsPerParticipant().map((stat: any) => {
      if(stat.title === 'Avg Engagement'){
        return { ...stat, value: Math.round(this.selectedParticipant.emotion.engagement)}
      }else if(stat.title === 'Avg Arousal'){
        return { ...stat, value: Math.round(this.selectedParticipant.emotion.scaledArousal) }
      }else if(stat.title === 'Avg Valence'){
        return { ...stat, value: Math.round(this.selectedParticipant.emotion.scaledValence) }
      }else if(stat.title === 'Skip Time'){
        return { ...stat, value: Math.round(this.selectedParticipant.perSecond.length) }
      }else{
        return stat;
      }
    }));
    ////console.log(this.topStats());
        if(this.selectedParticipant.wh_mo_id != "All"){
      //console.log(this.selectedParticipant.wh_mo_id);
      
      this.showScenes.set(false);
    }
  }

  

  toggleScenes() {
    this.showScenes.set(!this.showScenes())
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

toggleMute() {
  const main = this.videoRef.nativeElement;
  main.muted = !main.muted;
  this.isMuted = main.muted;
}

}

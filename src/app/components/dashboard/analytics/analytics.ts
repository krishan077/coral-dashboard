import { Component, signal } from '@angular/core';
import { Exposure1 } from './exposure-1/exposure-1';
import { CommonModule } from '@angular/common';
import { Exposure2 } from "./exposure-2/exposure-2";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../../services/api';
import { Loader } from '../../loader/loader';
import { Executive } from './executive/executive';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, Exposure1, Exposure2, RouterLink, Loader, Executive],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {

  exposures = ['Executive Summary', 'Exposure 1 - Natural Viewing', 'Exposure 2 - Forced Viewing'];

  ads = signal<any[]>([]);
  groups = signal<any[]>([]);
  participants = signal<any[]>([]);

  selectedExposure = signal(3);
  selectedAd = signal<any>(null);
  selectedGroup = signal<any>(null);
  selectedParticipant = signal<any>(null);

  totalParticipants = signal(0);
  PerformanceData = signal<any>([]);
  groupPerformanceFirstData = signal<any>([]);
  groupPerformanceForceData = signal<any>([]);
  filteredData = signal<any>(null);

  response= signal<any>(null);
  study_id: any;
  study_name: any;
  loading = signal(true);

  constructor(private route: ActivatedRoute, private _api: Api) {
    this.route.queryParamMap.subscribe((data: any) => {
      if (data.params) {
        this.study_id = data.params.study_id;
        this.study_name = data.params.study_name;
        this.getOverallData(this.study_id);
      }
    });
  }

  // ---------------------------
  // 🔁 EXPOSURE CHANGE
  // ---------------------------
  getSelectedExposure(index: number) {
    this.selectedExposure.set(index);

    const allAds = this.response().data;

    const filteredAds = index === 2 ? allAds.filter((ad: any) => ad.type === 'tgt') : allAds

    this.ads.set(filteredAds);

    this.setAd(filteredAds[0]);
  }

  // ---------------------------
  // 🔁 AD CHANGE
  // ---------------------------
  getSelectedAd(event: any) {
    const index = event.target.value;
    const ad = this.ads()[index];
    this.setAd(ad);

    let perfGroupData = []

    perfGroupData = this.selectedAd().groups.filter((item: any) => item.group != 'Overall').map((group: any) => {
      console.log(group);

      return {
        title: this.selectedAd().title,
        engagement: group.emotionTimelineFirstExposure.overall.emotion.engagement,
        completion: group.emotionTimelineFirstExposure.completion
      };
    });
    console.log(perfGroupData);
    this.groupPerformanceFirstData.set(perfGroupData);

    let perfGroupDataForce = [];
    perfGroupDataForce = this.selectedAd().groups.filter((item: any) => item.group != 'Overall').map((group: any) => {
      return {
        title: this.selectedAd().title,
        engagement: group.emotionTimelineForcedExposure?.overall.emotion.engagement,
        completion: group.emotionTimelineForcedExposure?.completion
      };
    });
    this.groupPerformanceForceData.set(perfGroupDataForce)
  }

  setAd(ad: any) {
    this.selectedAd.set(ad);
    this.groups.set(ad.groups);
    this.setGroup(ad.groups[0]);
  }

  // ---------------------------
  // 🔁 GROUP CHANGE
  // ---------------------------
  getSelectedGroup(event: any) {
    const slug = event.target.value;
    const group = this.groups().find((g: any) => g.slag === slug);
    this.setGroup(group);
  }

  setGroup(group: any) {
    this.selectedGroup.set(group);

    const exposureKey =
      this.selectedExposure() === 1
        ? 'emotionTimelineFirstExposure'
        : 'emotionTimelineForcedExposure';

    let participants = []

    participants = group[exposureKey]?.participant || [];

    this.participants.set(participants);
    this.totalParticipants.set(participants.length - 1);

    this.selectedParticipant.set(participants[0]);
    this.filteredData.set(group);
  }

  // ---------------------------
  // 🔁 PARTICIPANT CHANGE
  // ---------------------------
  getSelectedParticipant(event: any) {
    const index = event.target.value;
    this.selectedParticipant.set(this.participants()[index]);
  }

  // ---------------------------
  // 📡 API DATA
  // ---------------------------
  getOverallData(study_id: any) {
    this._api.getData(`getEmotionData?study_id=${study_id}`).subscribe((response: any) => {

      if (response.error) return;

      response.data = response.data.map((item: any) => {
        item.groups = item.groups.map((groupItem: any) => {
          groupItem.emotionTimelineFirstExposure.participant = [
            {
              cnt_id: item.cnt_id,
              wh_mo_id: 'All',
              user_name: 'All',
              ...groupItem.emotionTimelineFirstExposure.overall
            },
            ...groupItem.emotionTimelineFirstExposure.participant
          ];
          if (groupItem.emotionTimelineForcedExposure) {
            groupItem.emotionTimelineForcedExposure.participant = [
              {
                cnt_id: item.cnt_id,
                wh_mo_id: 'All',
                user_name: 'All',
                ...groupItem.emotionTimelineForcedExposure.overall,
                salientScenes: [...groupItem.emotionTimelineForcedExposure.salientScenes],
              },
              ...groupItem.emotionTimelineForcedExposure.participant
            ];
          }
          return groupItem;
        });

        return item;
      });

      this.response.set(response);

      this.ads.set(response.data);
      if (this.ads()[0].groups.length > 0) {
        this.setAd(this.ads()[0]);
        const perf = response.data.map((ad: any) => {
          const d = ad.groups[0].emotionTimelineFirstExposure;
          return {
            title: ad.title,
            engagement: d.overall.emotion.engagement,
            completion: d.completion
          };
        });

        //console.log(perf);
        this.PerformanceData.set(perf);

        const perfGroupData = response.data[0].groups.filter((item: any) => item.group != 'Overall').map((group: any) => {
          return {
            title: response.data[0].title,
            engagement: group.emotionTimelineFirstExposure.overall.emotion.engagement,
            completion: group.emotionTimelineFirstExposure.completion
          };
        });
        console.log(perfGroupData);
        this.groupPerformanceFirstData.set(perfGroupData);

        const perfGroupDataForce = response.data[0].groups.filter((item: any) => item.group != 'Overall').map((group: any) => {
          return {
            title: response.data[0].title,
            engagement: group.emotionTimelineForcedExposure.overall.emotion.engagement,
            completion: group.emotionTimelineForcedExposure.completion
          };
        });
        this.groupPerformanceForceData.set(perfGroupDataForce);
      }
    });
    this.loading.set(false);
  }
}
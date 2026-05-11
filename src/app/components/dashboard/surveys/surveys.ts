import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../services/api';
import { Loader } from '../../loader/loader';

@Component({
  selector: 'app-surveys',
  imports: [Loader],
  templateUrl: './surveys.html',
  styleUrl: './surveys.css',
})
export class Surveys {
  selectedSurveyId: number = 0;
  comp_id: any;

  rawData: any = signal({}) // your JSON
  totalStudies = 0;
  activeStudies = 0;

  tabs = ["All", "Draft", "Review", "Live", "Complete"];

  allStudies: any = signal([]);
  draftStudies: any = signal([]);
  reviewStudies: any = signal([]);
  liveStudies: any = signal([]);
  CompleteStudies: any = signal([]);
  selectedTab: any = signal('All');


  constructor(private router: Router, private _api: Api) {
    let id = localStorage.getItem('comp_id')
    this.comp_id = id
    this.getStudiesData(this.comp_id);
  }

  viewResult(study: any) {
    this.router.navigate(['/dashboard/analytics'], { queryParams: { study_id: study.study_id, study_name: study.study_name } });
  }

  getStudiesData(comp_id: number) {
    this._api.getDataNodeApi(`get-studies?comp_id=${comp_id}`).subscribe((response: any) => {
      ////console.log(response);
      if (!response.error) {
        this.rawData.set(response.data);
        const complete = this.rawData().complete?.length || 0;
        const draft = this.rawData().draft?.length || 0;
        const live = this.rawData().live?.length || 0;
        this.totalStudies = complete + draft + live;
        this.activeStudies = live;

        // Assuming response = your API data

        this.allStudies.set([
          ...(response.data.draft || []),
          ...(response.data.review || []),
          ...(response.data.live || []),
          ...(response.data.complete || [])
        ]);

        this.draftStudies.set(response.data.draft || []);
        this.reviewStudies.set(response.data.review || []);
        this.liveStudies.set(response.data.live || []);
        this.CompleteStudies.set(response.data.complete || []);
      }

      else {
        ////console.log(response.msg);
      }
    })
  }

  setTab(tab: any) {
  this.selectedTab.set(tab);
}

filteredStudies = computed(() => {
  const tab = this.selectedTab();

  switch (tab) {
    case 'Draft':
      return this.draftStudies();
    case 'Review':
      return this.reviewStudies();
    case 'Live':
      return this.liveStudies();
    case 'Complete':
      return this.CompleteStudies();
    default:
      return this.allStudies();
  }
});

tabCounts: any = computed(() => ({
  All: this.allStudies().length,
  Draft: this.draftStudies().length,
  Review: this.reviewStudies().length,
  Live: this.liveStudies().length,
  Complete: this.CompleteStudies().length
}));
}

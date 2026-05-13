import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  environment = environment;

  constructor(private http: HttpClient) { }

  getData(endpoint: string) {
    return this.http.get(environment.apiUrl + endpoint);
  }

  postData(endpoint: string, params: any){
    return this.http.post(environment.apiUrl + endpoint, params);
  }

  getDataNodeApi(endpoint: string) {
    return this.http.get(environment.nodeApiUrl + endpoint);
  }

  postDataNodeApi(endpoint: string, params: any){
    return this.http.post(environment.nodeApiUrl + endpoint, params);
  }
}

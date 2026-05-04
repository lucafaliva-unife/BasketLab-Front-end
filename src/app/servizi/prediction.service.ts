import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../modelli/team.model';

@Injectable({ providedIn: 'root' })
export class PredictService {

    private predictionUrl: string= 'http://localhost:8080/api/prediction';

    constructor(private http: HttpClient) {}

    public predict(idTeam_1: string, idTeam_2: string): Observable<Team> {
        return this.http.post<Team>(this.predictionUrl, {
            idTeam_1: idTeam_1,
            idTeam_2: idTeam_2
        });
    }

}
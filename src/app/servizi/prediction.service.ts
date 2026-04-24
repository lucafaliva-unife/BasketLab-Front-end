import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../modelli/team.model';
import { Train } from '../modelli/train.model';

//Solo in fase di test
import { TeamService } from './team.service';

@Injectable({ providedIn: 'root' })
export class PredictService {

    private predictionUrl: string= 'http://localhost:3000/api/prediction';

    constructor(private http: HttpClient) {}

    //predict(idTeam_1: number, idTeam_2: number): Observable<Team>
    predict(idTeam_1: number, idTeam_2: number): Team {
        const teamAnalytics_1: Omit<Train, "id_player" | "idx_train">= TeamService.getAnalyticsByTeamId(idTeam_1);
        if(Object.keys(teamAnalytics_1).length === 0) {
            return {} as Team;
        }
        const teamAnalytics_2: Omit<Train, "id_player" | "idx_train">= TeamService.getAnalyticsByTeamId(idTeam_2);
        if(Object.keys(teamAnalytics_2).length === 0) {
            return {} as Team;
        }
        teamAnalytics_1.tempo_corsa= 1 / teamAnalytics_1.tempo_corsa;
        teamAnalytics_2.tempo_corsa= 1 / teamAnalytics_2.tempo_corsa;
        const teamScore_1: number= (teamAnalytics_1.percentuale_tiri + teamAnalytics_1.tempo_corsa) / 2;
        const teamScore_2: number= (teamAnalytics_2.percentuale_tiri + teamAnalytics_2.tempo_corsa) / 2;
        if(teamScore_1 >= teamScore_2) {
            //Favorisco chi gioca in casa
            return TeamService.getTeamById(idTeam_1);
        } else {
            return TeamService.getTeamById(idTeam_2);
        }
        /*
        return this.http.post<Team>(predictionUrl, {
            idTeam_1: this.idTeam_1,
            idTeam_2: this.idTeam_2
        });
        */
    }

}
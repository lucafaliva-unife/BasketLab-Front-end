import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../modelli/team.model';
import { Train } from '../modelli/train.model';
import { Player } from '../modelli/player.model'

//Solo in fase di test
import { PlayerService } from './player.service';

@Injectable({ providedIn: 'root' })
export class PredictionService {

    private predictionUrl: string= 'http://localhost:3000/api/prediction';

    constructor(private http: HttpClient) {}

    //predict(idTeam_1: number, idTeam_2: number): Observable<Omit<Team, "id_team">>
    predict(idTeam_1: number, idTeam_2: number): Omit<Team, "id_team"> {
        /*
        return this.http.post<Omit<Team, "id_team">>(predictionUrl, {
            idTeam_1: this.idTeam_1,
            idTeam_2: this.idTeam_2
        });
        */
    }

}
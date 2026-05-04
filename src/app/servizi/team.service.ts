import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../modelli/team.model';
import { Train } from '../modelli/train.model';
import { Player } from '../modelli/player.model'

@Injectable({ providedIn: 'root' })
export class TeamService {

    /*
    private teamsUrl: string= 'http://localhost:8080/api/teams';
    */
    private teamsUrl: string= 'api/teams';

    constructor(private http: HttpClient) {}

    public getTeams(): Observable<Team[]> {
        return this.http.get<Team[]>(this.teamsUrl);
    }

    public getTeamById(id: string): Observable<Team> {
        return this.http.get<Team>(`${this.teamsUrl}/${id}`);
    }

    public createTeam(team: Omit<Team, "id_team">): Observable<void> {
        return this.http.post<void>(this.teamsUrl, {...team});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
    }

    public editTeamById(id: string, editedTeam: Omit<Team, "id_team">): Observable<void> {
        return this.http.put<void>(`${this.teamsUrl}/${id}`, {...editedTeam});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
    }

    public deleteTeamById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.teamsUrl}/${id}`);
    }

    public getAnalyticsByTeamId(id: string): Observable<Omit<Train, "id_player" | "idx_train">> {
        return this.http.get<Omit<Train, "id_player" | "idx_train">>(`${this.teamsUrl}/${id}/analytics`);
    }

    public getRankingByTeamId(id: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.teamsUrl}/${id}/ranking`);
    }

    public getPlayersByTeamId(id: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.teamsUrl}/${id}/players`);
    }

}
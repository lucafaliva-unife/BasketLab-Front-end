import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../modelli/team.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {

    private teamsUrl: string= 'http://localhost:3000/api/teams';

    //Solo in fase di test
    private dummy_teams: Team[]= [
        {
            id_team: 1,
            nome: "Team 1",
            citta: "Ferrara"
        },
        {
            id_team: 2,
            nome: "Team 2",
            citta: "Bologna"
        },
        {
            id_team: 3,
            nome: "Team 3",
            citta: "Parma"
        }
    ];

    constructor(private http: HttpClient) {}

    //getTeams(): Observable<Team[]>
    getTeams(): Team[] {
        return this.dummy_teams;
        /*
        return this.http.get<Team[]>(this.teamsUrl);
        */
    }

    //getTeamById(id: number): Observable<Team>
    getTeamById(id: number): Team | null {
        const team: Team | undefined= this.dummy_teams.find(team => team.id_team === id);
        if(team) {
            return team;
        } else {
            return null;
        }
        /*
        return this.http.get<Team>(`${this.teamsUrl}/${id}`);
        */
    }

    //createTeam(team: Omit<Team, "id_team">): Observable<Team>
    createTeam(team: Omit<Team, "id_team">): void {
        const ids: number[]= this.dummy_teams.map(team => team.id_team);
        const maxId: number= Math.max(...ids);
        const id: number= maxId + 1;
        const newTeam: Team= {
            id_team: id,
            ...team
        };
        this.dummy_teams.push(newTeam);
        /*
        return this.http.post<Team>(this.teamsUrl, {...team});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
        */
    }

    //editTeamById(id: number, editedTeam: Omit<Team, "id_team">): Observable<Team>
    editTeamById(id: number, editedTeam: Omit<Team, "id_team">): boolean {
        const index= this.dummy_teams.findIndex(team => team.id_team === id);
        if(index !== -1) {
            this.dummy_teams[index]= {
                id_team: id,
                ...editedTeam
            };
            return true;
        } else {
            return false;
        }
        /*
        return this.http.put<Team>(`${this.teamsUrl}/${id}`, {...editedTeam});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
        */
    }

    //deleteTeamById(id: number): Observable<void>
    deleteTeamById(id: number): boolean {
        const index= this.dummy_teams.findIndex(team => team.id_team === id);
        if(index !== -1) {
            this.dummy_teams.splice(index, 1);
            return true;
        } else {
            return false;
        }
        /*
        return this.http.delete<Team>(`${this.teamsUrl}/${id}`);
        */
    }

}
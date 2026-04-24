import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../modelli/team.model';
import { Train } from '../modelli/train.model';
import { Player } from '../modelli/player.model'

//Solo in fase di test
import { PlayerService } from './player.service';

@Injectable({ providedIn: 'root' })
export class TeamService {

    private teamsUrl: string= 'http://localhost:3000/api/teams';

    //Solo in fase di test
    public static dummy_teams: Team[]= [
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
        },
        {
            id_team: 4,
            nome: "Team Vuoto",
            citta: "Modena"
        }
    ];

    constructor(private http: HttpClient) {}

    //getTeams(): Observable<Team[]>
    public static getTeams(): Team[] {
        return structuredClone(TeamService.dummy_teams);
        /*
        return this.http.get<Team[]>(this.teamsUrl);
        */
    }

    //getTeamById(id: number): Observable<Team>
    public static getTeamById(id: number): Team {
        const team: Team | undefined= TeamService.dummy_teams.find(team => team.id_team === id);
        if(team) {
            return team;
        } else {
            return {} as Team;
        }
        /*
        return this.http.get<Team>(`${this.teamsUrl}/${id}`);
        */
    }

    //createTeam(team: Omit<Team, "id_team">): Observable<{ result: boolean }>
    public static createTeam(team: Omit<Team, "id_team">): { result: boolean } {
        const ids: number[]= TeamService.dummy_teams.map(team => team.id_team);
        let id: number= 1;
        if(ids.length !== 0) {
            const maxId: number= Math.max(...ids);
            id= maxId + 1;
        }
        const newTeam: Team= {
            id_team: id,
            ...team
        };
        TeamService.dummy_teams.push(newTeam);
        return { result: true };
        /*
        return this.http.post<{ result: boolean }>(this.teamsUrl, {...team});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
        */
    }

    //editTeamById(id: number, editedTeam: Omit<Team, "id_team">): Observable<{ result: boolean }>
    public static editTeamById(id: number, editedTeam: Omit<Team, "id_team">): { result: boolean } {
        const index= TeamService.dummy_teams.findIndex(team => team.id_team === id);
        if(index !== -1) {
            TeamService.dummy_teams[index]= {
                id_team: id,
                ...editedTeam
            };
            return { result: true };
        } else {
            return { result: false };
        }
        /*
        return this.http.put<{ result: boolean }>(`${this.teamsUrl}/${id}`, {...editedTeam});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
        */
    }

    //deleteTeamById(id: number): Observable<{ result: boolean }>
    public static deleteTeamById(id: number): { result: boolean } {
        const index= TeamService.dummy_teams.findIndex(team => team.id_team === id);
        if(index !== -1) {
            TeamService.dummy_teams.splice(index, 1);
            return { result: true };
        } else {
            return { result: false };
        }
        /*
        return this.http.delete<{ result: boolean }>(`${this.teamsUrl}/${id}`);
        */
    }

    //getAnalyticsByTeamId(id: number): Observable<Omit<Train, "id_player" | "idx_train">>
    public static getAnalyticsByTeamId(id: number): Omit<Train, "id_player" | "idx_train"> {
        const teamPlayers: Player[]= PlayerService.getPlayersByTeamId(id);
        if(teamPlayers.length === 0) {
            return {} as Omit<Train, "id_player" | "idx_train">;
        }
        const teamPlayersId: number[]= teamPlayers.map(player => player.id_player);
        const teamTrain: Train[]= [];
        PlayerService.dummy_trains.forEach(train => {
            if(teamPlayersId.includes(train.id_player)) {
                teamTrain.push(train);
            }
        });
        if(teamTrain.length === 0) {
            return {} as Omit<Train, "id_player" | "idx_train">;
        }
        // calcolo media per colonna (escludendo id_player e idx_train)
        const result: any= {};
        const keys= Object.keys(teamTrain[0]) as (keyof Train)[];
        keys.forEach(key => {
            if(key === "id_player" || key === "idx_train") return;
            const somma= teamTrain.reduce((acc, t) => acc + (t[key] as number), 0);
            result[key]= somma / teamTrain.length;
        });
        return result as Omit<Train, "id_player" | "idx_train">;
        /*
        return this.http.get<Omit<Train, "id_player" | "idx_train">>(`${this.teamsUrl}/${id}/analytics`);
        */
    }

    //getRankingByTeamId(id: number): Observable<Player[]>
    public static getRankingByTeamId(id: number): Player[] {
        const teamPlayers: Player[]= PlayerService.dummy_players.filter(player => player.id_team === id);
        if(teamPlayers.length === 0) {
            return [] as Player[];
        }
        const teamPlayersId: number[]= teamPlayers.map(player => player.id_player);
        const trains= PlayerService.dummy_trains.filter(train =>
            teamPlayersId.includes(train.id_player)
        );
        const statsMap= new Map<number, {
            tiri: number;
            scoreCorsa: number;
            count: number;
        }>();
        trains.forEach(train => {
            const current= statsMap.get(train.id_player) || {
                tiri: 0,
                scoreCorsa: 0,
                count: 0
            };
            current.tiri+= train.percentuale_tiri;
            current.scoreCorsa+= (1 / train.tempo_corsa);
            current.count+= 1;
            statsMap.set(train.id_player, current);
        });
        const rankedPlayers= Array.from(statsMap.entries()).map(([id_player, stats]) => {
            const avgTiri= stats.tiri / stats.count;
            const avgCorsa= stats.scoreCorsa / stats.count;
            return {
                player: teamPlayers.find(p => p.id_player === id_player)!,
                performance: (avgTiri + avgCorsa) / 2
            };
        });
        const orderedPlayers= rankedPlayers
            .sort((a, b) => b.performance - a.performance)
            .map(item => item.player);
        const playersWithoutTrains= teamPlayers.filter(player =>
            !statsMap.has(player.id_player)
        );
        return [...orderedPlayers, ...playersWithoutTrains];
        /*
        return this.http.get<Player[]>(`${this.teamsUrl}/${id}/ranking`);
        */
    }

}
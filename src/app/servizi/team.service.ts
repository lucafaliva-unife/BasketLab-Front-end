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

    //getTeamById(id: number): Observable<Team | null>
    getTeamById(id: number): Team | null {
        const team: Team | undefined= this.dummy_teams.find(team => team.id_team === id);
        if(team) {
            return team;
        } else {
            return null;
        }
        /*
        return this.http.get<Team | null>(`${this.teamsUrl}/${id}`);
        */
    }

    //createTeam(team: Omit<Team, "id_team">): Observable<void>
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
        return this.http.post<void>(this.teamsUrl, {...team});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
        */
    }

    //editTeamById(id: number, editedTeam: Omit<Team, "id_team">): Observable<boolean>
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
        return this.http.put<boolean>(`${this.teamsUrl}/${id}`, {...editedTeam});
        //L'ID del team viene gestito dal backend (auto increment sul DB)
        */
    }

    //deleteTeamById(id: number): Observable<boolean>
    deleteTeamById(id: number): boolean {
        const index= this.dummy_teams.findIndex(team => team.id_team === id);
        if(index !== -1) {
            this.dummy_teams.splice(index, 1);
            return true;
        } else {
            return false;
        }
        /*
        return this.http.delete<boolean>(`${this.teamsUrl}/${id}`);
        */
    }

    //getAnalyticsByTeamId(id: number): Observable<Omit<Train, "id_player" | "idx_train"> | null>
    getAnalyticsByTeamId(id: number): Omit<Train, "id_player" | "idx_train"> | null {
        const teamPlayers: Player[] | null= PlayerService.getPlayersByTeamId(id);
        if(teamPlayers === null) {
            return null;
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
        return this.http.get<Omit<Train, "id_player" | "idx_train"> | null>(`${this.teamsUrl}/${id}/analytics`);
        */
    }

    //getRankingByTeamId(id: number): Observable<Omit<Player, "id_player">[] | null>
    //Ritorno null se il team non esiste, [] se il team non ha giocatori, [] se almeno un giocatore non ha allenamenti
    getRankingByTeamId(id: number): Omit<Player, "id_player">[] | null {
        const teamPlayers: Player[] | null = PlayerService.getPlayersByTeamId(id);
        if(teamPlayers === null) {
            return null;
        }
        if(teamPlayers.length === 0) {
            return [] as Omit<Player, "id_player">[];
        }
        const teamPlayersId: number[]= teamPlayers.map(player => player.id_player);
        const trains= PlayerService.dummy_trains.filter(train =>
            teamPlayersId.includes(train.id_player)
        );
        const playersWithTrain= new Set(trains.map(t => t.id_player));
        const allPlayersHaveTrain= teamPlayersId.every(id =>
            playersWithTrain.has(id)
        );
        if(!allPlayersHaveTrain) {
            return [] as Omit<Player, "id_player">[];
        }
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
            current.tiri+= train.percenutale_tiri;
            current.scoreCorsa+= (1 / train.tempo_corsa);
            current.count+= 1;
            statsMap.set(train.id_player, current);
        });
        const ranking= Array.from(statsMap.entries()).map(([id_player, stats]) => {
            const avgTiri= stats.tiri / stats.count;
            const avgCorsa= stats.scoreCorsa / stats.count;
            const performance= (avgTiri + avgCorsa) / 2;
            const player= teamPlayers.find(p => p.id_player === id_player)!;
            const { id_player: _, ...rest }= player;
            return {
                ...rest,
                performance
            };
        });
        return ranking.sort((a: any, b: any) => b.performance - a.performance);
        /*
        return this.http.get<Omit<Player, "id_player">[] | null>(`${this.teamsUrl}/${id}/ranking`);
        */
    }

}
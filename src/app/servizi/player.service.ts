import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../modelli/player.model';
import { Train } from '../modelli/train.model'

@Injectable({ providedIn: 'root' })
export class PlayerService {

    private playersUrl: string= "http://localhost:3000/api/players";
    private teamsUrl: string= "http://localhost:3000/api/teams";

    //Solo in fase di test
    public static dummy_players: Player[]= [
        {
            id_player: 1,    
            nome: "Nome 1",
            cognome: "Cognome 1",
            data_nascita: "2000-01-01",
            ruolo: "ruolo_1",
            peso: 70,
            altezza: 190,
            id_team: 3
        },
        {
            id_player: 2,    
            nome: "Nome 2",
            cognome: "Cognome 2",
            data_nascita: "2000-10-01",
            ruolo: "ruolo_3",
            peso: 60,
            altezza: 170,
            id_team: 1
        },
        {
            id_player: 3,    
            nome: "Nome 3",
            cognome: "Cognome 3",
            data_nascita: "2000-01-10",
            ruolo: "ruolo_2",
            peso: 80,
            altezza: 190,
            id_team: 2
        }
    ];

    //Solo in fase di test
    public static dummy_trains: Train[]= [
        {
            id_player: 1,
            idx_train: 1,
            percentuale_tiri: 89.56,
            tempo_corsa: 17.22
        },
        {
            id_player: 1,
            idx_train: 2,
            percentuale_tiri: 91.48,
            tempo_corsa: 15.97
        },
        {
            id_player: 2,
            idx_train: 1,
            percentuale_tiri: 97.03,
            tempo_corsa: 16.34
        },
        {
            id_player: 3,
            idx_train: 1,
            percentuale_tiri: 93.81,
            tempo_corsa: 14.59
        },
    ];

    constructor(private http: HttpClient) {}

    //getPlayerById(id: number): Observable<Player>
    public static getPlayerById(id: number): Player {
        const player: Player | undefined= PlayerService.dummy_players.find(player => player.id_player === id);
        if(player) {
            return structuredClone(player);
        } else {
            return {} as Player;
        }
        /*
        return this.http.get<Player>(`${this.playersUrl}/${id}`);
        */
    }

    //createPlayer(player: Omit<Player, "id_player">): Observable<{ result: boolean }>
    public static createPlayer(player: Omit<Player, "id_player">): { result: boolean } {
        const ids: number[]= PlayerService.dummy_players.map(player => player.id_player);
        let id: number= 1;
        if(ids.length !== 0) {
            const maxId: number= Math.max(...ids);
            id= maxId + 1;
        }
        const newPlayer: Player= {
            id_player: id,
            ...player
        };
        PlayerService.dummy_players.push(newPlayer);
        return { result: true }
        /*
        return this.http.post<{ result: boolean }>(this.playersUrl, {...player});
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        */
    }

    //editPlayerById(id: number, editedPlayer: Omit<Player, "id_player">): Observable<{ result: boolean }>
    public static editPlayerById(id: number, editedPlayer: Omit<Player, "id_player">): { result: boolean } {
        const index= PlayerService.dummy_players.findIndex(player => player.id_player === id);
        if(index !== -1) {
            PlayerService.dummy_players[index]= {
                id_player: id,
                ...editedPlayer
            };
            return { result: true };
        } else {
            return { result: false };
        }
        /*
        return this.http.put<{ result: boolean }>(`${this.playersUrl}/${id}`, {...editedPlayer});
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        */
    }

    //deletePlayerById(id: number): Observable<{ result: boolean }>
    public static deletePlayerById(id: number): { result: boolean} {
        const index= PlayerService.dummy_players.findIndex(player => player.id_player === id);
        if(index !== -1) {
            PlayerService.dummy_players.splice(index, 1);
            return { result: true };
        } else {
            return { result: false };
        }
        /*
        return this.http.delete<{ result: boolean }>(`${this.playersUrl}/${id}`);
        */
    }

    //getPlayersByTeamId(id: number): Observable<Player[]>
    public static getPlayersByTeamId(id: number): Player[] {
        const teamExists: boolean= this.dummy_players.some(player => player.id_team === id);
        if(teamExists) {
            return structuredClone(this.dummy_players.filter(player => player.id_team === id));
        } else {
            return [] as Player[];
        }
        /*
        return this.http.get<Player[]>(`${this.teamsUrl}/${id}/players`);
        */
    }

    //getTrainsByPlayerId(id: number): Observable<Train[]>
    public static getTrainsByPlayerId(id: number): Train[] {
        const playerExists: boolean= PlayerService.dummy_players.some(player => player.id_player === id);
        if(playerExists) {
            return structuredClone(PlayerService.dummy_trains.filter(train => train.id_player === id));
        } else {
            return [] as Train[];
        }
        /*
        return this.http.get<Train[]>(`${this.playersUrl}/${id}/train`);
        */
    }

    //trainPlayerById(id: number, train: Omit<Train, "idx_train" | "id_player">): Observable<{ result: boolean }>
    public static trainPlayerById(id: number, train: Omit<Train, "idx_train" | "id_player">): { result: boolean } {
        const playerExists: boolean= PlayerService.dummy_players.some(player => player.id_player === id);
        if(playerExists) {
            const playerTrains: Train[]= PlayerService.dummy_trains.filter(train => train.id_player === id);
            const idxs: number[]= playerTrains.map(train => train.idx_train);
            let idx: number= 1;
            if(idxs.length !== 0) {
                const maxIdx: number= Math.max(...idxs);
                idx= maxIdx + 1;
            }
            PlayerService.dummy_trains.push({
                id_player: id,
                idx_train: idx,
                ...train
            });
            return { result: true };
        } else {
            return { result: false };
        }
        /*
        return this.http.post<{ result: boolean }>(`${this.playersUrl}/${id}/train`, {
            id_player: id,
            ...train
        });
        */
    }

}
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
            data_nascita: new Date("01/01/2000"),
            ruolo: "ruolo_1",
            peso: 70,
            altezza: 190,
            id_team: 3
        },
        {
            id_player: 2,    
            nome: "Nome 2",
            cognome: "Cognome 2",
            data_nascita: new Date("01/10/2000"),
            ruolo: "ruolo_3",
            peso: 60,
            altezza: 170,
            id_team: 1
        },
        {
            id_player: 3,    
            nome: "Nome 3",
            cognome: "Cognome 3",
            data_nascita: new Date("10/01/2000"),
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
            percenutale_tiri: 89.56,
            tempo_corsa: 17.22
        },
        {
            id_player: 1,
            idx_train: 2,
            percenutale_tiri: 91.48,
            tempo_corsa: 15.97
        },
        {
            id_player: 2,
            idx_train: 1,
            percenutale_tiri: 97.03,
            tempo_corsa: 16.34
        },
        {
            id_player: 3,
            idx_train: 1,
            percenutale_tiri: 93.81,
            tempo_corsa: 14.59
        },
    ];

    constructor(private http: HttpClient) {}

    //getPlayerById(id: number): Observable<Player | null>
    public static getPlayerById(id: number): Player | null {
        const player: Player | undefined= PlayerService.dummy_players.find(player => player.id_player === id);
        if(player) {
            return player;
        } else {
            return null;
        }
        /*
        return this.http.get<Player | null>(`${this.playersUrl}/${id}`);
        */
    }

    //createPlayer(player: Omit<Player, "id_player">): Observable<void>
    public static createPlayer(player: Omit<Player, "id_player">): void {
        const ids: number[]= PlayerService.dummy_players.map(player => player.id_player);
        const maxId: number= Math.max(...ids);
        const id: number= maxId + 1;
        const newPlayer: Player= {
            id_player: id,
            ...player
        };
        PlayerService.dummy_players.push(newPlayer);
        /*
        return this.http.post<void>(this.playersUrl, {...player});
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        */
    }

    //editPlayerById(id: number, editedPlayer: Omit<Player, "id_player">): Observable<boolean>
    public static editPlayerById(id: number, editedPlayer: Omit<Player, "id_player">): boolean {
        const index= PlayerService.dummy_players.findIndex(player => player.id_player === id);
        if(index !== -1) {
            PlayerService.dummy_players[index]= {
                id_player: id,
                ...editedPlayer
            };
            return true;
        } else {
            return false;
        }
        /*
        return this.http.put<boolean>(`${this.playersUrl}/${id}`, {...editedPlayer});
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        */
    }

    //deletePlayerById(id: number): Observable<boolean>
    public static deletePlayerById(id: number): boolean {
        const index= PlayerService.dummy_players.findIndex(player => player.id_player === id);
        if(index !== -1) {
            PlayerService.dummy_players.splice(index, 1);
            return true;
        } else {
            return false;
        }
        /*
        return this.http.delete<boolean>(`${this.playersUrl}/${id}`);
        */
    }

    //getPlayersByTeamId(id: number): Observable<Player[] | null>
    public static getPlayersByTeamId(id: number): Player[] | null {
        const teamExists: boolean= this.dummy_players.some(player => player.id_team === id);
        if(teamExists) {
            return this.dummy_players.filter(player => player.id_team === id);
        } else {
            return null;
        }
        /*
        return this.http.get<Player[] | null>(`${this.teamsUrl}/${id}/players`);
        */
    }

    //getTrainsByPlayerId(id: number): Observable<Train[] | null>
    public static getTrainsByPlayerId(id: number): Train[] | null {
        const playerExists: boolean= PlayerService.dummy_players.some(player => player.id_team === id);
        if(playerExists) {
            return PlayerService.dummy_trains.filter(train => train.id_player === id);
        } else {
            return null;
        }
        /*
        return this.http.get<Train[] | null>(`${this.playersUrl}/${id}/train`);
        */
    }

    //trainPlayerById(id: number): Observable<boolean>
    public static trainPlayerById(id: number, train: Omit<Train, "id_player">): boolean {
        const playerExists: boolean= PlayerService.dummy_players.some(player => player.id_team === id);
        if(playerExists) {
            PlayerService.dummy_trains.push({
                id_player: id,
                ...train
            });
            return true;
        } else {
            return false;
        }
        /*
        return this.http.post<boolean>(`${this.playersUrl}/${id}/train`, {
            id_player: id,
            ...train
        });
        */
    }

}
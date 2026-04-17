import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../modelli/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {

    private playersUrl: string= "http://localhost:3000/api/players";
    private teamsUrl: string= "http://localhost:3000/api/teams";

    //Solo in fase di test
    private dummy_players: Player[]= [
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

    constructor(private http: HttpClient) {}

    //getPlayerById(id: number): Observable<Player>
    getPlayerById(id: number): Player | null {
        const player: Player | undefined= this.dummy_players.find(player => player.id_player === id);
        if(player) {
            return player;
        } else {
            return null;
        }
        /*
        return this.http.get<Player>(`${this.playersUrl}/${id}`);
        */
    }

    //createPlayer(player: Omit<Player, "id_player">): Observable<Player>
    createPlayer(player: Omit<Player, "id_player">): void {
        const ids: number[]= this.dummy_players.map(player => player.id_player);
        const maxId: number= Math.max(...ids);
        const id: number= maxId + 1;
        const newPlayer: Player= {
            id_player: id,
            ...player
        };
        this.dummy_players.push(newPlayer);
        /*
        return this.http.post<Player>(this.playersUrl, {...player});
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        */
    }

    //editPlayerById(id: number, editedPlayer: Omit<Player, "id_player">): Observable<Player>
    editPlayerById(id: number, editedPlayer: Omit<Player, "id_player">): boolean {
        const index= this.dummy_players.findIndex(player => player.id_player === id);
        if(index !== -1) {
            this.dummy_players[index]= {
                id_player: id,
                ...editedPlayer
            };
            return true;
        } else {
            return false;
        }
        /*
        return this.http.put<Player>(`${this.playersUrl}/${id}`, {...editedPlayer});
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        */
    }

    //deletePlayerById(id: number): Observable<void>
    deletePlayerById(id: number): boolean {
        const index= this.dummy_players.findIndex(player => player.id_player === id);
        if(index !== -1) {
            this.dummy_players.splice(index, 1);
            return true;
        } else {
            return false;
        }
        /*
        return this.http.delete<void>(`${this.playersUrl}/${id}`);
        */
    }

    //getPlayersByTeamId(id: number): Observable<Player[]>
    getPlayersByTeamId(id: number): Player[] | null {
        const teamExists: boolean= this.dummy_players.some(player => player.id_team === id);
        if(teamExists) {
            return this.dummy_players.filter(player => player.id_team === id);
        } else {
            return null;
        }
        /*
        return this.http.get<void>(`${this.teamsUrl}/${id}/players`)
        */
    }

}
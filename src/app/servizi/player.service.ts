import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../modelli/player.model';
import { Train } from '../modelli/train.model'

@Injectable({ providedIn: 'root' })
export class PlayerService {

    private playersUrl: string= "http://localhost:3000/api/players";
    private teamsUrl: string= "http://localhost:3000/api/teams";

    constructor(private http: HttpClient) {}

    public getPlayerById(id: string): Observable<Player> {
        return this.http.get<Player>(`${this.playersUrl}/${id}`);
    }

    public createPlayer(player: Omit<Player, "id_player">): Observable<void> {
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        return this.http.post<void>(this.playersUrl, {...player});
    }

    public editPlayerById(id: string, editedPlayer: Omit<Player, "id_player">): Observable<void> {
        //L'ID del player viene gestito dal backend (auto increment sul DB)
        return this.http.put<void>(`${this.playersUrl}/${id}`, {...editedPlayer});
    }

    public deletePlayerById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.playersUrl}/${id}`);
    }

    public getPlayersByTeamId(id: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.teamsUrl}/${id}/players`);
    }

    public getTrainsByPlayerId(id: string): Observable<Train[]> {
        return this.http.get<Train[]>(`${this.playersUrl}/${id}/train`);
    }

    public trainPlayerById(id: string, train: Omit<Train, "idx_train" | "id_player">): Observable<void> {
        return this.http.post<void>(`${this.playersUrl}/${id}/train`, {
            id_player: id,
            ...train
        });
    }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../modelli/match.model';

@Injectable({ providedIn: 'root' })
export class MatchService {

    /*
    private matchesUrl: string= 'http://localhost:8080/api/matches';
    */
    private matchesUrl: string= 'api/matches';

    constructor(private http: HttpClient) {}

    public getMatches(): Observable<Match[]> {
        return this.http.get<Match[]>(this.matchesUrl);
    }

    public createMatch(match: Omit<Match, "id_match">): Observable<void> {
        //L'ID del match viene gestito dal backend (auto increment sul DB)
        return this.http.post<void>(this.matchesUrl, {...match});
    }

    public editMatchById(id: string, editedMatch: Omit<Match, "id_match">): Observable<void> {
        return this.http.put<void>(`${this.matchesUrl}/${id}`, {...editedMatch});
    }

    public deleteMatchById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.matchesUrl}/${id}`);
    }

}
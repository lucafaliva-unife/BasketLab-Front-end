import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../servizi/team.service';
import { Team } from '../../modelli/team.model';
import { Train } from '../../modelli/train.model';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    standalone: true,
    selector: 'app-predict',
    imports: [CommonModule, FormsModule],
    templateUrl: './predict.component.html',
    styleUrls: ['./predict.component.css']
})
export class PredictComponent implements OnInit {
    selectedTeamId_1: string | null= null;
    selectedTeamId_2: string | null= null;
    teams: Team[]= [];
    guessedTeam: string | null= null;
    guessedTeamOk: boolean= false;
    teamAnalytics_1: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    teamAnalytics_2: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    percentualeTiriWeigth: number= 0.5;
    tempoCorsaWeigth: number= 0.5;
    loserTeamName: string | null= null;
    teamScoreWinner: number= 0;
    teamScoreLoser: number= 0;
    winnerTeamId: string | null= null;
    loserTeamId: string | null= null;

    constructor(private teamService: TeamService, private router: Router) {}

    /*
    Questa funzione scarica l'elenco dei team, controlla che ce ne sia almeno uno ed esclude quello degli svincolati.
    */
    resetTeams(): void {
        this.teamService.getTeams().subscribe(teams => {
            this.teams= teams;
            // Se esiste almeno un team allora rimuovo quello degli svincolati dalla lista
            if(this.teams.length !== 0) {
                this.teams= this.teams.filter(team => team.nome !== "Svincolati");
            }
        });
    }

    ngOnInit(): void {
        //Carico i team
        this.resetTeams();
    }

    /*
    Questa funzione resetta lo stato del componente ed aggiorna la lista dei team.
    */
    reset(): void {
        this.selectedTeamId_1= null;
        this.selectedTeamId_2= null;
        this.winnerTeamId= null;
        this.loserTeamId= null;
        this.guessedTeam= null;
        this.loserTeamName= null;
        this.guessedTeamOk= false;
        this.teamScoreLoser= 0;
        this.teamScoreWinner= 0;
        this.percentualeTiriWeigth= 0.5;
        this.tempoCorsaWeigth= 0.5;
        this.resetTeams();
    }

    /*
    Questa funzione prende in input l'ID di un team, scarica i dati del team e restituisce una promise che quando
    diventa fullfilled ritorna un errore oppure il nome del team.
    */
    private async getTeamNameById(teamId: string): Promise<string> {
        const promise: Promise<string>= new Promise<string>((resolve, reject) => {
            this.teamService.getTeamById(teamId).subscribe({
                next: (team) => {
                    resolve(team.nome);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /*
    Questa funzione prende in input l'ID di un team, scarica l'analytics del team e restituisce una promise che quando
    diventa fullfilled ritorna un errore oppure l'analytics del team.
    */
    private async getAnalyticsByTeamId(teamId: string): Promise<Omit<Train, "id_player" | "idx_train">> {
        const promise: Promise<Omit<Train, "id_player" | "idx_train">>= new Promise<Omit<Train, "id_player" | "idx_train">>((resolve, reject) => {
            this.teamService.getAnalyticsByTeamId(teamId).subscribe({
                next: (analytics) => {
                    resolve(analytics);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /*
    Questa funzione calcola lo score dei due team usando i loro analytics e decide quale è il favorito.
    Infine scarica i dati dei due team per mostrare all'utente i loro nomi dati i loro ID.
    */
    async compareTeams(): Promise<void> {
        this.tempoCorsaWeigth= 1 - this.percentualeTiriWeigth; // Calcolo il peso del tempo corsa
        const percentualeTiri_1= this.teamAnalytics_1.percentuale_tiri ?? 0; // Uso come default 0
        const tempoCorsa_1= this.teamAnalytics_1.tempo_corsa ?? 1; // Uso come default 1
        const percentualeTiri_2= this.teamAnalytics_2.percentuale_tiri ?? 0; // Uso come default 0
        const tempoCorsa_2= this.teamAnalytics_2.tempo_corsa ?? 1; // Uso come default 1
        // Calcolo lo score del team 1
        const teamScore_1= (
            percentualeTiri_1 * this.percentualeTiriWeigth
            +
            (100 / tempoCorsa_1) * this.tempoCorsaWeigth
        ) / (this.percentualeTiriWeigth + this.tempoCorsaWeigth);
        // Calcolo lo score del team 2
        const teamScore_2= (
            percentualeTiri_2 * this.percentualeTiriWeigth
            +
            (100 / tempoCorsa_2) * this.tempoCorsaWeigth
        ) / (this.percentualeTiriWeigth + this.tempoCorsaWeigth);
        // Valuto quale sia il team con lo score più alto. Favorisco chi gioca in casa usando '>='
        if(teamScore_1 >= teamScore_2) {
            this.winnerTeamId= this.selectedTeamId_1;
            this.loserTeamId= this.selectedTeamId_2;
            this.teamScoreWinner= teamScore_1;
            this.teamScoreLoser= teamScore_2;
        } else {
            this.winnerTeamId= this.selectedTeamId_2;
            this.loserTeamId= this.selectedTeamId_1;
            this.teamScoreWinner= teamScore_2;
            this.teamScoreLoser= teamScore_1;
        }
        // Recupero il nome del team vincitore
        try {
            this.guessedTeam= await this.getTeamNameById(this.winnerTeamId!);
        } catch(err) {
            // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
            if((err as HttpErrorResponse).status === 404) {
                alert("Errore: team ipotizzato come vincitore non esistente");
            } else {
                alert("Errore: " + (err as HttpErrorResponse).error);
            }
            this.router.navigate(["/teams"]);
            return;
        }
        // Recupero il nome del team perdente
        try {
            this.loserTeamName= await this.getTeamNameById(this.loserTeamId!);
        } catch(err) {
            // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
            if((err as HttpErrorResponse).status === 404) {
                alert("Errore: team ipotizzato come perdente non esistente");
            } else {
                alert("Errore: " + (err as HttpErrorResponse).error);
            }
            this.router.navigate(["/teams"]);
            return;
        }
        // Visualizzo il nome del team vincitore ed i punteggi di entrambi i team
        this.guessedTeamOk= true;
    }

    /*
    Questa funzione scarica gli analytics dei due team, si assicura che entrambi abbiano un analytics valido (quindi con
    degli allenamenti applicati ai suoi player) ed infine li confronta per decidere il vincitore.
    */
    async predict(): Promise<void> {
        if(this.selectedTeamId_1 && this.selectedTeamId_2) {
            // Controllo che i due team selezionati siano diversi
            if(this.selectedTeamId_1 === this.selectedTeamId_2) {
                alert("Selezionare due team diversi");
                return;
            }
            // Scarico l'analytics del team 1
            try {
                this.teamAnalytics_1= await this.getAnalyticsByTeamId(this.selectedTeamId_1);
                // Se il team non ha allenamenti allora mi fermo e do un errore
                if(Object.keys(this.teamAnalytics_1).length === 0) {
                    alert("Il team 1 non ha allenamenti: scegliere un altro team");
                    return;
                }
            } catch(err) {
                // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
                if((err as HttpErrorResponse).status === 404) {
                    alert("Errore: team 1 non esistente");
                } else {
                    alert("Errore " + (err as HttpErrorResponse).status);
                }
                this.reset();
                return;
            }
            // Scarico l'analytics del team 2
            try {
                this.teamAnalytics_2= await this.getAnalyticsByTeamId(this.selectedTeamId_2);
                // Se il team non ha allenamenti allora mi fermo e do un errore
                if(Object.keys(this.teamAnalytics_2).length === 0) {
                    alert("Il team 2 non ha allenamenti: scegliere un altro team");
                    return;
                }
            } catch(err) {
                // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
                if((err as HttpErrorResponse).status === 404) {
                    alert("Errore: team 2 non esistente");
                } else {
                    alert("Errore " + (err as HttpErrorResponse).status);
                }
                this.reset();
                return;
            }
            // Se sono arrivato fino a qui allora entrambi i team hanno un analytics e quindi li confronto
            this.compareTeams();
        } else {
            alert("Errore: selezionare entrambi i teams");
            this.guessedTeamOk= false;
        }
    }

}
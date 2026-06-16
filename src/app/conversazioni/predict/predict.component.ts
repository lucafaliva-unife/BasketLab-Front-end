import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../servizi/team.service';
import { Team } from '../../modelli/team.model';
import { Train } from '../../modelli/train.model';
import { Router } from '@angular/router';

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
    noTeams: boolean= false;
    teams: Team[]= [];
    guessedTeam: string | null= null;
    guessedTeamOk: boolean= false;
    teamAnalytics_1: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    teamAnalytics_2: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    teamAnalytics_1_isVoid: boolean= false;
    teamAnalytics_2_isVoid: boolean= false;
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
            if(this.teams.length === 0) {
                this.noTeams= true;
            } else {
                this.noTeams= false;
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
    Questa funzione calcola lo score dei due team usando i loro analytics e decide quale è il favorito.
    Infine scarica i dati dei due team per mostrare all'utente i loro nomi dati i loro ID.
    */
    compareTeams(): void {
        this.tempoCorsaWeigth= 1 - this.percentualeTiriWeigth; // Calcolo il peso del tempo corsa
        const percentualeTiri_1= this.teamAnalytics_1.percentuale_tiri ?? 0; // Uso come default 0
        const tempoCorsa_1= this.teamAnalytics_1.tempo_corsa ?? 1; // Uso come default 1
        const percentualeTiri_2 = this.teamAnalytics_2.percentuale_tiri ?? 0; // Uso come default 0
        const tempoCorsa_2 = this.teamAnalytics_2.tempo_corsa ?? 1; // Uso come default 1
        const teamScore_1= (
            percentualeTiri_1 * this.percentualeTiriWeigth
            +
            (100 / tempoCorsa_1) * this.tempoCorsaWeigth
        ) / (this.percentualeTiriWeigth + this.tempoCorsaWeigth);
        const teamScore_2= (
            percentualeTiri_2 * this.percentualeTiriWeigth
            +
            (100 / tempoCorsa_2) * this.tempoCorsaWeigth
        ) / (this.percentualeTiriWeigth + this.tempoCorsaWeigth);
        if(teamScore_1 >= teamScore_2) {
            //Favorisco chi gioca in casa usando '>='
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
        // Recupero i nomi dei due team
        this.teamService.getTeamById(this.winnerTeamId!).subscribe({
            next: (team) => {
                // Recupero il nome del team vincitore
                this.guessedTeam= team.nome;
                this.guessedTeamOk= true;
                // Recupero il nome del team perdente
                this.teamService.getTeamById(this.loserTeamId!).subscribe({
                    next: (team) => {
                        this.loserTeamName= team.nome;
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: team ipotizzato come perdente non esistente");
                        } else {
                            alert("Errore: " + err.error);
                        }
                        this.router.navigate(["/teams"]);
                    }
                });
            },
            error: (err) => {
                if(err.status === 404) {
                    alert("Errore: team ipotizzato come vincitore non esistente");
                } else {
                    alert("Errore: " + err.error);
                }
                this.router.navigate(["/teams"]);
            }
        });
    }

    /*
    Questa funzione scarica gli analytics dei due team, si assicura che entrambi abbiano un analytics valido (quindi con
    degli allenamenti applicati ai suoi player) ed infine li confronta per decidere il vincitore.
    */
    predict(): void {
        if(this.selectedTeamId_1 && this.selectedTeamId_2) {
            if(this.selectedTeamId_1 !== this.selectedTeamId_2) {
                // Scarico l'analytics del team 1
                this.teamService.getAnalyticsByTeamId(this.selectedTeamId_1).subscribe({
                    next: (analytics) => {
                        this.teamAnalytics_1= analytics;
                        if(Object.keys(this.teamAnalytics_1).length === 0) {
                            this.teamAnalytics_1_isVoid= true;
                            // Mi fermo e non scarico nemmeno l'analytics del team 2
                            this.guessedTeamOk= false;
                            this.guessedTeam= null;
                            this.loserTeamName= null;
                        } else {
                            this.teamAnalytics_1_isVoid= false;
                            // Scarico l'analytics del team 2
                            this.teamService.getAnalyticsByTeamId(this.selectedTeamId_2!).subscribe({
                                next: (analytics) => {
                                    this.teamAnalytics_2= analytics;
                                    if(Object.keys(this.teamAnalytics_2).length === 0) {
                                        this.teamAnalytics_2_isVoid= true;
                                        this.guessedTeamOk= false;
                                        this.guessedTeam= null;
                                        this.loserTeamName= null;
                                    } else {
                                        this.teamAnalytics_2_isVoid= false;
                                        // Se entrambi i team hanno un analytics allora li confronto
                                        this.compareTeams();
                                    }
                                },
                                error: (err) => {
                                    if(err.status === 404) {
                                        alert("Errore: team non esistente");
                                    } else {
                                        alert("Errore " + err.status);
                                    }
                                    this.resetTeams();
                                    this.reset();
                                }
                            });
                        }
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: team non esistente");
                        } else {
                            alert("Errore " + err.status);
                        }
                        this.resetTeams();
                        this.reset();
                    }
                });
            } else {
                alert("Selezionare due team diversi");
                this.guessedTeam= null;
                this.guessedTeamOk= false;
            }
        } else {
            alert("Errore: selezionare entrambi i team");
            this.guessedTeam= null;
            this.guessedTeamOk= false;
        }
    }

}
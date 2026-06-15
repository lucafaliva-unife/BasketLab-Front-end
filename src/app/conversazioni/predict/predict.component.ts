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

    constructor(private teamService: TeamService, private router: Router) {}

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

    reset(): void {
        this.selectedTeamId_1= null;
        this.selectedTeamId_2= null;
        this.guessedTeam= null;
        this.guessedTeamOk= false;
    }

    compareTeams(): void {
        const teamScore_1: number= (this.teamAnalytics_1.percentuale_tiri! + 1/this.teamAnalytics_1.tempo_corsa!) / 2;
        const teamScore_2: number= (this.teamAnalytics_2.percentuale_tiri! + 1/this.teamAnalytics_2.tempo_corsa!) / 2;
        if(teamScore_1 >= teamScore_2) {
            //Favorisco chi gioca in casa usando '>='
            this.teamService.getTeamById(this.selectedTeamId_1!).subscribe({
                next: (team) => {
                    this.guessedTeam= team.nome;
                    this.guessedTeamOk= true;
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
        } else {
            this.teamService.getTeamById(this.selectedTeamId_2!).subscribe({
                next: (team) => {
                    this.guessedTeam= team.nome;
                    this.guessedTeamOk= true;
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
    }

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
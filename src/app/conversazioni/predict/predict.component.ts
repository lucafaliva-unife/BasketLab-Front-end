import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictService } from '../../servizi/prediction.service';
import { TeamService } from '../../servizi/team.service';
import { Team } from '../../modelli/team.model';

@Component({
    standalone: true,
    selector: 'app-predict',
    imports: [CommonModule, FormsModule],
    templateUrl: './predict.component.html',
    styleUrls: ['./predict.component.css']
})
export class PredictComponent implements OnInit {
    selectedTeamId_1: number | null= null;
    selectedTeamId_2: number | null= null;
    noTeams: boolean= false;
    teams: Team[]= [];
    guessedTeam: string | null= null;
    guessedTeamOk: boolean= false;

    constructor(private teamService: TeamService, private predictService: PredictService) {}

    resetTeams(): void {
        this.teams= TeamService.getTeams();
        if(this.teams.length === 0) {
            this.noTeams= true;
        } else {
            this.noTeams= false;
        }
        /*
        this.teamService.getTeams().subscribe(teams => {
            this.teams= teams;
            if(this.teams.length === 0) {
                this.noTeams= true;
            } else {
                this.noTeams= false;
            }
        });
        */
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

    predict(): void {
        if(this.selectedTeamId_1 && this.selectedTeamId_2) {
            if(this.selectedTeamId_1 !== this.selectedTeamId_2) {
                const guessedTeamTemp: Team= this.predictService.predict(this.selectedTeamId_1, this.selectedTeamId_2);
                if(Object.keys(guessedTeamTemp).length === 0) {
                    alert("Almeno uno dei due team selezionati non esiste o non ha allenamenti");
                    this.resetTeams();
                    this.reset();
                    this.guessedTeam= null;
                    this.guessedTeamOk= false;
                } else {
                    this.guessedTeam= guessedTeamTemp.nome;
                    this.guessedTeamOk= true;
                }
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
        /*
        if(this.selectedTeamId_1 && this.selectedTeamId_2) {
            if(this.selectedTeamId_1 !== this.selectedTeamId_2) {
                this.predictService.predict(this.selectedTeamId_1, this.selectedTeamId_2).subscribe({
                    next: (team) => {
                        if(Object.keys(team).length === 0) {
                            alert("Almeno uno dei due team selezionati non possiede allenamenti");
                            this.guessedTeam= null;
                            this.guessedTeamOk= false;
                        } else {
                            this.guessedTeam= team.nome;
                            this.guessedTeamOk= true;
                        }
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Almeno uno dei due team selezionati non esiste");
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
        */
    }

}
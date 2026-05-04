import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Team } from '../../modelli/team.model';
import { TeamService } from '../../servizi/team.service';

@Component({
    standalone: true,
    selector: 'app-teams',
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './teams.component.html',
    styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
    newTeam: Partial<Omit<Team, "id_team">>= {};
    teams: Team[]= [];
    noTeams: boolean= false;
    modifyState: { [key: string]: boolean }= {}; // Dizionario che associa l'ID del team al suo modify state
    showForm: boolean= false;

    constructor(private teamService: TeamService) {}

    private resetModifyState(): void {
        this.teams.forEach(team => {
            this.modifyState[team.id_team]= false;
        });
    }

    private resetTeamsAndModifyState(): void {
        this.teamService.getTeams().subscribe(teams => {
            this.teams= teams;
            if(this.teams.length === 0) {
                this.noTeams= true;
            } else {
                this.noTeams= false;
                this.resetModifyState();
            }
        });
    }

    setModifyState(id: string): void {
        this.resetModifyState();
        this.modifyState[id]= true;
    }

    ngOnInit() {
        this.resetTeamsAndModifyState();
    }

    isSvincolati(id: string): boolean {
        const index: number= this.teams.findIndex(team => team.nome === "Svincolati");
        if(index === -1) {
            return false;
        }
        if(this.teams[index].id_team === id) {
            return true;
        } else {
            return false;
        }
    }

    deleteTeam(id: string): void {
        const conferma: boolean= confirm("Sicuro di voler eliminare il team?");
        if(!conferma) {
            return;
        }
        this.teamService.deleteTeamById(id).subscribe({
            next: () => {
                this.resetTeamsAndModifyState();
            },
            error: (err) => {
                if(err.status === 404) {
                    alert("Errore: team non esistente");
                } else if(err.status === 409) {
                    alert("Errore: non puoi cancellare gli svincolati");
                } else {
                    alert("Errore: " + err.error);
                }
                this.resetTeamsAndModifyState();
            }
        });
    }

    editTeam(team: Team): void {
        const editedTeamData: Omit<Team, "id_team">= team as Omit<Team, "id_team">;
        if(editedTeamData.nome && editedTeamData.nome.trim() !== "" && editedTeamData.citta && editedTeamData.citta.trim() !== "") {
            this.teamService.editTeamById(team.id_team, editedTeamData).subscribe({
                next: () => {
                    this.resetTeamsAndModifyState();
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: team non esistente");
                    } else if(err.status === 400) {
                        alert("Errore: il server ha rifiutato i dati inviati");
                    } else if(err.status === 409) {
                        alert("Errore: non puoi modificare il team degli svincolati e non puoi rinominare un team in 'Svincolati'");
                    } else {
                        alert("Errore: " + err.error);
                    }
                    this.resetTeamsAndModifyState();
                }
            });
        } else {
            alert("I campi non possono essere vuoti");
        }
    }

    createTeam(newTeamData: Partial<Omit<Team, "id_team">>): void {
        if(newTeamData.nome && newTeamData.citta && newTeamData.nome.trim() !== "" && newTeamData.citta.trim() !== "") {
            const tempNewTeam: Omit<Team, "id_team">= newTeamData as Omit<Team, "id_team">;
            this.teamService.createTeam(tempNewTeam).subscribe({
                next: () => {
                    this.newTeam= {};
                    this.showForm= false;
                    this.resetTeamsAndModifyState();
                },
                error: (err) => {
                    if(err.status === 409) {
                        alert("Errore: non puoi creare un team con un nome che esiste già o con il nome 'Svincolati'");
                    } else if(err.status === 400) {
                        alert("Errore: il server ha rifiutato i dati inviati");
                    } else {
                        alert("Errore: " + err.error);
                    }
                    this.resetTeamsAndModifyState();
                }
            });
        } else {
            alert("I campi non possono essere vuoti");
        }
    }

}
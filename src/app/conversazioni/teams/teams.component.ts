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
    modifyState: { [key: string]: boolean }= {}; // Dizionario che associa l'ID del team al suo modify state
    showForm: boolean= false;

    constructor(private teamService: TeamService) {}

    /*
    Questa funzione imposta lo stato di modifica di tutti i team a 'false'.
    */
    private resetModifyState(): void {
        this.modifyState= {};
        this.teams.forEach(team => {
            this.modifyState[team.id_team]= false;
        });
    }

    /*
    Questa funzione scarica tutti i team in ordine di performance decrescente, si assiura che sia presente almeno un team
    ed in tal caso imposta tutti gli stati di modifica a 'false'.
    */
    private resetTeamsAndModifyState(): void {
        this.teamService.getTeamsRanking().subscribe(teams => {
            this.teams= teams;
            // Se esiste almeno un team allora imposto gli stati di modifica a 'false'
            if(this.teams.length !== 0) {
                this.resetModifyState();
            }
        });
    }

    /*
    Questa funzione imposta lo stato di modifica di tutti i team a 'false' ed imposta lo stato di modifica di un team
    specifico a 'true': in questo modo si ha un solo team per volta aperto alla modifica.
    */
    setModifyState(id: string): void {
        this.resetModifyState();
        this.modifyState[id]= true;
    }

    ngOnInit() {
        // Scarico l'elenco dei team ordinati per performance ed imposto gli stati di modifica a 'false'
        this.resetTeamsAndModifyState();
    }

    /*
    Questa funzione prende come parametro l'ID di un team e controlla se il suo nome è "Svincolati".
    */
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

    /*
    Questa funzione chiede conferma all'utente e poi invia una richiesta di eliminazione del team selezionato.
    Infine imposta tutti gli stati di modifica a 'false' ed aggiorna tutti i dati della pagina.
    */
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

    /*
    Questa funzione valida i dati inseriti dall'utente ed invia una richiesta di modifica del team selezionato.
    Infine imposta tutti gli stati di modifica a 'false' ed aggiorna tutti i dati della pagina.
    */
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
                        alert("Errore: non puoi rinominare un team in 'Svincolati' o con il nome di un altro team");
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

    /*
    Questa funzione valida i dati inseriti dall'utente ed invia una richiesta di creazione di un nuovo team.
    Infine, nasconde e svuota la form, chiude alla modifica tutti i team ed aggiorna tutti i dati della pagina.
    */
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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Match } from '../../modelli/match.model';
import { MatchService } from '../../servizi/match.service';
import { Team } from '../../modelli/team.model';
import { TeamService } from '../../servizi/team.service';

@Component({
    standalone: true,
    selector: 'app-match',
    imports: [CommonModule, FormsModule],
    templateUrl: './match.component.html',
    styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

    matches: Match[]= [];
    allTeams: Team[]= [];
    modifyState: { [key: string]: boolean }= {}; // Dizionario che associa l'ID del match al suo modify state
    showForm: boolean= false;
    newMatch: Partial<Omit<Match, "id_match">>= {};
    maxMatches: number= 0;

    constructor(private matchService: MatchService, private teamService: TeamService) {}

    /*
    Questa funzione imposta lo stato di modifica di tutti i match a 'false'.
    */
    private resetModifyState(): void {
        this.modifyState= {};
        this.matches.forEach(match => {
            this.modifyState[match.id_match]= false;
        });
    }

    /*
    Questa funzione imposta lo stato di modifica di tutti i match a 'false' ed imposta lo stato di modifica di un match
    specifico a 'true': in questo modo si ha un solo match per volta aperto alla modifica.
    */
    setModifyState(id: string): void {
        this.resetModifyState();
        this.modifyState[id]= true;
    }

    /*
    Questa funzione aggiorna l'array dei team disponibili con l'elenco dei team che hanno almeno 5 player.
    Esclude il team degli svincolati.
    */
    private resetTeams(): void {
        this.allTeams= [];
        this.teamService.getTeams().subscribe((teams) => {
            // Itero su tutti i team
            teams.forEach((team) => {
                this.teamService.getPlayersByTeamId(team.id_team).subscribe((players) => {
                    // Se il team ha almeno 5 player e non è quello degli svincolati allora lo tengo
                    if(players.length >= 5 && team.nome !== "Svincolati") {
                        this.allTeams.push(team);
                    }
                });
            });
        });
    }

    /*
    Questa funzione ordina la lista dei match decrescentemente per data e porta lo stato ordere a 'true'.
    */
    order(): void {
        if(this.matches.length === 0) {
            return;
        }
        this.matches.sort((m1, m2) => {
            const d1: Date= new Date(m1.data);
            const d2: Date= new Date(m2.data);
            if(d1 > d2) {
                return -1;
            } else if(d2 > d1) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    /*
    Questa funzione aggiorna la lista dei match, resetta tutti i modify state a 'false' e riporta lo stato ordered a 'false'.
    Infine, imposta il numero massimo di match da visualizzare al numero totale di match.
    */
    private resetMatchesAndModifyState(): void {
        this.matchService.getMatches().subscribe((allMatches) => {
            this.matches= allMatches;
            // Se esiste almeno un match allora imposto gli stati di modifica a 'false' ed ordino per data
            if(this.matches.length !== 0) {
                this.resetModifyState();
                this.order();
                this.maxMatches= this.matches.length;
            }
        });
    }

    ngOnInit(): void {
        // Carico i team che hanno almeno 5 giocatori
        this.resetTeams();
        // Carico i match
        this.resetMatchesAndModifyState();
    }

    /*
    Questa funzione valida i dati della modifica ed invia al backend una richiesta di modifica del match selezionato.
    Infine, aggiorna i dati del componente.
    */
    editMatch(match: Match): void {
        // Validazione modifica
        if(match.team_casa === match.team_trasferta) {
            alert("Selezionare due team diversi");
            return;
        }
        if(match.punti_casa < 0 || match.punti_casa > 150) {
            alert("I punti della squadra di casa escono dal range 0-150");
            return;
        }
        if(match.punti_trasferta < 0 || match.punti_trasferta > 150) {
            alert("I punti della squadra ospite escono dal range 0-150");
            return;
        }
        // Invio richiesta di modifica ed aggiornamento dei dati del componente
        this.matchService.editMatchById(match.id_match, match as Omit<Match, "id_match">).subscribe({
            next: () => {
                // Aggiorno tutti i dati
                this.resetTeams();
                this.resetMatchesAndModifyState();
            },
            error: (error) => {
                if(error.status === 400) {
                    alert("Il server ha rifiutato i dati inviati");
                } else if(error.status === 404) {
                    alert("Uno dei due team selezionati non esiste");
                } else if(error.status === 409) {
                    alert("Uno dei due team selezionati è quello degli svincolati oppure ha un numero di players sotto al 5");
                } else {
                    alert("Errore: " + error.status);
                }
                // Aggiorno tutti i dati
                this.resetTeams();
                this.resetMatchesAndModifyState();
            }
        });
    }

    /*
    Questa funzione chiede conferma e poi invia al backend una richiesta di eliminazione del match selezionato.
    Infine, aggiorna i dati del componente.
    */
    deleteMatch(matchId: string): void {
        const conferma: boolean= confirm("Sicuro di voler eliminare il match?");
        if(!conferma) {
            return;
        }
        // Invio richiesta di eliminazione ed aggiornamento dei dati del componente
        this.matchService.deleteMatchById(matchId).subscribe({
            next: () => {
                // Aggiorno tutti i dati
                this.resetTeams();
                this.resetMatchesAndModifyState();
            },
            error: (error) => {
                if(error.status === 404) {
                    alert("Il match selezionato non esiste");
                } else {
                    alert("Errore: " + error.status);
                }
                // Aggiorno tutti i dati
                this.resetTeams();
                this.resetMatchesAndModifyState();
            }
        });
    }

    /*
    Questa funzione valida i dati del nuovo match ed invia al backend una richiesta di creazione di un nuovo match.
    Infine, aggiorna i dati del componente.
    */
    createMatch() {
        // Validazione parametri
        if(this.newMatch.team_casa === undefined ||
           this.newMatch.team_trasferta === undefined ||
           this.newMatch.punti_casa === undefined ||
           this.newMatch.punti_trasferta === undefined ||
           this.newMatch.data === undefined
        ) {
            alert("Errore: i dati del nuovo match non sono completi");
            return;
        }
        // Validazione match
        if(this.newMatch.team_casa === this.newMatch.team_trasferta) {
            alert("Selezionare due team diversi");
            return;
        }
        if(this.newMatch.punti_casa < 0 || this.newMatch.punti_casa > 150) {
            alert("I punti della squadra di casa escono dal range 0-150");
            return;
        }
        if(this.newMatch.punti_trasferta < 0 || this.newMatch.punti_trasferta > 150) {
            alert("I punti della squadra ospite escono dal range 0-150");
            return;
        }
        // Invio richiesta di creazione ed aggiornamento dei dati del componente
        this.matchService.createMatch(this.newMatch as Omit<Match, "id_match">).subscribe({
            next: () => {
                // Aggiorno tutti i dati, nascondo la form e resetto i dati del prossimo nuovo match
                this.resetTeams();
                this.resetMatchesAndModifyState();
                this.newMatch= {};
                this.showForm= false;
            },
            error: (error) => {
                if(error.status === 400) {
                    alert("Il server ha rifiutato i dati inviati");
                } else if(error.status === 409) {
                    alert("Uno dei due team selezionati è quello degli svincolati oppure ha un numero di players sotto al 5");
                } else {
                    alert("Errore: " + error.status);
                }
                // Aggiorno tutti i dati
                this.resetTeams();
                this.resetMatchesAndModifyState();
            }
        });
    }

}
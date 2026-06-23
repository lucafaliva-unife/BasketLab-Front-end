import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Team } from '../../modelli/team.model';
import { Train } from '../../modelli/train.model';
import { Player } from '../../modelli/player.model';
import { TeamService } from '../../servizi/team.service';
import { PlayerService } from '../../servizi/player.service';

@Component({
    standalone: true,
    selector: 'app-player',
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
    modifyState: boolean= false;
    selectedPlayer: Partial<Player>= {};
    selectedPlayerId: string | null= null;
    trains: Partial<Train>[]= [];
    trainIsVoid: boolean= false;
    teams: Team[]= [];
    teamName: string | null= null;
    n_trains: number= 1;
    maxTrains: number= 1;
    svincolato: boolean= false;
    analyticsPercentualeTiri: number= 0;
    analyticsTempoCorsa: number= 0;
    percentualeTiriAlert: boolean= false;
    tempoCorsaAlert: boolean= false;
    miglioramentoAlert: boolean= false;
    peggioramentoAlert: boolean= false;
    noVariazioniAlert: boolean= false;

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    /*
    Questa funzione calcola gli analytics del player e, se non è svincolato ed ha almeno un allenamento:
    - decide quali alerts relativi al confronto con gli analytics del team abilitare;
    - decide se l'ultimo allenamento del player è stato migliore/peggiore/uguale rispetto al penultimo. 
    */
    private resetAlerts(): void {
        // Calcolo gli analytics del player
        var totPercentualeTiri: number= 0;
        var totTempoCorsa: number= 0;
        this.trains.forEach((train) => {
            totPercentualeTiri+= train.percentuale_tiri!;
            totTempoCorsa+= train.tempo_corsa!;
        });
        this.analyticsPercentualeTiri= totPercentualeTiri / this.trains.length;
        this.analyticsTempoCorsa= totTempoCorsa / this.trains.length;
        // Controllo se le medie del giocatore sono sotto alle medie del team (se non è svincolato)
        if(this.svincolato) {
            this.tempoCorsaAlert= false;
            this.percentualeTiriAlert= false;
        } else {
            this.teamService.getAnalyticsByTeamId(this.selectedPlayer.id_team!).subscribe({
                next: (analytics) => {
                    if(Object.keys(analytics).length === 0) {
                        this.tempoCorsaAlert= false;
                        this.percentualeTiriAlert= false;
                    } else {
                        if(this.analyticsPercentualeTiri < analytics.percentuale_tiri) {
                            this.percentualeTiriAlert= true;
                        }
                        if(this.analyticsTempoCorsa > analytics.tempo_corsa) {
                            this.tempoCorsaAlert= true;
                        }
                    }
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: team del player non esistente");
                    } else {
                        alert("Errore " + err.status);
                    }
                    this.router.navigate(["/teams"]);
                }
            });
        }
        // Controllo se l'ultimo allenamento ha migliorato o peggiorato le prestazioni rispetto all'allenamento precedente.
        // Prima verifico che siano presenti almeno 2 allenamenti
        if(this.trains.length >= 2) {
            const performanceNew: number= (this.trains[this.n_trains - 1].percentuale_tiri! + (100/this.trains[this.n_trains - 1].tempo_corsa!)) / 2;
            const performanceOld: number= (this.trains[this.n_trains - 2].percentuale_tiri! + (100/this.trains[this.n_trains - 2].tempo_corsa!)) / 2;
            if(performanceNew > performanceOld) {
                this.miglioramentoAlert= true;
                this.peggioramentoAlert= false;
                this.noVariazioniAlert= false;
            } else if(performanceNew < performanceOld) {
                this.miglioramentoAlert= false;
                this.peggioramentoAlert= true;
                this.noVariazioniAlert= false;
            } else {
                this.noVariazioniAlert= true;
                this.miglioramentoAlert= false;
                this.peggioramentoAlert= false;
            }
        }
    }

    /*
    Questa funzione scarica tutti gli allenamenti effettuati dal player, controlla che ce ne sia almeno uno e decide quali
    alerts mostrare.
    */
    private resetTrains(playerId: string): void {
        // Recupero tutti gli allenamenti del player
        this.playerService.getTrainsByPlayerId(playerId!).subscribe({
            next: (trains) => {
                this.trains= trains;
                if(this.trains.length === 0) {
                    this.trainIsVoid= true;
                    this.n_trains= 0;
                } else {
                    this.trainIsVoid= false;
                    this.n_trains= this.trains.length;
                    // Imposto gli alerts
                    this.resetAlerts();
                }
            },
            error: (err) => {
                if(err.status === 404) {
                    alert("Errore: player non esistente");
                } else {
                    alert("Errore " + err.status);
                }
                this.router.navigate(["/teams"]);
                return;
            }
        });
    }

    /*
    Questa funzione scarica i dati del player, i dati del suo team ed i suoi allenamenti.
    Inoltre controlla se è svincolato o no e calcola gli analytics per decidere se mostrare gli alerts.
    In ultimo, scarica l'elenco dei team per poter eventualmente cambiare team al player.
    */
    private resetAllData(): void {
        if(this.selectedPlayerId) {
            this.playerService.getPlayerById(this.selectedPlayerId).subscribe({
                next: (player) => {
                    // Recupero i dati del player
                    this.selectedPlayer= player;
                    // Recupero il nome del team del player
                    this.teamService.getTeamById((this.selectedPlayer as Player).id_team).subscribe({
                        next: (team) => {
                            this.teamName= team.nome;
                            if(this.teamName === "Svincolati") {
                                this.svincolato= true;
                            } else {
                                this.svincolato= false;
                            }
                        },
                        error: (err) => {
                            if(err.status === 404) {
                                alert("Errore: il team del player selezionato non esiste");
                            } else {
                                alert("Errore " + err.status);
                            }
                            this.router.navigate(["/teams"]);
                            return;
                        }
                    });
                    // Recupero gli allenamenti del player, calcolo i suoi analytics e decido se mostrare gli alert
                    this.resetTrains(this.selectedPlayerId!);
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esistente");
                    } else {
                        alert("Errore " + err.status);
                    }
                    this.router.navigate(["/teams"]);
                    return;
                }
            });
            // Recupero tutti i team
            this.teamService.getTeams().subscribe(teams => {
                this.teams= teams;
                if(this.teams.length === 0) {
                    alert("Errore: nessun team esistente");
                    this.router.navigate(["/teams"]);
                    return;
                }
            });
        } else {
            alert("Nessun player selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    /*
    Questa funzione valida il peso e l'altezza inseriti dall'utente nella form per controllare che siano valori corretti.
    */
    private validateHeightWeight(height: number | null | undefined, weight: number | null | undefined): boolean {
        const parsedHeight: number= Number(height);
        const parsedWeight: number= Number(weight);
        if(isNaN(parsedHeight) || isNaN(parsedWeight)) {
            alert("Altezza e peso devono essere valori numerici validi");
            return false;
        }
        if((parsedHeight < 100 || parsedHeight > 250) && (parsedWeight < 30 || parsedWeight > 300)) {
            alert("Altezza e peso non validi: l'altezza deve essere compresa tra 100 e 250 cm, il peso tra 30 e 300 kg");
            return false;
        }
        if(parsedHeight < 100 || parsedHeight > 250) {
            alert("Altezza non valida: deve essere compresa tra 100 e 250 cm");
            return false;
        }
        if(parsedWeight < 30 || parsedWeight > 300) {
            alert("Peso non valido: deve essere compreso tra 30 e 300 kg");
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        //Estraggo l'ID del player selezionato
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id) {
            this.selectedPlayerId= id;
        } else {
            alert("Errore: ID non inserito");
            this.router.navigate(["/teams"]);
            return;
        }

        //Carico i dati del player, i suoi allenamenti, i team, gli analytics, gli alert ed il nome del team del player
        this.resetAllData();
    }

    /*
    Questa funzione valida i dati inseriti dall'utente ed invia una richiesta di modifica del player selezionato.
    Infine, chiude il player alla modifica impostando lo stato a 'false' ed aggiorna tutti i dati della pagina.
    */
    editPlayer(): void {
        if(this.selectedPlayerId) {
            const editedPlayerData: Omit<Player, "id_player">= this.selectedPlayer as Omit<Player, "id_player">;
            if(
                editedPlayerData.nome && editedPlayerData.nome.trim() !== "" &&
                editedPlayerData.cognome && editedPlayerData.cognome.trim() !== "" &&
                editedPlayerData.data_nascita &&
                editedPlayerData.altezza &&
                editedPlayerData.peso &&
                editedPlayerData.ruolo &&
                editedPlayerData.id_team
            ) {
                if(!this.validateHeightWeight(editedPlayerData.altezza, editedPlayerData.peso)) {
                    return;
                }
                this.playerService.editPlayerById(this.selectedPlayerId, editedPlayerData).subscribe({
                    next: () => {
                        this.resetAllData();
                        this.modifyState= false;
                    },
                    error: (err) => {
                        if(err.status === 400) {
                            alert("Errore: il server ha rifiutato i dati inviati");
                        } else if(err.status === 404) {
                            alert("Errore: player non esistente");
                            this.router.navigate(["/teams"]);
                        } else if(err.status === 409) {
                            alert("Errore: team selezionato per il player non esistente");
                            this.resetAllData();
                        } else {
                            alert("Errore " + err.status);
                        }
                    }
                });
            } else {
                alert("I campi non possono essere vuoti");
            }
        } else {
            alert("Errore: nessun player selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    /*
    Questa funzione chiede conferma all'utente e poi invia una richiesta di eliminazione del player selezionato.
    Infine, riporta alla pagina del team del player.
    */
    deletePlayer(): void {
        if(this.selectedPlayerId) {
            const conferma: boolean= confirm("Sicuro di voler eliminare il player?");
            if(!conferma) {
                return;
            }
            this.playerService.deletePlayerById(this.selectedPlayerId).subscribe({
                next: () => {
                    if(this.selectedPlayer.id_team) {
                        this.router.navigate(["/teams", this.selectedPlayer.id_team]);
                    } else {
                        this.router.navigate(["/teams"]);
                    }
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esistente");
                        if(this.selectedPlayer.id_team) {
                            this.router.navigate(["/teams", this.selectedPlayer.id_team]);
                        } else {
                            this.router.navigate(["/teams"]);
                        }
                    } else {
                        alert("Errore " + err.status);
                    }
                }
            });
        } else {
            alert("Errore: nessun player selezionato");
            this.router.navigate(["/teams"]);
        }
    }

}
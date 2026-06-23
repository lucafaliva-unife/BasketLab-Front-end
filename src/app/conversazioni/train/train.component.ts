import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Train } from '../../modelli/train.model';
import { Player } from '../../modelli/player.model';
import { PlayerService } from '../../servizi/player.service';

@Component({
    standalone: true,
    selector: 'app-train',
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './train.component.html',
    styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit, OnDestroy {
    selectedPlayer: Partial<Player>= {};
    selectedPlayerId: string | null= null;
    train: Partial<Omit<Train, "idx_train" | "id_player">>= {};
    canestriTentati: number= 0;
    canestriRiusciti: number= 0;
    tempoCorsaMinuti: number= 0;
    tempoCorsaSecondi: number= 0;
    tempoCorsaCentisecondi: number= 0;
    clockMode: boolean= false;
    interval: any= null;
    recordTempoCorsaPlayer: number= 0;
    recordPercentualeTiriPlayer: number= 0;
    trainsIsVoid: boolean= true;

    constructor(private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    /*
    Questa funzione scarica i dati del player che si intende allenare.
    */
    resetPlayer(): void {
        if(this.selectedPlayerId) {
            this.playerService.getPlayerById(this.selectedPlayerId).subscribe({
                next: (player) => {
                    this.selectedPlayer= player;
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esistente");
                    } else {
                        alert("Errore " + err.status);
                    }
                    this.router.navigate(["/teams"]);
                }
            });
        } else {
            alert("Nessun player selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    /*
    Questa funzione scarica gli allenamenti già effettuati dal player e:
    - se ha almeno un allenamento cerca il record di percentuale tiri (max) e di tempo corsa (min);
    - se non ha allenamenti imposta come record i flag -1.
    */
    resetRecord(): void {
        if(this.selectedPlayerId) {
            // Scarico gli allenamenti del player
            this.playerService.getTrainsByPlayerId(this.selectedPlayerId).subscribe({
                next: (trains) => {
                    if(trains.length !== 0) {
                        const playerTrains= trains;
                        // Calcolo i record del player in ogni esercizio
                        var percentualeTiriPlayer: number[]= [];
                        var tempoCorsaPlayer: number[]= [];
                        playerTrains.forEach((train) => {
                            percentualeTiriPlayer.push(train.percentuale_tiri);
                            tempoCorsaPlayer.push(train.tempo_corsa);
                        });
                        this.recordPercentualeTiriPlayer= Math.max(...percentualeTiriPlayer);
                        this.recordTempoCorsaPlayer= Math.min(...tempoCorsaPlayer);
                        // Memorizzo il fatto che il player ha almeno un allenamento
                        this.trainsIsVoid= false;
                    } else {
                        // Se il player non ha allenamenti uso come valori indicativi -1 per entrambi i record
                        this.recordPercentualeTiriPlayer= -1;
                        this.recordTempoCorsaPlayer= -1;
                        // Memorizzo il fatto che il player non ha allenamenti
                        this.trainsIsVoid= true;
                    }
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esistente");
                    } else {
                        alert("Errore " + err.status);
                    }
                    this.router.navigate(["/teams"]);
                }
            });
        } else {
            alert("Nessun player selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    ngOnInit(): void {
        // Estraggo l'ID del player selezionato
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id) {
            this.selectedPlayerId= id;
        } else {
            alert("Errore: ID non inserito");
            this.router.navigate(["/teams"]);
            return;
        }

        // Carico il player selezionato
        this.resetPlayer();

        // Calcolo i record di allenamento del player
        this.resetRecord();
    }

    ngOnDestroy(): void {
        // Distruggo il timer nel caso in cui sia attivo.
        this.stop();
    }

    /*
    Questa funzione incrementa SOLO i canestri tentati.
    */
    addCanestroTentato(): void {
        this.canestriTentati= this.canestriTentati + 1;
    }

    /*
    Questa funzione incrementa i canestri tentati ed i canestri riusciti.
    */
    addCanestroRiuscito(): void {
        this.canestriTentati= this.canestriTentati + 1;
        this.canestriRiusciti= this.canestriRiusciti + 1;
    }

    /*
    Questa funzione avvia il timer integrato nella pagina tramite un interval che incrementa il tempo di 1 centesimo di
    secondo ogni 10 millisecondi. Inoltre imposta lo stato di chiusura del timer alla modifica a 'true'.
    */
    start(): void {
        this.clockMode= true;
        this.interval= setInterval(() => {
            if(this.tempoCorsaCentisecondi === 100) {
                this.tempoCorsaCentisecondi= 0;
                this.tempoCorsaSecondi= this.tempoCorsaSecondi + 1;
                if(this.tempoCorsaSecondi === 60) {
                    this.tempoCorsaSecondi= 0;
                    this.tempoCorsaMinuti= this.tempoCorsaMinuti + 1;
                }
            } else {
                this.tempoCorsaCentisecondi= this.tempoCorsaCentisecondi + 1;
            }
        }, 10);
    }

    /*
    Questa funzione ferma il timer integrato nella pagina "pulendo" l'interval creato prima.
    Inoltre, imposta lo stato di chiusura del timer alla modifica a 'false'.
    */
    stop(): void {
        this.clockMode= false;
        if(this.interval) {
            clearInterval(this.interval);
        }
    }

    /*
    Questa funzione resetta lo stato del timer riportandolo a 00:00:00.
    */
    reset(): void {
        this.tempoCorsaCentisecondi= 0;
        this.tempoCorsaSecondi= 0;
        this.tempoCorsaMinuti= 0;
    }

    /*
    Questa funzione si assicura che non sia al momento attivo l'interval del timer (se lo è, lo "pulisce" ed imposta lo
    stato della modalità interval a 'false'), valida i dati di allenamento inseriti dall'utente, calcola la percentuale
    di tiri risuciti ed i secondi totali del tempo corsa. Infine, chiede conferma all'utente ed invia una richiesta di
    inserimento del nuovo allenamento, poi resetta il timer ed i canestri e ricalcola i record di allenamento del player.
    */
    trainPlayer(): void {
        if(this.selectedPlayerId) {
            // Se il timer è attivo allora lo disabilito
            this.stop();
            if(
                // Validazione dei dati inseriti
                this.canestriRiusciti >= 0 &&
                this.canestriTentati > 0 &&
                this.canestriRiusciti <= this.canestriTentati &&
                this.tempoCorsaCentisecondi >= 0 && this.tempoCorsaCentisecondi <= 99 &&
                this.tempoCorsaSecondi >= 0 && this.tempoCorsaSecondi <= 59 &&
                this.tempoCorsaMinuti >= 0 &&
                !(this.tempoCorsaCentisecondi === 0 && this.tempoCorsaSecondi === 0 && this.tempoCorsaMinuti === 0)
            ) {
                // Calcolo dei parametri di allenamento da inviare all'API
                this.train.percentuale_tiri= (this.canestriRiusciti / this.canestriTentati) * 100;
                this.train.tempo_corsa= this.tempoCorsaMinuti * 60 + this.tempoCorsaSecondi + this.tempoCorsaCentisecondi / 100;
            } else {
                alert("Dati non validi");
                return;
            }
            const conferma: boolean= confirm("Sicuro di voler confermare l'allenamento?");
            if(!conferma) {
                return;
            }
            // Invio i dati di allenamento all'API e resetto il timer, i record ed i canestri
            this.playerService.trainPlayerById(this.selectedPlayerId, this.train as Omit<Train, "idx_train" | "id_player">).subscribe({
                next: () => {
                    this.reset();
                    this.resetRecord();
                    this.canestriTentati= 0;
                    this.canestriRiusciti= 0;
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esistente");
                        this.router.navigate(["/teams"]);
                    } else if(err.status === 409) {
                        alert("Errore: non puoi allenare un giocatore svincolato");
                    } else {
                        alert("Errore: " + err.status);
                    }
                }
            });
        } else {
            alert("Nessun player selezionato");
            this.router.navigate(["/teams"]);
        }
    }

}
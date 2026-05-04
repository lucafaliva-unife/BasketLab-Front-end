import { Component, OnInit } from '@angular/core';
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
export class TrainComponent implements OnInit {
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

    constructor(private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

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

        //Carico il player selezionato
        this.resetPlayer();
    }

    addCanestroTentato(): void {
        this.canestriTentati= this.canestriTentati + 1;
    }

    addCanestroRiuscito(): void {
        this.canestriTentati= this.canestriTentati + 1;
        this.canestriRiusciti= this.canestriRiusciti + 1;
    }

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

    stop(): void {
        this.clockMode= false;
        if(this.interval) {
            clearInterval(this.interval);
        }
    }

    reset(): void {
        this.tempoCorsaCentisecondi= 0;
        this.tempoCorsaSecondi= 0;
        this.tempoCorsaMinuti= 0;
    }

    trainPlayer(): void {
        if(this.selectedPlayerId) {
            if(this.clockMode) {
                clearInterval(this.interval);
                this.clockMode= false;
            }
            if(
                this.canestriRiusciti >= 0 &&
                this.canestriTentati > 0 &&
                this.tempoCorsaCentisecondi >= 0 && this.tempoCorsaCentisecondi <= 99 &&
                this.tempoCorsaSecondi >= 0 && this.tempoCorsaSecondi <= 59 &&
                this.tempoCorsaMinuti >= 0 &&
                !(this.tempoCorsaCentisecondi === 0 && this.tempoCorsaSecondi === 0 && this.tempoCorsaMinuti === 0)
            ) {
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
            this.playerService.trainPlayerById(this.selectedPlayerId, this.train as Omit<Train, "idx_train" | "id_player">).subscribe({
                next: () => {
                    this.reset();
                    this.canestriTentati= 0;
                    this.canestriRiusciti= 0;
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esistente");
                        this.router.navigate(["/teams"]);
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
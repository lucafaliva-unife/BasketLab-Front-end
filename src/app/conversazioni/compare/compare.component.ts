import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Player } from "../../modelli/player.model";
import { TeamService } from "../../servizi/team.service";
import { PlayerService } from "../../servizi/player.service";
import { Train } from "../../modelli/train.model";
import { Router } from "@angular/router";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    standalone: true,
    selector: 'app-compare',
    imports: [CommonModule, FormsModule, BaseChartDirective],
    templateUrl: './compare.component.html',
    styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit {
    players: Player[]= [];
    analyticsPlayer1: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    analyticsPlayer2: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    trainsPlayer1: Train[]= [];
    trainsPlayer2: Train[]= [];
    player1_score: number= 0;
    player2_score: number= 0;
    bestPlayer: string | null= null;
    compared: boolean= false;
    selectedPlayer1Id: string | null= null;
    selectedPlayer2Id: string | null= null;
    percentualeTiriComparison: string | null= null;
    tempoCorsaComparison: string | null= null;
    playersTrend: ChartConfiguration<'line'>['data']= {
        labels: [],
        datasets: []
    };
    chartOptions: ChartConfiguration<'line'>['options']= {}

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router) {}

    /*
    Questa funzione scarica tutti i team, itera su ciascuno di essi ed ogni volta estrae i player per metterli
    nell'apposito array locale.
    */
    private resetPlayers(): void {
        this.players= [];
        this.teamService.getTeams().subscribe(teams => {
            teams.forEach((team) => {
                this.teamService.getPlayersByTeamId(team.id_team).subscribe(players => {
                    players.forEach((player) => {
                        this.players.push(player);
                    });
                });
            });
        });
    }

    /*
    Questa funzione calcola lo score di un player dati i suoi allenamenti facendo la media di ogni score.
    */
    private calculateScore(trains: Train[]): number {
        var scoresPlayer: number[]= [];
        // Calcolo gli scores di ogni allenamento del player
        trains.forEach((train) => {
            const score: number= (train.percentuale_tiri + 100/train.tempo_corsa) / 2;
            scoresPlayer.push(score);
        });
        // Calcolo la media degli scores e la ritorno
        var totalScoresPlayer: number= 0;
        scoresPlayer.forEach((score) => {
            totalScoresPlayer+= score;
        });
        return totalScoresPlayer / scoresPlayer.length;
    }

    /*
    Questa funzione restituisce la percentuale tiri media ed il tempo corsa medio data una serie di allenamenti.
    */
    private calculateAnalytics(trains: Train[]): Omit<Train, "id_player" | "idx_train"> {
        var totPercentualeTiri: number= 0;
        var totTempoCorsa: number= 0;
        trains.forEach((train) => {
            totPercentualeTiri+= train.percentuale_tiri;
            totTempoCorsa+= train.tempo_corsa;
        });
        const analyticsPercentualeTiri= totPercentualeTiri / trains.length;
        const analyticsTempoCorsa= totTempoCorsa / trains.length;
        return { 
            percentuale_tiri: analyticsPercentualeTiri,
            tempo_corsa: analyticsTempoCorsa
        };
    }

    /*
    Questa funzione imposta il contenuto degli alerts relativi al confronto diretto fra gli analyitics dei players.
    */
    private resetComparisonAlerts(analytics1: Omit<Train, "id_player" | "idx_train">, analytics2: Omit<Train, "id_player" | "idx_train">): void {
        // Converto le misure in stringhe che rappresentano numeri a 2 cifre dopo la virgola
        const tiri1= analytics1.percentuale_tiri.toFixed(2);
        const tiri2= analytics2.percentuale_tiri.toFixed(2);
        const tempo1= analytics1.tempo_corsa.toFixed(2);
        const tempo2= analytics2.tempo_corsa.toFixed(2);
        // Decido quali alerts mostrare
        if(analytics1.percentuale_tiri > analytics2.percentuale_tiri) {
            this.percentualeTiriComparison= `Il Player 1 ha una percentuale tiri maggiore del Player 2: ${tiri1}% > ${tiri2}%`;
        } else if(analytics2.percentuale_tiri > analytics1.percentuale_tiri) {
            this.percentualeTiriComparison= `Il Player 2 ha una percentuale tiri maggiore del Player 1: ${tiri2}% > ${tiri1}%`;
        } else {
            this.percentualeTiriComparison= `I due player hanno una percentuale tiri uguale (${tiri1}%)`;
        }
        if(analytics1.tempo_corsa < analytics2.tempo_corsa) {
            this.tempoCorsaComparison= `Il Player 1 è più veloce del Player 2: ${tempo1} sec. < ${tempo2} sec.`;
        } else if(analytics2.tempo_corsa < analytics1.tempo_corsa) {
            this.tempoCorsaComparison= `Il Player 2 è più veloce del Player 1: ${tempo2} sec. < ${tempo1} sec.`;
        } else {
            this.tempoCorsaComparison= `I due player sono veloci allo stesso modo (${tempo1} sec.)`;
        }
    }

    /*
    Questa funzione prende in input l'ID di un player, scarica i suoi allenamenti e restituisce una promise che
    diventa fullfilled quando la lista degli allenamenti è arrivata e che ritorna un errore oppure la lista.
    */
    private async getTrainsByPlayerId(playerId: string): Promise<Train[]> {
        const promise: Promise<Train[]>= new Promise<Train[]>((resolve, reject) => {
            this.playerService.getTrainsByPlayerId(playerId).subscribe({
                next: (trains) => {
                    resolve(trains);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /*
    Questa funzione prende in input l'ID di un player, scarica i suoi dati e restituisce una promise che diventa
    fullfilled quando i dati sono arrivati e che ritorna un errore oppure la stringa del nome del giocatore.
    */
    private async getPlayerNameById(playerId: string): Promise<string> {
        const promise: Promise<string>= new Promise<string>((resolve, reject) => {
            this.playerService.getPlayerById(playerId).subscribe({
                next: (player) => {
                    resolve(player.nome + " " + player.cognome);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /*
    Questa funzione ritorna:
    - una tupla di due stringhe con l'ID del player con lo score più alto e la stringa "Player n" dove n è 1 o 2
      a seconda del player vincitore.
    - null se gli score sono uguali.
    */
    private getBestPlayerId(): [string, string] | null {
        if(this.player1_score > this.player2_score) {
            return [this.selectedPlayer1Id!, "Player 1"];
        } else if(this.player2_score > this.player1_score) {
            return [this.selectedPlayer2Id!, "Player 2"];
        } else {
            return null;
        }
    }

    /*
    Questa funzione riceve due ID di player, scarica i loro allenamenti assicurandosi che nessuno dei due ne abbia zero,
    calcola gli analytics di entrambi, mostra il trend nel grafico e sceglie il player migliore in base agli analytics.
    */
    private async resetAnalyticsAndTrains(selectedPlayer1Id: string, selectedPlayer2Id: string): Promise<void> {
        // Scarico gli allenamenti del player 1
        try {
            this.trainsPlayer1= await this.getTrainsByPlayerId(selectedPlayer1Id);
        } catch(err) {
            // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
            if((err as HttpErrorResponse).status === 404) {
                alert("Errore: player 1 non esistente");
            } else {
                alert("Errore " + (err as HttpErrorResponse).status);
            }
            this.router.navigate(["/teams"]);
            return;
        }
        // Controllo che il player 1 abbia allenamenti
        if(this.trainsPlayer1.length === 0) {
            alert("Il Player 1 non ha allenamenti");
            return;
        }
        // Calcolo gli analytics del player 1
        this.analyticsPlayer1= this.calculateAnalytics(this.trainsPlayer1);
        // Scarico gli allenamenti del player 2
        try {
            this.trainsPlayer2= await this.getTrainsByPlayerId(selectedPlayer2Id);
        } catch(err) {
            // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
            if((err as HttpErrorResponse).status === 404) {
                alert("Errore: player 2 non esistente");
            } else {
                alert("Errore " + (err as HttpErrorResponse).status);
            }
            this.router.navigate(["/teams"]);
            return;
        }
        // Controllo che il player 2 abbia allenamenti
        if(this.trainsPlayer2.length === 0) {
            alert("Il Player 2 non ha allenamenti");
            return;
        }
        // Calcolo gli analytics del player 2
        this.analyticsPlayer2= this.calculateAnalytics(this.trainsPlayer2);
        // Calcolo i punteggi dei due player selezionati
        this.player1_score= this.calculateScore(this.trainsPlayer1);
        this.player2_score= this.calculateScore(this.trainsPlayer2);
        // Decido quale è il player migliore
        const bestPlayerData: [string, string] | null= this.getBestPlayerId();
        if(bestPlayerData) {
            // Se gli score sono diversi allora recupero nome e cognome del player migliore
            try {
                this.bestPlayer= await this.getPlayerNameById(bestPlayerData[0]) + " (" + bestPlayerData[1] + ")";
            } catch(err) {
                // Inizialmente err è di tipo unknown, quindi lo devo trattare come un HttpErrorResponse
                if((err as HttpErrorResponse).status === 404) {
                    alert("Errore: " + bestPlayerData[1] + " non esistente");
                } else {
                    alert("Errore " + (err as HttpErrorResponse).status);
                }
                this.router.navigate(["/teams"]);
                return;
            }
        } else {
            // Se gli score sono uguali allora mostro che nessun player è migliore
            this.bestPlayer= "Nessuno (Player con prestazioni uguali)";
        }
        // Mostro il confronto fra players, imposto gli alerts ed aggiorno il grafico dei trend
        this.compared= true;
        this.resetComparisonAlerts(this.analyticsPlayer1 as Omit<Train, "id_player" | "idx_train">, this.analyticsPlayer2 as Omit<Train, "id_player" | "idx_train">);
        this.resetTrend();
    }

    /*
    Questa funzione itera su ogni allenamento di ciascuno dei due player e calcola per ciascun elemento lo score.
    Infine, aggiorna la struttura apposita "bindata" con il grafico presente nella view, che si aggiorna
    automaticamente grazie ad Angular.
    */
    private resetTrend(): void {
        var scoresPlayer1: number[]= [];
        var scoresPlayer2: number[]= [];
        // Calcolo gli scores di ogni allenamento del player 1
        this.trainsPlayer1.forEach((train) => {
            const score: number= (train.percentuale_tiri + 100/train.tempo_corsa) / 2;
            scoresPlayer1.push(score);
        });
        // Calcolo gli scores di ogni allenamento del player 2
        this.trainsPlayer2.forEach((train) => {
            const score: number= (train.percentuale_tiri + 100/train.tempo_corsa) / 2;
            scoresPlayer2.push(score);
        });
        // Creo un oggetto che contiene i dati sugli score di ogni allenamento dei due player
        this.playersTrend= {
            // Valori sull'asse X: uso gli indici degli allenamenti (prendo la lunghezza maggiore
            // degli array contenenti gli allenamenti)
            labels: Array.from(
                // Definisco la lunghezza dell'array
                { length: Math.max(this.trainsPlayer1.length, this.trainsPlayer2.length) },
                // Definisco il contenuto con un'arrow function
                (_, i) => `Train ${i + 1}`
            ),
            // Valori sull'asse Y: uso gli score degli allenamenti
            datasets: [
                {
                    label: 'Player 1',
                    data: scoresPlayer1,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    borderWidth: 2,
                    pointRadius: 5,
                    fill: false
                },
                {
                    label: 'Player 2',
                    data: scoresPlayer2,
                    borderColor: 'red',
                    backgroundColor: 'red',
                    borderWidth: 2,
                    pointRadius: 5,
                    fill: false
                }
            ],
        };
    }

    ngOnInit(): void {
        // Carico i player
        this.resetPlayers();
        // Configuro il grafico per essere responsive e do un titolo all'asse Y ed all'asse X
        this.chartOptions= {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Performance score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Trains'
                    }
                }
            }
        };
    }

    /*
    Questa funzione si assicura che i player selezionati siano diversi ed avvia il confronto basato sugli analytics.
    */
    compare(): void {
        // Controllo che i due ID siano diversi
        if(this.selectedPlayer1Id === this.selectedPlayer2Id) {
            alert("Selezionare due player diversi");
            return;
        }
        // Scarico gli allenamenti, calcolo analytics dei player selezionati e decido quale è il migliore
        this.resetAnalyticsAndTrains(this.selectedPlayer1Id as string, this.selectedPlayer2Id as string);
    }

    /*
    Questa funzione resetta lo stato del componente ed aggiorna la lista dei player.
    */
    reset(): void {
        this.analyticsPlayer1= {};
        this.analyticsPlayer2= {};
        this.bestPlayer= null;
        this.compared= false;
        this.player1_score= 0;
        this.player2_score= 0;
        this.trainsPlayer1= [];
        this.trainsPlayer2= [];
        this.selectedPlayer1Id= null;
        this.selectedPlayer2Id= null;
        this.playersTrend= {
            labels: [],
            datasets: []
        };
        this.resetPlayers();
    }
}
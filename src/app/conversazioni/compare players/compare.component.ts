import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Player } from "../../modelli/player.model";
import { TeamService } from "../../servizi/team.service";
import { PlayerService } from "../../servizi/player.service";
import { Train } from "../../modelli/train.model";
import { Router } from "@angular/router";

@Component({
    standalone: true,
    selector: 'app-compare',
    imports: [CommonModule, FormsModule],
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
    performanceDifference: number= 0;
    bestPlayer: string | null= null;
    compared: boolean= false;
    selectedPlayer1Id: string | null= null;
    selectedPlayer2Id: string | null= null;
    percentualeTiriComparison: string | null= null;
    tempoCorsaComparison: string | null= null;

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router) {}

    private resetPlayers(): void {
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

    private resetComparisonAlerts(analytics1: Omit<Train, "id_player" | "idx_train">, analytics2: Omit<Train, "id_player" | "idx_train">): void {
        const tiri1= analytics1.percentuale_tiri.toFixed(2);
        const tiri2= analytics2.percentuale_tiri.toFixed(2);
        const tempo1= analytics1.tempo_corsa.toFixed(2);
        const tempo2= analytics2.tempo_corsa.toFixed(2);
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

    private resetAnalyticsAndTrains(selectedPlayer1Id: string, selectedPlayer2Id: string): void {
        // Scarico gli allenamenti del player 1
        this.playerService.getTrainsByPlayerId(selectedPlayer1Id).subscribe({
            next: (trains) => {
                this.trainsPlayer1= trains;
                // Controllo che il player 1 abbia allenamenti
                if(this.trainsPlayer1.length === 0) {
                    alert("Il Player 1 non ha allenamenti");
                    return;
                }
                // Calcolo gli analytics del player 1
                this.analyticsPlayer1= this.calculateAnalytics(this.trainsPlayer1);
                // Scarico gli allenamenti del player 2
                this.playerService.getTrainsByPlayerId(selectedPlayer2Id).subscribe({
                    next: (trains) => {
                        this.trainsPlayer2= trains;
                        // Controllo che il player 2 abbia allenamenti
                        if(this.trainsPlayer2.length === 0) {
                            alert("Il Player 2 non ha allenamenti");
                            return;
                        }
                        // Calcolo gli analytics del player 2
                        this.analyticsPlayer2= this.calculateAnalytics(this.trainsPlayer2);
                        // Calcolo i punteggi dei due player selezionati
                        this.player1_score= (this.analyticsPlayer1.percentuale_tiri! + (100 / this.analyticsPlayer1.tempo_corsa!)) / 2;
                        this.player2_score= (this.analyticsPlayer2.percentuale_tiri! + (100 / this.analyticsPlayer2.tempo_corsa!)) / 2;
                        // Decido quale è il player migliore
                        if(this.player1_score > this.player2_score) {
                            this.playerService.getPlayerById(selectedPlayer1Id).subscribe({
                                next: (player) => {
                                    this.bestPlayer= player.nome + " " + player.cognome + " (Player 1)";
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
                            this.performanceDifference= this.player1_score - this.player2_score;
                            this.compared= true;
                            this.resetComparisonAlerts(this.analyticsPlayer1 as Omit<Train, "id_player" | "idx_train">, this.analyticsPlayer2 as Omit<Train, "id_player" | "idx_train">);
                        } else if(this.player2_score > this.player1_score) {
                            this.playerService.getPlayerById(selectedPlayer2Id).subscribe({
                                next: (player) => {
                                    this.bestPlayer= player.nome + " " + player.cognome + " (Player 2)";
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
                            this.performanceDifference= this.player2_score - this.player1_score;
                            this.compared= true;
                            this.resetComparisonAlerts(this.analyticsPlayer1 as Omit<Train, "id_player" | "idx_train">, this.analyticsPlayer2 as Omit<Train, "id_player" | "idx_train">);
                        } else {
                            this.bestPlayer= "Nessuno (Player con prestazioni uguali)";
                            this.performanceDifference= 0;
                            this.compared= true;
                            this.resetComparisonAlerts(this.analyticsPlayer1 as Omit<Train, "id_player" | "idx_train">, this.analyticsPlayer2 as Omit<Train, "id_player" | "idx_train">);
                        }
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: player 2 non esistente");
                        } else {
                            alert("Errore " + err.status);
                        }
                        this.router.navigate(["/teams"]);
                        return;
                    }
                });
            },
            error: (err) => {
                if(err.status === 404) {
                    alert("Errore: player 1 non esistente");
                } else {
                    alert("Errore " + err.status);
                }
                this.router.navigate(["/teams"]);
                return;
            }
        });
    }

    ngOnInit(): void {
        // Carico i player
        this.resetPlayers();
    }

    compare(): void {
        // Controllo che i due ID siano diversi
        if(this.selectedPlayer1Id === this.selectedPlayer2Id) {
            alert("Selezionare due player diversi");
            return;
        }
        // Scarico gli allenamenti, calcolo analytics dei player selezionati e decido quale è il migliore
        this.resetAnalyticsAndTrains(this.selectedPlayer1Id as string, this.selectedPlayer2Id as string);
    }

    reset(): void {
        this.analyticsPlayer1= {};
        this.analyticsPlayer2= {};
        this.bestPlayer= null;
        this.performanceDifference= 0;
        this.compared= false;
        this.player1_score= 0;
        this.player2_score= 0;
        this.trainsPlayer1= [];
        this.trainsPlayer2= [];
        this.selectedPlayer1Id= null;
        this.selectedPlayer2Id= null;
        this.resetPlayers();
    }
}
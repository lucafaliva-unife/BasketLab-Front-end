import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Player } from "../../modelli/player.model";
import { Train } from "../../modelli/train.model";
import { TeamService } from "../../servizi/team.service";
import { PlayerService } from "../../servizi/player.service";

@Component({
    standalone: true,
    selector: 'app-compare',
    imports: [CommonModule, FormsModule],
    templateUrl: './builder.component.html',
    styleUrls: ['./builder.component.css']
})
export class BuilderComponent implements OnInit {
    allPlayers: Player[]= [];
    newPlayer: Player | null= null;
    selectedPlayers: Player[]= [];
    analytics: Omit<Train, "id_player" | "idx_train"> | null= null;

    constructor(private teamService: TeamService, private playerService: PlayerService) {}

    private resetPlayers(): void {
        this.allPlayers= [];
        this.teamService.getTeams().subscribe((teams) => {
            // Itero su tutti i team
            teams.forEach((team) => {
                this.teamService.getPlayersByTeamId(team.id_team).subscribe((players) => {
                    // Itero su tutti i player del team
                    players.forEach((player) => {
                        this.playerService.getTrainsByPlayerId(player.id_player).subscribe((trains) => {
                            // Se il player ha almeno un allenamento allora lo inserisco nella lista
                            if(trains.length > 0) {
                                this.allPlayers.push(player);
                            }
                        });
                    });
                });
            });
        });
    }

    private resetAnalytics(): void {
        var percentualeTiri: number= 0;
        var tempoCorsa: number= 0;
        var totTrains: number= 0;
        if(this.selectedPlayers.length === 0) {
            alert("Scegliere almeno un giocatore");
            return;
        }
        // Itero su tutti i player selezionati
        this.selectedPlayers.forEach((player) => {
            this.playerService.getTrainsByPlayerId(player.id_player).subscribe((trains) => {
                // Itero su tutti gli allenamenti del player
                trains.forEach((train) => {
                    percentualeTiri+= train.percentuale_tiri;
                    tempoCorsa+= train.tempo_corsa;
                    totTrains++;
                    // Aggiorno gli analytics con i dati che ho al momento
                    this.analytics= {
                        percentuale_tiri: percentualeTiri / totTrains,
                        tempo_corsa: tempoCorsa / totTrains
                    };
                });
            });
        });
    }

    ngOnInit(): void {
        // Raccolgo tutti i player che hanno almeno un allenamento
        this.resetPlayers();
    }

    addPlayer(): void {
        this.selectedPlayers.push(this.newPlayer as Player);
        this.allPlayers= this.allPlayers.filter(player => player.id_player !== this.newPlayer!.id_player);
        this.resetAnalytics();
        this.newPlayer= null;
    }

    removePlayer(player: Player): void {
        this.selectedPlayers= this.selectedPlayers.filter(p => p.id_player !== player.id_player);
        // Rimetto il player nella lista dei disponibili
        this.allPlayers.push(player);
        if(this.selectedPlayers.length > 0) {
            // Se quello che ho rimosso non era l'ultimo player allora aggiorno l'analytics
            this.resetAnalytics();
        }
    }

    reset(): void {
        this.newPlayer= null;
        this.selectedPlayers= [];
        this.analytics= null;
        this.resetPlayers();
    }
}
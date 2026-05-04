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
    selector: 'app-team',
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
    selectedTeamId: string | null= null;
    newPlayer: Partial<Omit<Player, "id_player">>= {};
    players: Player[]= [];
    teamIsVoid: boolean= false;
    teamAnalytics: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    analyticsIsVoid: boolean= false;
    selectedTeam: Partial<Team>= {};
    teamModifyState: boolean= false;
    playerModifyState: { [key: string]: boolean }= {}; // Dizionario che associa l'ID del player al suo modify state
    showForm: boolean= false;
    svincolati: boolean= false;

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    private resetPlayersModifyState(): void {
        this.players.forEach(player => {
            this.playerModifyState[player.id_player]= false;
        });
    }

        private loadTeamAnalytics(): void {
        if(this.selectedTeamId) {
            if(this.selectedTeam.nome === "Svincolati") {
                this.teamAnalytics= {};
                this.analyticsIsVoid= true;
                this.svincolati= true;
            } else {
                this.svincolati= false;
                this.teamService.getAnalyticsByTeamId(this.selectedTeamId).subscribe({
                    next: (analytics) => {
                        this.teamAnalytics= analytics;
                        if(Object.keys(this.teamAnalytics).length === 0) {
                            this.analyticsIsVoid= true;
                        } else {
                            this.analyticsIsVoid= false;
                        }
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: team non esistente");
                        } else {
                            alert("Errore " + err.status);
                        }
                        this.router.navigate(["/teams"]);
                    }
                });
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    private resetRankingAndModifyState(): void {
        if(this.selectedTeamId) {
            if(this.selectedTeam.nome === "Svincolati") {
                this.svincolati= true;
                this.teamService.getPlayersByTeamId(this.selectedTeamId).subscribe({
                    next: (players) => {
                        this.players= players;
                        if(this.players.length === 0) {
                            this.teamIsVoid= true;
                        } else {
                            this.teamIsVoid= false;
                            this.resetPlayersModifyState();
                        }
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: team non esistente");
                        } else {
                            alert("Errore: " + err.error);
                        }
                        this.router.navigate(["/teams"]);
                    }
                });
            } else {
                this.svincolati= false;
                this.teamService.getRankingByTeamId(this.selectedTeamId).subscribe({
                    next: (players) => {
                        this.players= players;
                        if(this.players.length === 0) {
                            this.teamIsVoid= true;
                        } else {
                            this.teamIsVoid= false;
                            this.resetPlayersModifyState();
                        }
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: team non esistente");
                        } else if(err.status === 409) {
                            alert("Errore: non puoi chiedere la classifica dei giocatori svincolati");
                        } else {
                            alert("Errore: " + err.error);
                        }
                        this.router.navigate(["/teams"]);
                    }
                });
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    private resetAllDataAndModifyState(): void {
        if(this.selectedTeamId) {
            this.teamService.getTeamById(this.selectedTeamId).subscribe({
                next: (team) => {
                    this.selectedTeam= team;
                    this.resetRankingAndModifyState();
                    this.loadTeamAnalytics();
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: team non esistente");
                    } else {
                        alert("Errore: " + err.error);
                    }
                    this.router.navigate(["/teams"]);
                }
            });
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
    }

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

    setModifyState(id: string): void {
        this.resetPlayersModifyState();
        this.playerModifyState[id]= true;
    }

    ngOnInit() {
        //Estraggo l'ID del team selezionato
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id) {
            this.selectedTeamId= id;
        } else {
            alert("Errore: ID non inserito");
            this.router.navigate(["/teams"]);
            return;
        }

        //Carico i dati dei player del team selezionato e gli analytics
        this.resetAllDataAndModifyState();
    }

    deleteTeam(): void {
        if(this.selectedTeamId) {
            const conferma: boolean= confirm("Sicuro di voler eliminare il team?");
            if(!conferma) {
                return;
            }
            this.teamService.deleteTeamById(this.selectedTeamId).subscribe({
                next: () => {
                    this.router.navigate(["/teams"]);
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: team non esistente");
                        this.router.navigate(["/teams"]);
                    } else if(err.status === 409) {
                        alert("Errore: non puoi eliminare gli svincolati");
                    } else {
                        alert("Errore " + err.status);
                    }
                }
            });
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    editTeam(): void {
        if(this.selectedTeamId) {
            const editedTeamData: Omit<Team, "id_team">= this.selectedTeam as Omit<Team, "id_team">;
            if(editedTeamData.nome.trim() !== "" && editedTeamData.citta.trim() !== "") {
                this.teamService.editTeamById(this.selectedTeamId, editedTeamData).subscribe({
                    next: () => {
                        this.teamModifyState= false;
                        this.resetAllDataAndModifyState();
                    },
                    error: (err) => {
                        if(err.status === 404) {
                            alert("Errore: team non esistente");
                            this.router.navigate(["/teams"]);
                        } else if(err.status === 400) {
                            alert("Errore: il server ha rifiutato i dati inviati");
                        }  else if(err.status === 409) {
                            alert("Errore: non puoi assegnare ad un team il nome 'Svincolati' o il nome di un altro team e non puoi modificare gli svincolati");
                        } else {
                            alert("Errore " + err.status);
                        }
                    }
                });
            } else {
                alert("I campi non possono essere vuoti");
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    createPlayer(newPlayerData: Partial<Omit<Player, "id_player">>): void {
        if(this.selectedTeamId) {
            if(
                newPlayerData.nome && newPlayerData.nome.trim() !== "" &&
                newPlayerData.cognome && newPlayerData.cognome.trim() !== "" &&
                newPlayerData.data_nascita &&
                newPlayerData.altezza &&
                newPlayerData.peso &&
                newPlayerData.ruolo
            ) {
                if(!this.validateHeightWeight(newPlayerData.altezza, newPlayerData.peso)) {
                    return;
                }
                const tempNewPlayer: Omit<Player, "id_player">= newPlayerData as Omit<Player, "id_player">;
                tempNewPlayer.id_team= this.selectedTeamId;
                this.playerService.createPlayer(tempNewPlayer).subscribe({
                    next: () => {
                        this.newPlayer= {};
                        this.showForm= false;
                        this.resetAllDataAndModifyState();
                    },
                    error: (err) => {
                        if(err.status === 400) {
                            alert("Errore: il server ha rifiutato i dati inviati");
                        }  else if(err.status === 409) {
                            alert("Errore: team del player non esistente");
                            this.router.navigate(["/teams"]);
                        } else {
                            alert("Errore: " + err.status);
                        }
                    }
                });
            } else {
                alert("I campi non possono essere vuoti");
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
    }

    editPlayer(player: Player): void {
        const editedPlayerData: Omit<Player, "id_player">= player as Omit<Player, "id_player">;
        if(
            editedPlayerData.nome && editedPlayerData.nome.trim() !== "" &&
            editedPlayerData.cognome && editedPlayerData.cognome.trim() !== "" &&
            editedPlayerData.data_nascita &&
            editedPlayerData.altezza &&
            editedPlayerData.peso &&
            editedPlayerData.ruolo
        ) {
            if(!this.validateHeightWeight(editedPlayerData.altezza, editedPlayerData.peso)) {
                return;
            }
            this.playerService.editPlayerById(player.id_player, editedPlayerData).subscribe({
                next: () => {
                    this.resetAllDataAndModifyState();
                },
                error: (err) => {
                    if(err.status === 400) {
                        alert("Errore: il server ha rifiutato i dati inviati");
                    }  else if(err.status === 404) {
                        alert("Errore: player non esistente");
                        this.resetAllDataAndModifyState();
                    } else {
                        alert("Errore: " + err.status);
                    }
                }
            });
        } else {
            alert("I campi non possono essere vuoti");
        }
    }

    deletePlayer(id: string): void {
        const conferma: boolean= confirm("Sicuro di voler eliminare il player?");
        if(!conferma) {
            return;
        }
        this.playerService.deletePlayerById(id).subscribe({
            next: () => {
                this.resetAllDataAndModifyState();
            },
            error: (err) => {
                if(err.status === 404) {
                    alert("Errore: player non esistente");
                    this.resetAllDataAndModifyState();
                } else {
                    alert("Errore: " + err.status);
                }
            }
        });
    }

}
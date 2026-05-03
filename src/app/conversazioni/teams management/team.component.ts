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
    selectedTeamId: number | null= null;
    newPlayer: Partial<Omit<Player, "id_player">>= {};
    players: Player[]= [];
    teamIsVoid: boolean= false;
    teamAnalytics: Partial<Omit<Train, "id_player" | "idx_train">>= {};
    analyticsIsVoid: boolean= false;
    selectedTeam: Partial<Team>= {};
    teamModifyState: boolean= false;
    playerModifyState: boolean[]= [];
    showForm: boolean= false;
    svincolati: boolean= false;

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    private resetPlayersModifyState(): void {
        this.players.forEach(player => {
            this.playerModifyState[player.id_player]= false;
        });
    }

    private resetAllDataAndModifyState(): void {
        if(this.selectedTeamId) {
            this.teamService.getTeamById(this.selectedTeamId).subscribe({
                next: (team) => {
                    this.selectedTeam= team;
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: team non esistente");
                    } else {
                        alert("Errore: " + err.error);
                    }
                    this.router.navigate(["/teams"]);
                    return;
                }
            });
            if(this.selectedTeam.nome === "Svincolati") {
                this.svincolati= true;
                this.playerService.getPlayersByTeamId(this.selectedTeamId).subscribe({
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
                        return;
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
                        return;
                    }
                });
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
            return;
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

    setModifyState(id: number): void {
        this.resetPlayersModifyState();
        this.playerModifyState[id]= true;
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
                        if(this.teamAnalytics.percentuale_tiri === null && this.teamAnalytics.tempo_corsa === null) {
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
                        return;
                    }
                });
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
    }

    ngOnInit() {
        //Estraggo l'ID del team selezionato
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id && !isNaN(Number(id))) {
            this.selectedTeamId= Number(id);
        } else {
            alert("ID non valido");
            this.router.navigate(["/teams"]);
            return;
        }

        //Carico i dati dei player del team selezionato
        this.resetAllDataAndModifyState();
        
        //Carico i dati di analytics del team selezionato
        this.loadTeamAnalytics();
    }

    deleteTeam(): void {
        if(this.selectedTeamId) {
            const conferma: boolean= confirm("Sicuro di voler eliminare il team?");
            if(!conferma) {
                return;
            }
            const result: boolean= TeamService.deleteTeamById(this.selectedTeamId).result;
            if(!result) {
                alert("Errore: team non esistente");
            }
        } else {
            alert("Nessun team selezionato");
        }
        this.router.navigate(["/teams"]);
        /*
        if(this.selectedTeamId) {
            const conferma: boolean= confirm("Sicuro di voler eliminare il team?");
            if(!conferma) {
                return;
            }
            this.teamService.deleteTeamById(this.selectedTeamId).subscribe(success => {
                if(!success.result) {
                    alert("Errore: team non esistente");
                }
            });
        } else {
            alert("Nessun team selezionato");
        }
        this.router.navigate(["/teams"]);
        */
    }

    editTeam(): void {
        if(this.selectedTeamId) {
            const editedTeamData: Omit<Team, "id_team">= this.selectedTeam as Omit<Team, "id_team">;
            if(editedTeamData.nome.trim() !== "" && editedTeamData.citta.trim() !== "") {
                const result: boolean= TeamService.editTeamById(this.selectedTeamId, editedTeamData).result;
                if(!result) {
                    alert("Errore: team non esistente");
                    this.router.navigate(["/teams"]);
                    return;
                }
                this.resetAllDataAndModifyState();
                this.teamModifyState= false;
            } else {
                alert("I campi non possono essere vuoti");
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
        /*
        if(this.selectedTeamId) {
            const editedTeamData: Omit<Team, "id_team">= this.selectedTeam as Omit<Team, "id_team">;
            if(editedTeamData.nome.trim() !== "" && editedTeamData.citta.trim() !== "") {
                this.teamService.editTeamById(this.selectedTeamId, editedTeamData).subscribe(success => {
                    if(!success.result) {
                        alert("Errore: team non esistente");
                        this.router.navigate(["/teams"]);
                    }
                    this.resetAllDataAndModifyState();
                });
            }
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
        */
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
                const result: boolean= PlayerService.createPlayer(tempNewPlayer).result;
                if(result) {
                    this.newPlayer= {};
                    this.showForm= false;
                } else {
                    alert("Errore: impossibile creare il nuovo team");
                }
            } else {
                alert("I campi non possono essere vuoti");
            }
            this.resetAllDataAndModifyState();
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
        /*
        if(this.selectedTeamId) {
            if(
                newPlayerData.nome && newPlayerData.nome.trim() !== "" &&
                newPlayerData.cognome && newPlayerData.cognome.trim() !== "" &&
                newPlayerData.data_nascita &&
                newPlayerData.altezza &&
                newPlayerData.peso &&
                newPlayerData.ruolo
            ) {
                const tempNewPlayer: Omit<Player, "id_player">= newPlayerData as Omit<Player, "id_player">;
                tempNewPlayer.id_team= this.selectedTeamId;
                this.playerService.createPlayer(tempNewPlayer).subscribe(success => {
                    if(success.result) {
                        this.newPlayer= {};
                        this.showForm= false;
                    } else {
                        alert("Errore: impossibile creare il nuovo team");
                    }
                });
            } else {
                alert("I campi non possono essere vuoti");
            }
            this.resetAllDataAndModifyState();
            } else {
                alert("Nessun team selezionato");
                this.router.navigate(["/teams"]);
                return;
            }
        */
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
            const result: boolean= PlayerService.editPlayerById(player.id_player, editedPlayerData).result;
            if(!result) {
                alert("Errore: player non esistente");
            }
            this.resetAllDataAndModifyState();
        } else {
            alert("I campi non possono essere vuoti");
        }
        /*
        const editedPlayerData: Omit<Player, "id_player">= player as Omit<Player, "id_player">;
        if(
            editedPlayerData.nome && editedPlayerData.nome.trim() !== "" &&
            editedPlayerData.cognome && editedPlayerData.cognome.trim() !== "" &&
            editedPlayerData.data_nascita &&
            editedPlayerData.altezza &&
            editedPlayerData.peso &&
            editedPlayerData.ruolo
        ) {
            this.playerService.editPlayerById(player.id_player, editedPlayerData).subscribe(success => {
                if(!success.result) {
                    alert("Errore: player non esistente");
                }
                this.resetAllDataAndModifyState();
            });
        } else {
            alert("I campi non possono essere vuoti");
        }
        */
    }

    deletePlayer(id: number): void {
        const conferma: boolean= confirm("Sicuro di voler eliminare il player?");
        if(!conferma) {
            return;
        }
        const result: boolean= PlayerService.deletePlayerById(id).result;
        if(!result) {
            alert("Errore: player non esistente");
        }
        this.resetAllDataAndModifyState();
        /*
        const conferma: boolean= confirm("Sicuro di voler eliminare il player?");
        if(!conferma) {
            return;
        }
        this.playerService.deletePlayerById(id).subscribe(success => {
            if(!success.result) {
                alert("Errore: player non esistente");
            }
            this.resetAllDataAndModifyState();
        });
        */
    }

}
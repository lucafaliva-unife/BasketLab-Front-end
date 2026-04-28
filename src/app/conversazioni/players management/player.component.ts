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
    selectedPlayerId: number | null= null;
    trains: Partial<Train>[]= [];
    trainIsVoid: boolean= false;
    teams: Team[]= [];
    teamName: string | null= null;

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    private resetAllData(): void {
        if(this.selectedPlayerId) {
            this.selectedPlayer= PlayerService.getPlayerById(this.selectedPlayerId);
            if(Object.keys(this.selectedPlayer).length === 0) {
                alert("Errore: player non esistente");
                this.router.navigate(["/teams"]);
                return;
            }
            this.teams= TeamService.getTeams();
            if(Object.keys(this.teams).length === 0) {
                alert("Errore: nessun team non esistente");
                this.router.navigate(["/teams"]);
                return;
            }
            const playerTeam: Team= TeamService.getTeamById((this.selectedPlayer as Player).id_team);
            if(Object.keys(playerTeam).length === 0) {
                alert("Errore: il team del player selezionato non esiste");
                this.router.navigate(["/teams"]);
                return;
            }
            this.teamName= playerTeam.nome;
            this.trains= PlayerService.getTrainsByPlayerId(this.selectedPlayerId);
            if(this.trains.length === 0) {
                this.trainIsVoid= true;
            } else {
                this.trainIsVoid= false;
            }
        } else {
            alert("Errore: nessun player selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
        /*
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
                    return;
                }
            });
            this.teamService.getTeams().subscribe(teams => {
                this.teams= teams;
                if(Object.keys(this.teams).length === 0) {
                    alert("Errore: nessun team non esistente");
                    this.router.navigate(["/teams"]);
                    return;
                }
            });
            this.teamService.getTeamById((this.selectedPlayer as Player).id_team).subscribe({
                next: (team) => {
                    this.teamName= team.nome;
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
            this.playerService.getTrainsByPlayerId(this.selectedPlayerId).subscribe({
                next: (trains) => {
                    this.trains= trains;
                    if(this.trains.length === 0) {
                        this.trainIsVoid= true;
                    } else {
                        this.trainIsVoid= false;
                    }
                },
                error: (err) => {
                    if(err.status === 404) {
                        alert("Errore: player non esiste");
                    } else {
                        alert("Errore " + err.status);
                    }
                    this.router.navigate(["/teams"]);
                    return;
                }
            });
        } else {
            alert("Nessun player selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
        */
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

    ngOnInit(): void {
        //Estraggo l'ID del player selezionato
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id && !isNaN(Number(id))) {
            this.selectedPlayerId= Number(id);
        } else {
            alert("ID non valido");
            this.router.navigate(["/teams"]);
            return;
        }

        //Carico i dati del player, i suoi allenamenti, i team ed il nome del team del player
        this.resetAllData();
    }

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
                const result: boolean= PlayerService.editPlayerById(this.selectedPlayerId, editedPlayerData).result;
                if(!result) {
                    alert("Errore: player non esistente");
                    this.router.navigate(["/teams"]);
                    return;
                }
                this.resetAllData();
                this.modifyState= false;
            } else {
                alert("I campi non possono essere vuoti");
            }
        } else {
            alert("Errore: nessun player selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
        /*
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
                this.playerService.editPlayerById(this.selectedPlayerId, editedPlayerData).subscribe(success => {
                    if(!success.result) {
                        alert("Errore: player non esistente");
                        this.router.navigate(["/teams"]);
                        return;
                    }
                    this.resetAllData();
                    this.modifyState= false;
                });
            } else {
                alert("I campi non possono essere vuoti");
            }
        } else {
            alert("Errore: nessun player selezionato");
            this.router.navigate(["/teams"]);
            return;
        }
        */
    }

    deletePlayer(): void {
        if(this.selectedPlayerId) {
            const conferma: boolean= confirm("Sicuro di voler eliminare il player?");
            if(!conferma) {
                return;
            }
            const result: boolean= PlayerService.deletePlayerById(this.selectedPlayerId).result;
            if(!result) {
                alert("Errore: player non esistente");
            }
            if(this.selectedPlayer.id_team) {
                this.router.navigate(["/teams", this.selectedPlayer.id_team]);
            } else {
                this.router.navigate(["/teams"]);
            }
        }
        /*
        if(this.selectedPlayerId) {
            const conferma: boolean= confirm("Sicuro di voler eliminare il player?");
            if(!conferma) {
                return;
            }
            this.playerService.deletePlayerById(this.selectedPlayerId).subscribe(success => {
                if(!success.result) {
                    alert("Errore: player non esistente");
                }
                if(this.selectedPlayer.id_team) {
                    this.router.navigate(["/teams", this.selectedPlayer.id_team]);
                } else {
                    this.router.navigate(["/teams"]);
                }
            });
        }
        */
    }

}
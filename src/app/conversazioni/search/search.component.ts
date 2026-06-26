import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TeamService } from "../../servizi/team.service";
import { Team } from "../../modelli/team.model";
import { Player } from "../../modelli/player.model";
import { PlayerService } from "../../servizi/player.service";

@Component({
    standalone: true,
    selector: 'app-search',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent {
    searchTerm: string= "";
    noTeamsVoid: boolean= false;
    noPlayersWithoutTrains: boolean= false;
    teamLimit: number= 1;
    playerLimit: number= 1;
    teamsFound: Team[]= [];
    playersFound: Player[]= [];
    searched: boolean= false;
    ordered: boolean= false;
    filtersVisibility: boolean= true;

    constructor(private teamService: TeamService, private playerService: PlayerService) {}

    /*
    Questa funzione cerca tra i nomi dei team e tra i nomi e cognomi dei player una sottostringa passata come parametro.
    */
    search(searchTerm: string, noTeamsVoid: boolean, noPlayersWithoutTrains: boolean): void {
        this.teamsFound= [];
        this.playersFound= [];
        searchTerm= searchTerm.toLowerCase();
        // Cerco tra i team
        this.teamService.getTeams().subscribe(teams => {
            teams.forEach((team) => {
                // Controllo se il nome del team include il termine di ricerca
                if(team.nome.toLowerCase().includes(searchTerm)) {
                    // Se voglio solo team con players allora controllo anche che ne abbia almeno uno, altrimenti lo
                    // inserisco direttamente
                    if(noTeamsVoid) {
                        this.teamService.getPlayersByTeamId(team.id_team).subscribe((teamPlayers) => {
                            if(teamPlayers.length > 0) {
                                this.teamsFound.push(team);
                                // Aggiorno il limite di team visualizzati
                                this.teamLimit= this.teamsFound.length;
                            }
                        });
                    } else {
                        this.teamsFound.push(team);
                        // Aggiorno il limite di team visualizzati
                        this.teamLimit= this.teamsFound.length;
                    }
                }
                // Cerco tra i player del team
                this.teamService.getPlayersByTeamId(team.id_team).subscribe(players => {
                    players.forEach((player => {
                        // Controllo se il nome o cognome del player include il termine di ricerca
                        if(player.nome.toLowerCase().includes(searchTerm) || player.cognome.toLowerCase().includes(searchTerm)) {
                            // Se voglio solo players con allenamenti allora controllo anche che ne abbia almeno uno,
                            // altrimenti lo inserisco direttamente
                            if(noPlayersWithoutTrains) {
                                this.playerService.getTrainsByPlayerId(player.id_player).subscribe((playerTrains) => {
                                    if(playerTrains.length > 0) {
                                        this.playersFound.push(player);
                                        // Aggiorno il limite di player visualizzati
                                        this.playerLimit= this.playersFound.length;
                                    }
                                });
                            } else {
                                this.playersFound.push(player);
                                // Aggiorno il limite di player visualizzati
                                this.playerLimit= this.playersFound.length;
                            }
                        }
                    }));
                });
            });
            this.searched= true;
        });
        this.ordered= false;
    }

    /*
    Questa funzione resetta lo stato del componente.
    */
    reset():void {
        this.searchTerm= "";
        this.noTeamsVoid= false;
        this.noPlayersWithoutTrains= false;
        this.teamsFound= [];
        this.playersFound= [];
        this.searched= false;
        this.ordered= false;
    }

    /*
    Questa funzione ordina:
    - i team comparsi tra i risultati di ricerca in ordine alfabetico crescente dato il nome;
    - i player comparsi tra i risultati di ricerca in ordine alfabetico crescente dato il cognome ed il nome.
    */
    order():void {
        if(!this.searched) {
            return;
        }
        this.playersFound.sort((p1, p2) => {
            if(p1.cognome.toLowerCase() > p2.cognome.toLowerCase()) {
                return 1;
            } else if(p2.cognome.toLowerCase() > p1.cognome.toLowerCase()) {
                return -1;
            } else {
                if(p1.nome.toLowerCase() > p2.nome.toLowerCase()) {
                    return 1;
                } else if(p2.nome.toLowerCase() > p1.nome.toLowerCase()) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });
        this.teamsFound.sort((t1, t2) => {
            if(t1.nome.toLowerCase() > t2.nome.toLowerCase()) {
                return 1;
            } else {
                return -1;
            }
        });
        this.ordered= true;
    }

}
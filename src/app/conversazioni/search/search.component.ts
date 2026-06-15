import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TeamService } from "../../servizi/team.service";
import { Team } from "../../modelli/team.model";
import { Player } from "../../modelli/player.model";

@Component({
    standalone: true,
    selector: 'app-search',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent {
    searchTerm: string= "";
    teamLimit: number= 1;
    playerLimit: number= 1;
    teamsFound: Team[]= [];
    playersFound: Player[]= [];
    searched: boolean= false;
    ordered: boolean= false;
    filtersVisibility: boolean= true;

    constructor(private teamService: TeamService) {}

    search(searchTerm: string): void {
        this.teamsFound= [];
        this.playersFound= [];
        searchTerm= searchTerm.toLowerCase();
        // Cerco tra i team
        this.teamService.getTeams().subscribe(teams => {
            teams.forEach((team) => {
                if(team.nome.toLowerCase().includes(searchTerm)) {
                    this.teamsFound.push(team);
                }
                // Cerco tra i player del team
                this.teamService.getPlayersByTeamId(team.id_team).subscribe(players => {
                    players.forEach((player => {
                        if(player.nome.toLowerCase().includes(searchTerm) || player.cognome.toLowerCase().includes(searchTerm)) {
                            this.playersFound.push(player);
                        }
                    }));
                    this.playerLimit= this.playersFound.length;
                });
            });
            this.teamLimit= this.teamsFound.length;
            this.searched= true;
        });
        this.ordered= false;
    }

    reset():void {
        this.searchTerm= "";
        this.teamsFound= [];
        this.playersFound= [];
        this.searched= false;
        this.ordered= false;
    }

    order():void {
        if(!this.searched) {
            return;
        }
        this.playersFound.sort((p1, p2) => {
            if(p1.cognome > p2.cognome) {
                return 1;
            } else if(p2.cognome > p1.cognome) {
                return -1;
            } else {
                if(p1.nome >= p2.nome) {
                    return 1;
                } else {
                    return -1;
                }
            }
        });
        this.teamsFound.sort((t1, t2) => {
            if(t1.nome >= t2.nome) {
                return 1;
            } else {
                return -1;
            }
        });
        this.ordered= true;
    }

}
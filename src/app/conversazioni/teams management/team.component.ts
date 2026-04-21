import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Team } from '../../modelli/team.model';
import { Player } from '../../modelli/player.model';
import { TeamService } from '../../servizi/team.service';
import { PlayerService } from '../../servizi/player.service';

@Component({
  standalone: true,
  selector: 'app-teams',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
    selectedTeamId: number | null= null;
    newPlayer: Partial<Omit<Player, "id_player">>= {};
    players: Player[]= [];
    selectedTeam: Partial<Team>= {};
    teamModifyState: boolean= false;
    playerModifyState: boolean[]= [];
    showForm: boolean= false;

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    private resetPlayersModifyState(): void {
        this.players.forEach(player => {
            this.playerModifyState[player.id_player]= false;
        });
    }

    private resetAllDataAndModifyState(): void {
        if(this.selectedTeamId) {
            this.selectedTeam= TeamService.getTeamById(this.selectedTeamId);
            this.players= PlayerService.getPlayersByTeamId(this.selectedTeamId);
            this.resetPlayersModifyState();
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
        /*
        if(this.selectedTeamId) {
            this.teamService.getTeamById(this.selectedTeamId).subscribe({
                next: (team) => {
                    this.selectedTeam= team;
                    this.playerService.getPlayersByTeamId(this.selectedTeamId).subscribe({
                        next: (players) => {
                            this.players= players;
                            this.resetPlayersModifyState();
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
        } else {
            alert("Nessun team selezionato");
            this.router.navigate(["/teams"]);
        }
        */
    }

    setModifyState(id: number): void {
        this.resetPlayersModifyState();
        this.playerModifyState[id]= true;
    }

    ngOnInit() {
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id && !isNaN(Number(id))) {
            this.selectedTeamId= Number(id);
        } else {
            alert("ID non valido");
            this.router.navigate(["/teams"]);
        }
        this.resetAllDataAndModifyState();
    }

}
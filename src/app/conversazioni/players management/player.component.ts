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

    resetAllData(): void {
        if(this.selectedPlayerId) {
            this.selectedPlayer= PlayerService.getPlayerById(this.selectedPlayerId);
            if(Object.keys(this.selectedPlayer).length === 0) {
                alert("Errore: player non esistente");
                this.router.navigate(["/teams"]);
            }
            this.teams= TeamService.getTeams();
            if(Object.keys(this.teams).length === 0) {
                alert("Errore: nessun team non esistente");
                this.router.navigate(["/teams"]);
            }
            const playerTeam: Team= TeamService.getTeamById((this.selectedPlayer as Player).id_team);
            if(Object.keys(playerTeam).length === 0) {
                alert("Errore: il team del player selezionato non esiste");
                this.router.navigate(["/teams"]);
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
        }
        /*

        */
    }

    ngOnInit(): void {
        //Estraggo l'ID del player selezionato
        const id: string | null= this.route.snapshot.paramMap.get('id');
        if(id && !isNaN(Number(id))) {
            this.selectedPlayerId= Number(id);
        } else {
            alert("ID non valido");
            this.router.navigate(["/teams"]);
        }

        //Carico i dati del player, i suoi allenamenti ed i team
        this.resetAllData();
    }

    editPlayer(): void {

    }

    deletePlayer(): void {

    }

}
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
  selector: 'app-train',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {

    constructor(private teamService: TeamService, private playerService: PlayerService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit(): void {
        
    }

}
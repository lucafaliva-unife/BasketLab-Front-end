import { Routes } from '@angular/router';
import { TeamsComponent } from './conversazioni/teams management/teams.component';
import { TeamComponent } from './conversazioni/teams management/team.component';
import { PlayerComponent } from './conversazioni/players management/player.component';
import { TrainComponent } from './conversazioni/train player/train.component';
import { PredictComponent } from './conversazioni/predict/predict.component';

export const routes: Routes= [
    { path: '', redirectTo: '/teams', pathMatch: 'full' },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: TeamComponent },
    { path: 'players/:id', component: PlayerComponent },
    { path: 'players/:id/train', component: TrainComponent },
    { path: 'predict', component: PredictComponent }
];
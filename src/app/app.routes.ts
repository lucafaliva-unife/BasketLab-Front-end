import { Routes } from '@angular/router';
import { TeamsComponent } from './conversazioni/teams management/teams.component';

export const routes: Routes= [
    { path: '', redirectTo: '/teams', pathMatch: 'full' },
    { path: 'teams', component: TeamsComponent },
    /*
    { path: 'teams/:id', component: TeamComponent },
    { path: 'teams/:id/ranking', component: PlayersRankingComponent },
    { path: 'players/:id', component: PlayerComponent },
    { path: 'players/:id/train', component: TrainPlayerComponent },
    { path: 'predict', component: PredictComponent }
     */
];
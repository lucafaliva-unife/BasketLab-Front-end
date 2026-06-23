import { Routes } from '@angular/router';
import { TeamsComponent } from './conversazioni/teams/teams.component';
import { TeamComponent } from './conversazioni/team/team.component';
import { PlayerComponent } from './conversazioni/player/player.component';
import { TrainComponent } from './conversazioni/train/train.component';
import { PredictComponent } from './conversazioni/predict/predict.component';
import { SearchComponent } from './conversazioni/search/search.component';
import { CompareComponent } from './conversazioni/compare/compare.component';

export const routes: Routes= [
    { path: '', redirectTo: '/teams', pathMatch: 'full' },
    { path: 'teams', component: TeamsComponent },
    { path: 'teams/:id', component: TeamComponent },
    { path: 'players/:id', component: PlayerComponent },
    { path: 'players/:id/train', component: TrainComponent },
    { path: 'predict', component: PredictComponent },
    { path: 'search', component: SearchComponent },
    { path: 'compare', component: CompareComponent }
];
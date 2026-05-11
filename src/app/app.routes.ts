import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { Analytics } from './components/dashboard/analytics/analytics';
import { Surveys } from './components/dashboard/surveys/surveys';
import { authGuard } from './guard/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'home',
        component: Home,
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: Surveys,
            },
            {
                path: 'analytics',
                component: Analytics,
            }
        ]

    },
    {
        path: '**',
        redirectTo: '',
    }
];

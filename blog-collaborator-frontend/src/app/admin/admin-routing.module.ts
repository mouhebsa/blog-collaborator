import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { authGuard } from '../auth/guards/auth.guard';
import { UserRole } from '../auth/models/roles.enum';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [authGuard],
    data: {
      roles: [UserRole.Admin]
    },
    children: [
      { path: 'users', component: UserListComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

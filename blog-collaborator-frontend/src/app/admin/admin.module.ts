import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { UserListComponent } from './components/user-list/user-list.component';

@NgModule({
  imports: [AdminRoutingModule, UserListComponent],
})
export class AdminModule {}

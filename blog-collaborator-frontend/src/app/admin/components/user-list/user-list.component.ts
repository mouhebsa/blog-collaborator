import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../../auth/models/user.interface';
import { UsersControlService } from '../services/users-control.service';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { BehaviorSubject, Observable, Subscription, take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-list',
  imports: [
    TableModule,
    ChipModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    AsyncPipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit, OnDestroy {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$: Observable<User[]> = this.usersSubject.asObservable();
  private subscriptions = new Subscription();

  loading: boolean = true;
  visible = false;
  itemSelected: User | null = null;
  selectedRole: string = '';
  currentuser: User | null = null;

  availableRoles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Editor', value: 'Editor' },
    { label: 'Writer', value: 'Writer' },
    { label: 'Reader', value: 'Reader' },
  ];

  constructor(
    private userService: UsersControlService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.currentuser = this.authService.getCurrentUser();
  }

  loadUsers(): void {
    this.loading = true;
    this.subscriptions.add(
      this.userService.getAllUsers().subscribe({
        next: (data) => {
          this.usersSubject.next(data);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch users', err);
          this.loading = false;
        },
      })
    );
  }

  showDialog(user: User): void {
    this.itemSelected = user;
    this.selectedRole =
      user.roles && user.roles.length > 0 ? user.roles[0] : '';
    this.visible = true;
  }

  updateUserRole(): void {
    if (!this.itemSelected || !this.selectedRole) {
      return;
    }

    this.subscriptions.add(
      this.userService
        .updateUserRole(this.itemSelected._id, [this.selectedRole])
        .subscribe({
          next: (response) => {
            const currentUsers = this.usersSubject.value;
            const updatedUsers = currentUsers.map((user) =>
              user._id === this.itemSelected!._id
                ? { ...user, roles: [this.selectedRole] }
                : user
            );
            this.usersSubject.next(updatedUsers);
            this.visible = false;
            this.itemSelected = null;
            this.selectedRole = '';
          },
          error: (err) => {
            console.error('Failed to update user role', err);
          },
        })
    );
  }

  cancelDialog(): void {
    this.visible = false;
    this.itemSelected = null;
    this.selectedRole = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

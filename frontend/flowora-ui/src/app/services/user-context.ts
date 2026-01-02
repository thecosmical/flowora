import { Injectable, signal } from '@angular/core';
import { UserRole } from '../data/request.models';

export type User = { name: string; role: UserRole };

@Injectable({ providedIn: 'root' })
export class UserContextService {
  readonly users: User[] = [
    { name: 'Rahul (Ops)', role: 'OPS_MANAGER' },
    { name: 'Tarun (CEO)', role: 'CEO' },
    { name: 'Vikram (Procurement)', role: 'PROCUREMENT' }
  ];

  private readonly _current = signal<User>(this.users[0]);

  current = this._current.asReadonly();

  setCurrent(name: string) {
    const found = this.users.find(u => u.name === name);
    if (found) this._current.set(found);
  }
}

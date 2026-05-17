import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { UserType } from '../user/user.model';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  private userService = inject(UserService);
  private router = inject(Router);

  constructor(
  ) {}

  async canActivate(): Promise<boolean> {
    const user = await this.userService.getUser();
    if (!user) {
      return false;
    }
    if (UserType.Admin || user.type === UserType['Super-Admin']) {
      return true;
    }
    this.router.navigateByUrl('/', { replaceUrl:true });
    return false;
  };
}

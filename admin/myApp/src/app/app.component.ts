import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  showMenu: boolean = true;


constructor(
    private router: Router,
) {}

ngOnInit() {
 this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showMenu = event.url !== '/login';
        console.log('当前路由:', event.url, '显示菜单:', this.showMenu);
      });
}

forShowMenu(){
  this.showMenu=true;
  console.log(this.router.url);
}

LogOut() {
  localStorage.clear();
  this.router.navigate(['/login']);
}
}
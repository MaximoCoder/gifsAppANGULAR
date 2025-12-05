import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GifService } from '../../../services/gifs.service';
import { Gif } from '../../../interfaces/giphy.interface';

interface MenuOption {
  icon : string;
  label : string;
  route  : string;
  subLabel? : string;
}

@Component({
  selector: 'gifs-side-menu-options',
  imports: [
    RouterLink, RouterLinkActive
  ],
  templateUrl: './side-menu-options.html',
})
export class SideMenuOptions {
  gifService = inject(GifService);
 

  menuOptions: MenuOption[] = [
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Trending',
      route: '/dashboard/trending',
      subLabel: 'Gifs más populares'
    },
    {
      icon: 'fa-solid fa-magnifying-glass',
      label: 'Buscador',
      route: '/dashboard/search',
      subLabel: 'Buscar gifs'
    },
  ];
}

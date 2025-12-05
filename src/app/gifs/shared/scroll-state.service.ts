import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/giphy.interface';
import { signal } from '@angular/core';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ScrollStateService {
  trendingScrollState = signal(0);

  
}

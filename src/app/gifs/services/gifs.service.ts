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
export class GifService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'gif-search-history';
  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoaded = signal(true);

  // LOCAL STORAGE / HISTORY
  searchHistory = signal<Record<string, Gif[]>>(this.loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  constructor() {
    this.loadTrendingGifs();
  }
  loadTrendingGifs() {
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: '25',
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.set(gifs);
        this.trendingGifsLoaded.set(false);
      });
  }

  private loadFromLocalStorage(): Record<string, Gif[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private saveToLocalStorage(history: Record<string, Gif[]>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  searchGifs(query: string): Observable<Gif[]> {
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: {
          api_key: environment.giphyApiKey,
          q: query,
          limit: '25',
        },
      })
      .pipe(
        map(({ data }) => data),
        map((items) => GifMapper.mapGiphyItemsToGifArray(items)),

        // secondary event(tap) for history
        tap((items) => {
          const updatedHistory = {
            ...this.searchHistory(),
            [query.toLowerCase()]: items,
          };
          this.searchHistory.set(updatedHistory);
          this.saveToLocalStorage(updatedHistory);
        })
      );
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query.toLocaleLowerCase()] || [];
  }
}

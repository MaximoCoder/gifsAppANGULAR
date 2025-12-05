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
  private trendingPage = signal(0);
  private readonly STORAGE_KEY = 'gif-search-history';
  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoaded = signal(false);


  // convertir a arreglos de 3 en 3 para el masonry
  trendingGifsInRows = computed<Gif[][]> ( () => {
    const groups = [];
    for ( let i = 0; i < this.trendingGifs().length; i += 3) {
      groups.push( this.trendingGifs().slice(i, i + 3) );
    }
    return groups;
  })


  // LOCAL STORAGE / HISTORY
  searchHistory = signal<Record<string, Gif[]>>(this.loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  constructor() {
    this.loadTrendingGifs();
  }
  loadTrendingGifs() {

    if(this.trendingGifsLoaded()) return;

    this.trendingGifsLoaded.set(true);

    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: '25',
          offset: (this.trendingPage() * 25).toString(),
        },
      })
      .subscribe((resp) => {
        this.trendingPage.update((value) => value + 1);
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.update(currentGifs => [...currentGifs, ...gifs]);
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

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

type TranslationValue = string | TranslationMap;
interface TranslationMap {
  [key: string]: TranslationValue;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  public currentLang: 'en' | 'ar' = 'en';
  private translationFile: TranslationMap = {};
  private isRTLSubject = new BehaviorSubject<boolean>(false);
  public isRTL$ = this.isRTLSubject.asObservable();

  async loadTranslationFile(lang: 'en' | 'ar'): Promise<boolean> {
    if (lang !== 'en' && lang !== 'ar') lang = 'en';

    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    this.isRTLSubject.next(lang === 'ar');

    try {
      this.translationFile = await firstValueFrom(
        this.http.get<TranslationMap>(`assets/i18n/${lang}.json`)
      );
      this.currentLang = lang;
      return true;
    } catch (error) {
      console.error('Failed to load translation file:', error);
      return false;
    }
  }

  translate(key: string): string {
    const keys = key.split('.');
    let translation: TranslationValue = this.translationFile;

    for (const k of keys) {
      if (typeof translation === 'object' && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        return key; // fallback if key not found
      }
    }

    return typeof translation === 'string' ? translation : key;
  }
}

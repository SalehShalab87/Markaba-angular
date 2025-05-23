import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenUrl',
})
export class ShortenUrlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const url = new URL(value);
    console.log( `${url.hostname}...${url.pathname.slice(-10)}`);
    
    return `${url.hostname}...${url.pathname.slice(-10)}`;
  }
}

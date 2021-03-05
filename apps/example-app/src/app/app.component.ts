import { Component, ElementRef, ViewChild } from '@angular/core';
import { ExOrchestration } from './ex';

function parseOneFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;
  if (files.length > 1) throw new Error('Can only upload 1 file at a time.');

  const file = files.item(0);
  if (!file) throw new Error('File not found.');

  return file;
}

@Component({
  selector: 'orcha-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('profilePicInp') profilePicInp!: ElementRef<HTMLInputElement>;

  constructor(private ex: ExOrchestration) {}

  changeProfilePicButtonClick() {
    this.profilePicInp.nativeElement.click();
  }

  changeProfilePic(event: Event) {
    let file: File | undefined;
    try {
      file = parseOneFile(event);
    } catch (error) {}

    if (!file) return;

    this.ex.fileUpload({ res: true, derp: true }, { name: 'sd' }).subscribe((event) => {
      console.log(event);
    });
  }
}

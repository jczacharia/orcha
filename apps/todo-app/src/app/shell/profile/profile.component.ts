import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { EntireProfile } from '@todo-example-app-lib/shared';
import { AppFacade } from '../../domain/app.facade';
import { UserOrchestration } from '../../domain/user/user.orchestration';

function parseOneFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;
  if (files.length > 1) throw new Error('Can only upload 1 file at a time.');

  const file = files.item(0);
  if (!file) throw new Error('File not found.');

  return file;
}

function parseOneImageFile(event: Event) {
  const file = parseOneFile(event);

  if (!file) return;
  if (!file.type.match(/image\/*/)) throw new Error('File must be an image.');

  return file;
}

@Component({
  selector: 'orcha-todo-example-app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  @ViewChild('profilePicInp') profilePicInp!: ElementRef<HTMLInputElement>;

  readonly profile$ = this.user.getProfile();

  constructor(private user: UserOrchestration, private app: AppFacade) {}

  updateProfilePicBtnClicked() {
    this.profilePicInp.nativeElement.click();
  }

  updateProfilePic(event: Event) {
    let file: File | undefined;
    try {
      file = parseOneImageFile(event);
    } catch (error: any) {
      alert(error.message);
    }

    if (!file) return;

    this.app.user.dispatchers.updateProfilePic(file);
  }
}

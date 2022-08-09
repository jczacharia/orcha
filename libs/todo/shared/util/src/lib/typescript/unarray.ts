import { Observable } from 'rxjs';

export type UnObservable<T> = T extends Observable<infer U> ? U : T;

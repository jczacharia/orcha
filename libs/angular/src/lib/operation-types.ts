/* eslint-disable @typescript-eslint/no-explicit-any */
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Injector } from '@angular/core';
import {
  IExactQuery,
  IPaginateQuery,
  IPagination,
  IParserSerialized,
  IQuery,
  OrchaProps,
  OrchaResponse,
} from '@orcha/common';
import { filter, map, Subject, tap } from 'rxjs';
import {
  IClientOperationEvent,
  IClientOperationFileDownload,
  IClientOperationFilesUpload,
  IClientOperationFileUpload,
  IClientOperationPaginate,
  IClientOperationQuery,
  IClientOperationSimple,
} from './client';
import { SSE } from './sse';
import { ORCHA_TOKEN_RETRIEVER } from './tokens';

export function createOperationSimple<T, Q extends IQuery<T>, D extends Record<string, any>>(
  url: string,
  injector: Injector
): IClientOperationSimple<T, Q, D> {
  return (dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const body = dto ? { [OrchaProps.DTO]: dto } : {};

    return injector.get(HttpClient).post<OrchaResponse<IParserSerialized<T, Q>>>(url, body, {
      headers: { [OrchaProps.TOKEN]: token },
    });
  };
}

export function createOperationQuery<T, D extends Record<string, any>>(
  url: string,
  injector: Injector
): IClientOperationQuery<T, D> {
  return <Q extends IQuery<T>>(query: IExactQuery<T, Q>, dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const body = dto ? { [OrchaProps.DTO]: dto, [OrchaProps.QUERY]: query } : { [OrchaProps.QUERY]: query };

    return injector.get(HttpClient).post<OrchaResponse<IParserSerialized<T, Q>>>(url, body, {
      headers: { [OrchaProps.TOKEN]: token },
    });
  };
}

export function createOperationPaginate<T, Q extends IQuery<T>, D extends Record<string, any>>(
  url: string,
  injector: Injector
): IClientOperationPaginate<T, Q, D> {
  return (paginate: IPaginateQuery, dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const body = dto
      ? { [OrchaProps.DTO]: dto, [OrchaProps.PAGINATE]: paginate }
      : { [OrchaProps.PAGINATE]: paginate };

    return injector.get(HttpClient).post<OrchaResponse<IPagination<IParserSerialized<T, Q>>>>(url, body, {
      headers: { [OrchaProps.TOKEN]: token },
    });
  };
}

export function createOperationFileUpload<T, Q extends IQuery<T>, D extends Record<string, any>>(
  url: string,
  injector: Injector
): IClientOperationFileUpload<T, Q, D> {
  return (file: File, dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const body = new FormData();

    body.append(OrchaProps.FILE, file, file.name);

    if (dto) {
      body.set(OrchaProps.DTO, JSON.stringify(dto));
    }

    return injector
      .get(HttpClient)
      .post<OrchaResponse<IParserSerialized<T, Q>>>(url, body, {
        reportProgress: true,
        observe: 'events',
        headers: { [OrchaProps.TOKEN]: token },
      })
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              return { ...event, progress: Math.round((100 * event.loaded) / (event.total ?? 1)) };
            case HttpEventType.Response:
              return event;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return null!;
        }),
        filter((e) => !!e)
      );
  };
}

export function createOperationFilesUpload<T, Q extends IQuery<T>, D extends Record<string, any>>(
  url: string,
  injector: Injector
): IClientOperationFilesUpload<T, Q, D> {
  return (files: File[], dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const body = new FormData();

    files.forEach((file) => body.append(OrchaProps.FILES, file, file.name));

    if (dto) {
      body.set(OrchaProps.DTO, JSON.stringify(dto));
    }

    return injector
      .get(HttpClient)
      .post<OrchaResponse<IParserSerialized<T, Q>>>(url, body, {
        reportProgress: true,
        observe: 'events',
        headers: { [OrchaProps.TOKEN]: token },
      })
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              return { ...event, progress: Math.round((100 * event.loaded) / (event.total ?? 1)) };
            case HttpEventType.Response:
              return event;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return null!;
        }),
        filter((e) => !!e)
      );
  };
}

export function createOperationEventSubscriber<
  T,
  Q extends IQuery<T>,
  D extends Record<string, string | number>
>(url: string, injector: Injector): IClientOperationEvent<T, Q, D> {
  return (dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const queryParamsString = new HttpParams({ fromObject: dto }).toString();
    const subject = new Subject<IParserSerialized<T, Q>>();

    const source = new SSE(`${url}?${queryParamsString}`, {
      headers: { [OrchaProps.TOKEN]: token },
    });

    source.addEventListener('message', (msg: { data: string }) => {
      const data = JSON.parse(msg.data) as IParserSerialized<T, Q>;
      subject.next(data);
    });

    source.addEventListener('error', (error: unknown) => {
      subject.error(error);
    });

    source.stream();
    return subject.asObservable();
  };
}

export function createOperationFileDownload<D extends Record<string, string | number>>(
  url: string,
  injector: Injector
): IClientOperationFileDownload<D> {
  return (dto?: D) => {
    const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

    const body = dto ? { [OrchaProps.DTO]: dto } : {};

    const doc = injector.get(DOCUMENT);

    return injector
      .get(HttpClient)
      .post(url, body, {
        headers: { [OrchaProps.TOKEN]: token },
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        tap((data) => {
          const disposition = data.headers.get('Content-Disposition');
          const filename = disposition?.match(/attachment; filename="(.+)"/);
          if (data.body) {
            const element = doc.createElement('a');
            element.href = URL.createObjectURL(data.body);
            element.download = filename?.[1] ?? 'file';
            doc.body.appendChild(element);
            element.click();
            doc.body.removeChild(element);
          }
        })
      );
  };
}

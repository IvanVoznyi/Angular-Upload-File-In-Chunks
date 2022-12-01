import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface Chunk {
  chunk: FormData;
  contentRange: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  percentDone$ = new Subject()

  constructor(private http: HttpClient) { }

  private createChunk(files: FileList): Array<Chunk> {
    const chunks = [];

    if (files) {
      const file = files[0];
      const mb = 1024 * 1024; // 1 MB chunk
      const chunkSize = mb * 10; // 10 MB chunk
      let startPointer = 0;
      let endPointer = file.size;

      while (startPointer < endPointer) {
        const chunkForm = new FormData();
        let newStartPointer = startPointer + chunkSize;

        if (newStartPointer > endPointer) {
          newStartPointer = endPointer;
        }

        chunkForm.append(
          'file',
          file.slice(startPointer, newStartPointer),
          file.name
        );

        const contentRange = `bytes ${startPointer}-${newStartPointer}/${file.size}`;

        chunks.push({
          chunk: chunkForm,
          contentRange,
        });

        startPointer = newStartPointer;
      }
    }
    return chunks;
  }

  upload(files: FileList) {
    const chunks = this.createChunk(files);
    const fileSize = files[0].size
    let totalLoaded = 0;

    chunks.forEach(({ chunk, contentRange }) => {
      const headers = new HttpHeaders().set('Content-Range', contentRange);

      const req = new HttpRequest('POST', 'api', chunk, {
        reportProgress: true,
        headers,
      });

      this.http
        .request(req)
        .subscribe((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            totalLoaded += event.loaded;

            if (totalLoaded > fileSize) {
              totalLoaded = fileSize
            }

            this.percentDone$.next(Math.round(100 * totalLoaded / fileSize));
          }
        });
    });
  }
}

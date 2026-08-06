import { HttpParams } from '@angular/common/http';

type HttpParamPrimitive = string | number | boolean | null | undefined;
type HttpParamValue = HttpParamPrimitive | readonly HttpParamPrimitive[];

export function buildHttpParams(params: Record<string, HttpParamValue>): HttpParams {
  let httpParams = new HttpParams();

  for (const [key, rawValue] of Object.entries(params)) {
    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        if (item === null || item === undefined || item === '') {
          continue;
        }

        const safeItem = item as Exclude<HttpParamPrimitive, null | undefined>;
        const formattedItem = formatHttpParam(safeItem);
        httpParams = httpParams.append(key, formattedItem);
      }

      continue;
    }

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }

    httpParams = httpParams.set(
      key,
      formatHttpParam(rawValue as Exclude<HttpParamPrimitive, null | undefined>),
    );
  }

  return httpParams;
}

function formatHttpParam(value: Exclude<HttpParamPrimitive, null | undefined>): string {
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return String(value);
}

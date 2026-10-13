export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export function actionError(message: string): ActionResult<never> {
  return { ok: false, error: message };
}

export function actionOk<T>(data?: T): ActionResult<T> {
  return data !== undefined ? { ok: true, data } : { ok: true };
}

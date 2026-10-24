import type {
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
  ToastCloseReason,
  ToastSystemConfig,
} from './types';

import React from 'react';

let toastsCounter = 1;

type titleT = (() => React.ReactNode) | React.ReactNode;

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>;
  toasts: Array<ToastT | ToastToDismiss>;
  dismissedToasts: Set<string | number>;
  systemConfigs: Map<string | undefined, ToastSystemConfig>;

  constructor() {
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = new Set();
    this.systemConfigs = new Map();
  }

  setSystemConfig = (toasterId: string | undefined, config?: ToastSystemConfig) => {
    if (!config) {
      this.systemConfigs.delete(toasterId);
      return;
    }
    this.systemConfigs.set(toasterId, config);
  };

  getSystemConfig = (toasterId: string | undefined): ToastSystemConfig | undefined => {
    return this.systemConfigs.get(toasterId) ?? this.systemConfigs.get(undefined);
  };

  isDedupeEnabled = (config?: ToastSystemConfig) => {
    return config?.dedupe?.enabled === true;
  };

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      // Be defensive: in some dev / hot-reload edge cases the subscriber reference
      // might not be found, and `splice(-1, 1)` would remove the last subscriber.
      if (index !== -1) this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
  };

  create = (
    data: ExternalToast & {
      message?: titleT;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: React.ReactElement;
    },
  ) => {
    const { message, ...rest } = data;
    const toasterId = data?.toasterId;

    const existingId =
      typeof data?.id === 'number' || (typeof data?.id === 'string' && data.id.length > 0) ? data.id : undefined;

    const systemConfig = this.getSystemConfig(toasterId);
    const dedupeKey = (rest as ExternalToast).dedupeKey;
    const shouldDedupe =
      this.isDedupeEnabled(systemConfig) && typeof dedupeKey === 'string' && dedupeKey.length > 0;

    // If user provided an explicit id, always respect it.
    // Otherwise, when system dedupe is enabled, map dedupeKey -> stable internal id.
    const id =
      existingId ??
      (shouldDedupe
        ? `__dedupe:${toasterId ?? 'global'}:${dedupeKey}`
        : toastsCounter++);
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id;
    });
    const dismissible = data.dismissible === undefined ? true : data.dismissible;

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id);
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message });
          return {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message,
          };
        }

        return toast;
      });
    } else {
      this.addToast({ title: message, ...rest, dismissible, id });
    }

    return id;
  };

  dismiss = (id?: number | string, reason?: ToastCloseReason) => {
    if (id) {
      this.dismissedToasts.add(id);
      requestAnimationFrame(() =>
        this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true, reason } as ToastToDismiss)),
      );
    } else {
      this.toasts.forEach((toast) => {
        this.dismissedToasts.add(toast.id);
        this.subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true, reason } as ToastToDismiss));
      });
    }

    return id;
  };

  message = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message });
  };

  error = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'error' });
  };

  success = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message });
  };

  info = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message });
  };

  warning = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message });
  };

  loading = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message });
  };

  promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
    if (!data) {
      // Nothing to show
      return;
    }

    let id: string | number | undefined = undefined;
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        promise,
        type: 'loading',
        message: data.loading,
        description: typeof data.description !== 'function' ? data.description : undefined,
      });
    }

    const p = Promise.resolve(promise instanceof Function ? promise() : promise);

    let shouldDismiss = id !== undefined;
    let result: ['resolve', ToastData] | ['reject', unknown];

    const originalPromise = p
      .then(async (response) => {
        result = ['resolve', response];
        const isReactElementResponse = React.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({ id, type: 'default', message: response });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;

          const promiseData =
            typeof data.error === 'function' ? await data.error(`HTTP error! status: ${response.status}`) : data.error;

          const description =
            typeof data.description === 'function'
              ? await data.description(`HTTP error! status: ${response.status}`)
              : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (response instanceof Error) {
          shouldDismiss = false;

          const promiseData = typeof data.error === 'function' ? await data.error(response) : data.error;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (data.success !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.success === 'function' ? await data.success(response) : data.success;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'success', description, ...toastSettings });
        }
      })
      .catch(async (error) => {
        result = ['reject', error];
        if (data.error !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.error === 'function' ? await data.error(error) : data.error;

          const description = typeof data.description === 'function' ? await data.description(error) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          // Toast is still in load state (and will be indefinitely — dismiss it)
          this.dismiss(id);
          id = undefined;
        }

        data.finally?.();
      });

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) =>
        originalPromise.then(() => (result[0] === 'reject' ? reject(result[1]) : resolve(result[1]))).catch(reject),
      );

    if (typeof id !== 'string' && typeof id !== 'number') {
      // cannot Object.assign on undefined
      return { unwrap };
    } else {
      return Object.assign(id, { unwrap });
    }
  };

  custom = (jsx: (id: number | string) => React.ReactElement, data?: ExternalToast) => {
    const id = data?.id || toastsCounter++;
    this.create({ jsx: jsx(id), ...data, id });
    return id;
  };

  getActiveToasts = () => {
    return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
  };
}

// Ensure a single shared ToastState instance across potential ESM/CJS duplication.
// This prevents a common monorepo/bundler issue where `toast()` and `<Toaster />`
// end up subscribing to different module instances.
const TOAST_STATE_KEY = '__web_haptics_toast_state__';
const getToastState = () => {
  // Avoid leaking across SSR requests: only singleton on the client.
  if (typeof window === 'undefined') return new Observer();

  const globalAny = globalThis as unknown as Record<string, any>;
  if (!globalAny[TOAST_STATE_KEY]) {
    globalAny[TOAST_STATE_KEY] = new Observer();
  }

  return globalAny[TOAST_STATE_KEY] as Observer;
};

export const ToastState = getToastState();

// bind this to the toast function
const toastFunction = (message: titleT, data?: ExternalToast) => {
  // Route through `create` so plain `toast()` calls get the same handling as
  // the typed helpers: dedupe ids, explicit-id updates (no duplicate history
  // rows), and cleanup of previously dismissed ids.
  return ToastState.create({ message, ...data });
};

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === 'object' &&
    'ok' in data &&
    typeof data.ok === 'boolean' &&
    'status' in data &&
    typeof data.status === 'number'
  );
};

const basicToast = toastFunction;

const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(
  basicToast,
  {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading,
  },
  { getHistory, getToasts },
);

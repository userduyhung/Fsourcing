type LoaderEventDetail = { loading: boolean; count: number };

let counter = 0;
const EVENT_NAME = 'global-loader';

function emit() {
  const ev = new CustomEvent<LoaderEventDetail>(EVENT_NAME, { detail: { loading: counter > 0, count: counter } });
  window.dispatchEvent(ev as Event);
}

export const loader = {
  show() {
    counter = Math.max(0, counter) + 1;
    emit();
  },
  hide() {
    counter = Math.max(0, counter - 1);
    emit();
  },
  reset() {
    counter = 0;
    emit();
  },
  isLoading() {
    return counter > 0;
  },
  EVENT_NAME,
};

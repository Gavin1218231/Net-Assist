import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches failures inside a lazily-loaded route. The most common one is a stale
// chunk: after a redeploy, the hashed JS file a still-open tab tries to import
// no longer exists, so `import()` rejects with "Failed to fetch dynamically
// imported module". Suspense only handles the pending state, not a rejection —
// without this boundary that rejection unmounts the whole tree to a blank page.
export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private isChunkLoadError(error: Error): boolean {
    return /dynamically imported module|Loading chunk|Importing a module script failed/i.test(
      error.message,
    );
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkError = this.isChunkLoadError(error);
    return (
      <div className="max-w-md mx-auto mt-16 p-6 text-center">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          {chunkError ? 'This page needs to reload' : 'Something went wrong'}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {chunkError
            ? 'A newer version of the app is available. Reload to get the latest.'
            : 'This section failed to load. You can try again.'}
        </p>
        <button
          onClick={() => {
            if (chunkError) {
              window.location.reload();
            } else {
              this.setState({ error: null });
            }
          }}
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition"
        >
          {chunkError ? 'Reload' : 'Try again'}
        </button>
      </div>
    );
  }
}

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-[#000F08] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900/50 border border-rose-500/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 mx-auto mb-4 flex items-center justify-center text-3xl">
          ⛔
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Account suspended</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Your account has been temporarily suspended. Please contact support at{' '}
          <a href="mailto:hello@jetblog.app" className="text-[#FB3640] hover:underline">
            hello@jetblog.app
          </a>{' '}
          to resolve the issue.
        </p>
      </div>
    </div>
  );
}

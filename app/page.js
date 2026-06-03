export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
          🚀 BETA · Знайди свою наступну вірусну тему
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
          YouTube Viral Finder
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Знаходить аномально популярні відео та малі канали-вистріли в обраній ніші.
          Працює на твоєму YouTube API key.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/search" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all text-center">
            Почати пошук
          </a>
          <button className="px-8 py-3 bg-[#1A1A24] hover:bg-[#252535] border border-[#2A2A38] rounded-lg font-medium transition-all">
            Як це працює
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <FeatureCard
            icon="🔥"
            title="Viral Score"
            description="Розумна метрика, що поєднує швидкість, аутрич та залученість"
          />
          <FeatureCard
            icon="💎"
            title="Малі канали"
            description="Знаходь канали-вистріли з малою аудиторією для копіювання формули"
          />
          <FeatureCard
            icon="📊"
            title="Пакетний пошук"
            description="Кілька запитів одночасно, одна таблиця результатів"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl p-6 hover:border-purple-500/40 transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

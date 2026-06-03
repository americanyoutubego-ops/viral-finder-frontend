"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://viral-finder-api.onrender.com";

export default function SearchPage() {
  const [apiKey, setApiKey] = useState("");
  const [queries, setQueries] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  async function handleSearch() {
    setError("");
    setResults(null);

    if (!apiKey.trim()) {
      setError("Встав YouTube API key");
      return;
    }

    const queryList = queries.split("\n").map(q => q.trim()).filter(Boolean);
    if (queryList.length === 0) {
      setError("Введи хоча б один пошуковий запит");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          queries: queryList,
          target: "video",
          region: "UA",
          days: 90,
          max_per_query: 25,
          min_views: 1000,
          weight_velocity: 0.5,
          weight_outreach: 0.35,
          weight_engagement: 0.15,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Помилка ${res.status}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError(`Помилка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <a href="/" className="text-purple-400 hover:text-purple-300 text-sm">
          ← На головну
        </a>
        <h1 className="text-3xl font-bold mt-3 mb-2">🚀 Пошук вірусних відео</h1>
        <p className="text-gray-400">
          Введи свій YouTube API key і пошукові запити. Один запит на рядок.
        </p>
      </div>

      <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          YouTube API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full px-4 py-3 bg-[#0F0F14] border border-[#2A2A38] rounded-lg focus:border-purple-500 focus:outline-none text-white"
        />

        <label className="block text-sm font-medium text-gray-300 mb-2 mt-5">
          Пошукові запити (кожен з нового рядка)
        </label>
        <textarea
          value={queries}
          onChange={e => setQueries(e.target.value)}
          placeholder={"AI agents\nAI agents tutorial\nbest AI agents 2026"}
          rows={5}
          className="w-full px-4 py-3 bg-[#0F0F14] border border-[#2A2A38] rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full mt-5 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Шукаю..." : "🚀 Знайти вірусне"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse text-gray-400">
            Запит до YouTube API... Перший раз може бути 30-60 сек (сервер прокидається)
          </div>
        </div>
      )}

      {results && results.total > 0 && (
        <div>
          <div className="mb-4 text-gray-400">
            Знайдено <span className="text-white font-semibold">{results.total}</span> відео
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.videos.slice(0, 30).map(video => (
              <VideoCard key={video.video_id} video={video} />
            ))}
          </div>
        </div>
      )}

      {results && results.total === 0 && (
        <div className="text-center py-12 text-gray-400">
          Нічого не знайдено. Спробуй інші запити або послаб фільтри.
        </div>
      )}
    </main>
  );
}

function VideoCard({ video }) {
  const badgeColors = {
    "VIRAL":  "from-red-500 to-orange-500",
    "GEM":    "from-cyan-400 to-purple-500",
    "FAST":   "from-green-400 to-cyan-400",
    "RISING": "from-purple-500 to-indigo-500",
  };

  const formatNum = n => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl overflow-hidden hover:border-purple-500/50 transition-all">
      <div className="relative aspect-video bg-black">
        {video.thumbnail && (
          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
        )}
        {video.badge && (
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded text-xs font-bold text-white bg-gradient-to-br ${badgeColors[video.badge] || "from-gray-500 to-gray-700"}`}>
            {video.badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {video.title}
        </h3>
        <div className="text-xs text-gray-400 mb-3">
          📺 {video.channel} · {formatNum(video.subscribers)} subs
        </div>
        <div className="grid grid-cols-3 gap-2 text-center border-t border-[#2A2A38] pt-3 mb-3">
          <div>
            <div className="text-sm font-bold">{formatNum(video.views)}</div>
            <div className="text-[10px] text-gray-500 uppercase">views</div>
          </div>
          <div>
            <div className="text-sm font-bold text-green-400">{video.outreach.toFixed(0)}×</div>
            <div className="text-[10px] text-gray-500 uppercase">outreach</div>
          </div>
          <div>
            <div className="text-sm font-bold">{video.age_days.toFixed(0)}d</div>
            <div className="text-[10px] text-gray-500 uppercase">age</div>
          </div>
        </div>
        <div className="h-1 bg-[#2A2A38] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-red-500"
            style={{ width: `${video.viral_score * 100}%` }}
          />
        </div>
        <a
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-2 bg-[#252535] hover:bg-[#2A2A38] rounded-md text-sm transition-colors"
        >
          ▶ Дивитись на YouTube
        </a>
      </div>
    </div>
  );
}
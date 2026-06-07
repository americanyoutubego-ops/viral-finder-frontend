"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://viral-finder-api.onrender.com";

const LANG_OPTIONS = [
  { value: "", label: "Будь-яка" },
  { value: "uk", label: "Українська" },
  { value: "en", label: "Англійська" },
  { value: "ru", label: "Російська" },
  { value: "es", label: "Іспанська" },
  { value: "de", label: "Німецька" },
  { value: "fr", label: "Французька" },
  { value: "pt", label: "Португальська" },
  { value: "tr", label: "Турецька" },
];

const DURATION_OPTIONS = [
  { value: "", label: "Будь-яка" },
  { value: "short", label: "Короткі (до 4 хв)" },
  { value: "medium", label: "Середні (4-20 хв)" },
  { value: "long", label: "Довгі (20+ хв)" },
];

const TARGET_OPTIONS = [
  { value: "all", label: "Усе разом" },
  { value: "video", label: "Звичайні відео" },
  { value: "shorts", label: "Shorts" },
];

export default function SearchPage() {
  // Поля форми
  const [apiKey, setApiKey] = useState("");
  const [queries, setQueries] = useState("");

  // Налаштування пошуку
  const [target, setTarget] = useState("video");
  const [region, setRegion] = useState("UA");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");
  const [days, setDays] = useState(90);
  const [maxPerQuery, setMaxPerQuery] = useState(25);

  // Фільтр малих каналів
  const [maxSubs, setMaxSubs] = useState(0);
  const [maxChannelVideos, setMaxChannelVideos] = useState(0);
  const [minViews, setMinViews] = useState(1000);

  // Ваги score
  const [weightVelocity, setWeightVelocity] = useState(0.5);
  const [weightOutreach, setWeightOutreach] = useState(0.35);
  const [weightEngagement, setWeightEngagement] = useState(0.15);

  // Стани відповіді
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  async function handleGenerate() {
    setError("");
    const baseKeyword = queries.split("\n")[0]?.trim();
    if (!baseKeyword) {
      setError("Введи першим рядком базову тему для генерації");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/generate-queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: baseKeyword,
          count: 20,
          language: language || "en",
        }),
      });
      if (!res.ok) throw new Error(`Помилка ${res.status}`);
      const data = await res.json();
      setQueries(data.queries.join("\n"));
    } catch (e) {
      setError(`Помилка генерації: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

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
          target,
          region,
          language: language || null,
          duration: duration || null,
          days,
          max_per_query: maxPerQuery,
          min_views: minViews,
          max_subs: maxSubs,
          max_channel_videos: maxChannelVideos,
          weight_velocity: weightVelocity,
          weight_outreach: weightOutreach,
          weight_engagement: weightEngagement,
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
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Сайдбар */}
      <aside className="lg:w-80 lg:min-h-screen bg-[#0A0A10] border-r border-[#2A2A38] p-6 lg:overflow-y-auto">
        <a href="/" className="text-purple-400 hover:text-purple-300 text-sm block mb-6">
          ← На головну
        </a>

        <h2 className="text-lg font-bold mb-1">⚙️ Налаштування</h2>
        <p className="text-xs text-gray-500 mb-6">Усі фільтри застосовуються при пошуку</p>

        {/* Налаштування пошуку */}
        <Section title="🎯 Тип контенту">
          <Select value={target} onChange={setTarget} options={TARGET_OPTIONS} />
        </Section>

        <Section title="🌍 Мова відео">
          <Select value={language} onChange={setLanguage} options={LANG_OPTIONS} />
        </Section>

        <Section title="📍 Регіон">
          <input
            type="text"
            value={region}
            onChange={e => setRegion(e.target.value.toUpperCase())}
            maxLength={2}
            className="w-full px-3 py-2 bg-[#1A1A24] border border-[#2A2A38] rounded-md focus:border-purple-500 focus:outline-none text-sm"
          />
          <p className="text-[10px] text-gray-500 mt-1">2 літери: UA, US, PL, DE...</p>
        </Section>

        <Section title="⏱️ Тривалість">
          <Select value={duration} onChange={setDuration} options={DURATION_OPTIONS} />
        </Section>

        <Section title={`📅 Свіжість: ${days === 0 ? "без обмежень" : days + " дн"}`}>
          <input
            type="range"
            min={0}
            max={365}
            step={5}
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </Section>

        <Section title={`📊 Результатів на запит: ${maxPerQuery}`}>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={maxPerQuery}
            onChange={e => setMaxPerQuery(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <p className="text-[10px] text-gray-500 mt-1">1 запит = 100 одиниць квоти YouTube</p>
        </Section>

        <div className="border-t border-[#2A2A38] my-6"></div>

        <h3 className="text-sm font-semibold mb-2">🔬 Фільтр &laquo;малі канали&raquo;</h3>
        <p className="text-[11px] text-gray-500 mb-4">Знайди канали з малою аудиторією, що вистрелили</p>

        <Section title="Макс. підписників (0 = без обмежень)">
          <input
            type="number"
            value={maxSubs}
            onChange={e => setMaxSubs(Number(e.target.value) || 0)}
            min={0}
            step={1000}
            className="w-full px-3 py-2 bg-[#1A1A24] border border-[#2A2A38] rounded-md focus:border-purple-500 focus:outline-none text-sm"
          />
        </Section>

        <Section title="Макс. відео на каналі (0 = без обмежень)">
          <input
            type="number"
            value={maxChannelVideos}
            onChange={e => setMaxChannelVideos(Number(e.target.value) || 0)}
            min={0}
            step={10}
            className="w-full px-3 py-2 bg-[#1A1A24] border border-[#2A2A38] rounded-md focus:border-purple-500 focus:outline-none text-sm"
          />
        </Section>

        <Section title="Мін. переглядів відео">
          <input
            type="number"
            value={minViews}
            onChange={e => setMinViews(Number(e.target.value) || 0)}
            min={0}
            step={500}
            className="w-full px-3 py-2 bg-[#1A1A24] border border-[#2A2A38] rounded-md focus:border-purple-500 focus:outline-none text-sm"
          />
        </Section>

        <div className="border-t border-[#2A2A38] my-6"></div>

        <h3 className="text-sm font-semibold mb-2">🧮 Ваги viral score</h3>
        <p className="text-[11px] text-gray-500 mb-4">Як рахувати «вірусність»</p>

        <Section title={`Швидкість: ${weightVelocity.toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={weightVelocity}
            onChange={e => setWeightVelocity(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <p className="text-[10px] text-gray-500 mt-1">Views / день з моменту публікації</p>
        </Section>

        <Section title={`Аутрич: ${weightOutreach.toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={weightOutreach}
            onChange={e => setWeightOutreach(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <p className="text-[10px] text-gray-500 mt-1">Views / підписників каналу</p>
        </Section>

        <Section title={`Залученість: ${weightEngagement.toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={weightEngagement}
            onChange={e => setWeightEngagement(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <p className="text-[10px] text-gray-500 mt-1">(Лайки + комент) / переглядів</p>
        </Section>
      </aside>

      {/* Основна частина */}
      <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">🚀 Пошук вірусних відео</h1>
        <p className="text-gray-400 mb-6">
          Встав свій YouTube API key і пошукові запити. Один запит на рядок.
        </p>

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

          <div className="flex items-center justify-between mt-5 mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Пошукові запити (кожен з нового рядка)
            </label>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-md transition-all disabled:opacity-50"
            >
              {generating ? "Генерую..." : "✨ Згенерувати 20 запитів"}
            </button>
          </div>
          <textarea
            value={queries}
            onChange={e => setQueries(e.target.value)}
            placeholder={"AI agents\nAI agents tutorial\nbest AI agents 2026"}
            rows={6}
            className="w-full px-4 py-3 bg-[#0F0F14] border border-[#2A2A38] rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Підказка: введи одне базове слово, натисни &laquo;Згенерувати&raquo; — отримаєш 20 варіацій
          </p>

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
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-400">
                Знайдено <span className="text-white font-semibold">{results.total}</span> відео
              </div>
              {results.videos[0] && (
                <div className="text-xs text-gray-500">
                  Топ score: <span className="text-purple-400 font-semibold">{results.videos[0].viral_score.toFixed(3)}</span>
                  {" · "}
                  Макс. аутрич: <span className="text-green-400 font-semibold">{Math.max(...results.videos.map(v => v.outreach)).toFixed(0)}×</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-gray-400 mb-2">{title}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-[#1A1A24] border border-[#2A2A38] rounded-md focus:border-purple-500 focus:outline-none text-sm cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function VideoCard({ video }) {
  const badgeColors = {
    "VIRAL":  "from-red-500 to-orange-500",
    "GEM":    "from-cyan-400 to-purple-500",
    "FAST":   "from-green-400 to-cyan-400",
    "RISING": "from-purple-500 to-indigo-500",
  };

  const badgeEmoji = {
    "VIRAL":  "🔥",
    "GEM":    "💎",
    "FAST":   "🚀",
    "RISING": "📈",
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
            {badgeEmoji[video.badge]} {video.badge}
          </div>
        )}
        {video.is_short && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">
            SHORTS
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

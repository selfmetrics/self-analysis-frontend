import { useCallback, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function EpisodeList({
  // エピソード一覧
  episodes = [],

  // 月検索の値
  selectedMonth,
  setSelectedMonth,

  // ボタンを押した時に実行する処理
  onNew,
  onDetail,
  onEdit,
  onDelete,
  onInterviewQuestions,
}) {
  const [chartRange, setChartRange] = useState("month");

  // 日付を YYYY-MM-DD の形に整える
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return String(date).slice(0, 10);
  };

  // エピソードの日付を取得する
  const getEpisodeDate = (episode) => {
    return episode.date ?? episode.eventDate ?? "";
  };

  // バックエンドの感情指数を取得する
  const getEmotionScore = (episode) => {
    const score =
      episode.emotionIntensity ??
      episode.emotionScore ??
      episode.emotionIndex ??
      episode.sentimentScore;

    const numberScore = Number(score);

    return Number.isFinite(numberScore) ? numberScore : null;
  };

  const isPositiveEmotion = useCallback((episode) => {
    return ["happy", "positive", "joy", "good", "excited"].includes(
      episode.emotion
    );
  }, []);

  const isNegativeEmotion = useCallback((episode) => {
    return [
      "sad",
      "negative",
      "angry",
      "bad",
      "anxious",
      "anxiety",
      "fear",
      "scared",
      "stress",
      "tired",
    ].includes(episode.emotion);
  }, []);

  const getSignedEmotionScore = useCallback((episode, score) => {
    if (score < 0) {
      return score;
    }

    if (isNegativeEmotion(episode)) {
      return -Math.abs(score);
    }

    if (isPositiveEmotion(episode)) {
      return Math.abs(score);
    }

    return score;
  }, [isNegativeEmotion, isPositiveEmotion]);

  const chartData = useMemo(() => {
    if (!Array.isArray(episodes) || episodes.length === 0) {
      return [];
    }

    const validEpisodes = episodes
      .map((episode) => ({
        episode,
        date: formatDate(getEpisodeDate(episode)),
        score: getEmotionScore(episode),
      }))
      .filter(({ date, score }) => {
        return date && score !== null && !Number.isNaN(new Date(date).getTime());
      });

    if (validEpisodes.length === 0) {
      return [];
    }

    const latestDate = validEpisodes.reduce((latest, item) => {
      const itemDate = new Date(item.date);
      return itemDate > latest ? itemDate : latest;
    }, new Date(validEpisodes[0].date));

    const rangeStart = new Date(latestDate);

    if (chartRange === "week") {
      rangeStart.setDate(rangeStart.getDate() - 6);
    } else {
      rangeStart.setMonth(rangeStart.getMonth() - 1);
    }

    const groupedByDate = validEpisodes.reduce((result, item) => {
      const episodeDate = new Date(item.date);

      if (episodeDate < rangeStart || episodeDate > latestDate) {
        return result;
      }

      if (!result[item.date]) {
        result[item.date] = {
          date: item.date,
          total: 0,
          count: 0,
        };
      }

      result[item.date].total += getSignedEmotionScore(
        item.episode,
        item.score
      );
      result[item.date].count += 1;

      return result;
    }, {});

    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        date: item.date.slice(5).replace("-", "/"),
        score: Number((item.total / item.count).toFixed(1)),
        count: item.count,
      }));
  }, [episodes, chartRange, getSignedEmotionScore]);

  const formatEmotionTooltip = (value) => {
    if (value > 0) {
      return [`+${value} 明るい気分`, "感情スコア"];
    }

    if (value < 0) {
      return [`${value} 落ち込み気味`, "感情スコア"];
    }

    return ["0 ふつう", "感情スコア"];
  };

  return (
    <div>
      <h1>自己分析ノート</h1>

      {/* 面接質問管理画面へ移動するボタン */}
      <button onClick={onInterviewQuestions}>
        面接質問管理へ
      </button>

      {/* 新規エピソード作成ボタン */}
      <button onClick={onNew}>
        新規エピソード
      </button>

      <h1>エピソード一覧</h1>

      {/* 月でエピソードを検索する部分 */}
      <div>
        <label htmlFor="episode-month">月で検索</label>
        <input
          id="episode-month"
          type="month"
          value={selectedMonth ?? ""}
          onChange={(event) => setSelectedMonth(event.target.value)}
        />

        {/* 月検索を解除するボタン */}
        <button type="button" onClick={() => setSelectedMonth("")}>
          解除
        </button>
      </div>

      <section style={{ marginTop: "24px", marginBottom: "32px" }}>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0 }}>感情の推移</h2>
          <div>
            <button
              type="button"
              onClick={() => setChartRange("week")}
              aria-pressed={chartRange === "week"}
            >
              週
            </button>
            <button
              type="button"
              onClick={() => setChartRange("month")}
              aria-pressed={chartRange === "month"}
            >
              月
            </button>
          </div>
        </div>

        <div style={{ height: "280px", width: "100%" }}>
          {chartData.length === 0 ? (
            <p>グラフに表示できる感情指数がありません</p>
          ) : (
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-10, 10]} ticks={[-10, -5, 0, 5, 10]} />
                <ReferenceLine
                  y={0}
                  stroke="#6b7280"
                  strokeDasharray="4 4"
                  label="ふつう"
                />
                <Tooltip formatter={formatEmotionTooltip} />
                <Legend />
                <Line
                  type="natural"
                  dataKey="score"
                  name="感情スコア（波線）"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    fill: "#ffffff",
                    r: 5,
                    stroke: "#2563eb",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    fill: "#2563eb",
                    r: 7,
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* episodes が配列でない場合 */}
      {!Array.isArray(episodes) ? (
        <p>エピソードを取得できませんでした</p>

      // エピソードが0件の場合
      ) : episodes.length === 0 ? (
        <p>エピソードがありません</p>

      // エピソードがある場合
      ) : (
        [...episodes]
          // 日付が新しい順に並べる
          .sort((a, b) => new Date(getEpisodeDate(b)) - new Date(getEpisodeDate(a)))

          // エピソードを1件ずつ表示する
          .map((episode) => (
            <div key={episode.id}>
              {/* タイトルをクリックすると詳細画面へ移動 */}
              <h3 onClick={() => onDetail(episode)}>
                {episode.emotion === "happy" ? "😊" : "😢"}
                {episode.emotionIntensity}
                <br />
                {episode.title}
              </h3>

              {/* エピソードの日付 */}
              <p>{formatDate(getEpisodeDate(episode))}</p>

              {/* 編集ボタン */}
              <button onClick={() => onEdit(episode)}>
                編集
              </button>

              {/* 削除ボタン */}
              <button onClick={() => onDelete(episode.id)}>
                削除
              </button>
            </div>
          ))
      )}
    </div>
  );
}

export default EpisodeList;

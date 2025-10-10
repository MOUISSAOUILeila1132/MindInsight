
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Legend,
  Brush,
} from "recharts";
import { useState } from "react";
import { ZoomOut, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AnalysisData {
  username: string;
  tweets_analyzed: number;
  overall_summary: { [key: string]: number };
  predictions: Array<{
    id: number;
    text: string;
    created_at: string;
    likes: number;
    retweets: number;
    predicted_state: string;
    probabilities: { [key: string]: number };
  }>;
}

const COLORS = ["#4CAF50", "#FFC107", "#F44336", "#2196F3"];
const EMOTIONAL_STATES = {
  "positive": "Positif",
  "negative": "Négatif",
  "neutral": "Neutre",
  "anxiety": "Anxiété"
};

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisData = location.state?.analysisData as AnalysisData;
  const patientName = location.state?.patientName;
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{
    x: [number, number];
    y: [number, number];
  } | null>(null);

  if (!analysisData) {
    return <Navigate to="/" replace />;
  }

  const overallSummaryData = Object.entries(analysisData.overall_summary).map(
    ([name, value]) => ({
      name,
      value,
      label: EMOTIONAL_STATES[name as keyof typeof EMOTIONAL_STATES] || name,
    })
  );

  const timelineData = analysisData.predictions
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((pred, index) => {
      const date = new Date(pred.created_at);
      return {
        index,
        date: date.toLocaleDateString(),
        timestamp: date.getTime(),
        formattedDate: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
        sentiment: pred.probabilities["positive"] || 0,
        anxiety: pred.probabilities["anxiety"] || 0,
        negative: pred.probabilities["negative"] || 0,
        neutral: pred.probabilities["neutral"] || 0,
        state: pred.predicted_state,
        text: pred.text,
        likes: pred.likes,
        retweets: pred.retweets,
      };
    });

  const avgSentiment = timelineData.reduce((sum, item) => sum + item.sentiment, 0) / timelineData.length;

  const resetZoom = () => {
    setZoomDomain(null);
  };

  const tooltipFormatter = (value: number, name: string) => {
    const emotionalState = EMOTIONAL_STATES[name as keyof typeof EMOTIONAL_STATES];
    return [`${(value * 100).toFixed(1)}%`, emotionalState || name];
  };

  const handleMouseMove = (data: any) => {
    if (data && data.activeTooltipIndex !== undefined) {
      setActiveTooltipIndex(data.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltipIndex(null);
  };

  return (
    <div className="min-h-screen therapy-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-[#2E7D32] mb-8 text-center">
          {patientName ? `Analyse de ${patientName}` : `Analyse du profil @${analysisData.username}`}
        </h1>

        {patientName && (
          <h2 className="text-xl text-center text-gray-600 mb-6">
            Profil Twitter: @{analysisData.username}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="calm-overlay border border-blue-100/20">
            <CardHeader>
              <CardTitle>Distribution des États Émotionnels</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallSummaryData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {overallSummaryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="calm-overlay border border-blue-100/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Évolution du Sentiment</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={resetZoom}
                  disabled={!zoomDomain}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={timelineData}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    allowDataOverflow={true}
                    domain={zoomDomain ? zoomDomain.x : ['auto', 'auto']}
                  />
                  <YAxis 
                    domain={[0, 1]} 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    allowDataOverflow={true}
                  />
                  <Tooltip 
                    formatter={tooltipFormatter}
                    labelFormatter={(label) => {
                      const dataPoint = timelineData.find(item => item.date === label);
                      return dataPoint ? dataPoint.formattedDate : label;
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataPoint = timelineData.find(item => item.date === label);
                        return (
                          <div className="bg-white/95 p-3 border border-gray-200 rounded shadow-md">
                            <p className="font-semibold">{dataPoint?.formattedDate}</p>
                            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">{dataPoint?.text}</p>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex justify-between gap-4 text-sm">
                                <span style={{ color: entry.color }}>
                                  {EMOTIONAL_STATES[entry.name as keyof typeof EMOTIONAL_STATES] || entry.name}:
                                </span>
                                <span className="font-mono">{(Number(entry.value) * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs text-gray-500 mt-2 pt-1 border-t">
                              <span>Likes: {dataPoint?.likes}</span>
                              <span>Retweets: {dataPoint?.retweets}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={avgSentiment} label="Moyenne" stroke="#2E7D32" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    name="positive"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6, stroke: "#2E7D32" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="anxiety"
                    name="anxiety"
                    stroke="#F44336"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    name="negative"
                    stroke="#FFC107"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#4CAF50"
                    startIndex={0}
                    endIndex={timelineData.length > 5 ? 5 : timelineData.length - 1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 calm-overlay border border-blue-100/20">
            <CardHeader>
              <CardTitle>Tweets Analysés ({analysisData.tweets_analyzed})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.predictions.map((tweet, index) => {
                  const isHighlighted = index === activeTooltipIndex;
                  const sentimentScore = tweet.probabilities["positive"] || 0;
                  const sentimentColor = `rgba(${Math.round(255 * (1 - sentimentScore))}, ${Math.round(255 * sentimentScore)}, 0, 0.15)`;
                  
                  return (
                    <div
                      key={tweet.id}
                      className={`p-4 rounded-lg border transition-all duration-300 ${
                        isHighlighted 
                          ? 'border-[#4CAF50] shadow-md bg-[#F5FFF5]' 
                          : 'border-gray-200 hover:border-[#4CAF50]'
                      }`}
                      style={{ backgroundColor: isHighlighted ? sentimentColor : undefined }}
                    >
                      <p className="text-gray-800 mb-2">{tweet.text}</p>
                      <div className="flex flex-wrap justify-between text-sm text-gray-500">
                        <span className="font-medium">
                          État prédit: <span className="text-[#4CAF50]">{
                            EMOTIONAL_STATES[tweet.predicted_state as keyof typeof EMOTIONAL_STATES] || tweet.predicted_state
                          }</span>
                        </span>
                        <span className="flex gap-4">
                          <span>❤️ {tweet.likes}</span>
                          <span>🔄 {tweet.retweets}</span>
                          <span>{new Date(tweet.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                      
                      <div className="mt-3 h-1.5 w-full bg-gray-200 rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all"
                          style={{ width: `${sentimentScore * 100}%` }}
                        />
                      </div>
                      
                      <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                        {Object.entries(tweet.probabilities).map(([state, value]) => (
                          <div key={state} className="flex flex-col">
                            <span className="text-gray-500">{
                              EMOTIONAL_STATES[state as keyof typeof EMOTIONAL_STATES] || state
                            }</span>
                            <span className="font-mono font-medium">{(value * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

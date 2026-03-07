
import { Lesson, Hit } from '../types';

export const searchLessons = (query: string, lessons: Lesson[], topK: number = 5): Hit[] => {
  const terms = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  
  const out: Hit[] = [];
  for (const lesson of lessons) {
      const text = (lesson.content || "").replace(/<[^>]+>/g, " ").toLowerCase();
      let score = 0;
      terms.forEach(t => {
        if (text.includes(t)) score += 1;
        if (lesson.title.toLowerCase().includes(t)) score += 2;
      });
      if (score > 0) out.push({ lesson, score });
  }
  
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, topK);
};

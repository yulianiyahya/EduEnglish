import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeneratedVocab {
  word: string;
  phonetic: string;
  example: string;
  answer: string;
  choices: string[];
}

export interface GeneratedGame {
  indo: string;
  eng: string;
  hint: string;
}

export interface GeneratedSentence {
  english: string;
  indonesian: string;
  pronunciation: string;
  category: string;
  words: { word: string; meaning: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  // ✅ Groq API — Free tier: 30 RPM, 14.400 RPD, tanpa billing
  // Daftar di: https://console.groq.com → Create API Key
  private apiKey = '';
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model  = 'llama-3.1-8b-instant';

  constructor(private http: HttpClient) {}

  // ─── Core HTTP call ke Groq ───────────────────────────────────
  private callGroq(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {
      model: this.model,
      messages: [
        {
          role: 'system',
          // ✅ System prompt yang lebih tegas agar tidak ada teks tambahan
          content: 'You are a JSON generator. You MUST return ONLY a valid JSON array. No explanations, no markdown, no code blocks, no text before or after the JSON array. Start your response directly with [ and end with ].'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,   // ✅ Turunkan temperature agar output lebih konsisten
      max_tokens: 2048
    };

    return this.http.post(this.apiUrl, body, { headers });
  }

  // ─── Helper: Ekstrak JSON array dari response ─────────────────
  // ✅ FIX: Parser yang lebih robust — bisa handle jika AI tetap
  //    menambahkan markdown walaupun sudah diperintahkan tidak
  private extractJsonArray(raw: string): any[] {
    // Hapus markdown code block jika ada
    let cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // Cari posisi [ pertama dan ] terakhir
    const start = cleaned.indexOf('[');
    const end   = cleaned.lastIndexOf(']');

    if (start === -1 || end === -1 || end < start) {
      throw new SyntaxError(`Tidak ditemukan JSON array dalam response. Raw: ${raw.substring(0, 200)}`);
    }

    const jsonStr = cleaned.substring(start, end + 1);
    return JSON.parse(jsonStr);
  }

  // ─── Helper: Ambil text dari response Groq ────────────────────
  private getTextFromResponse(res: any): string {
    if (!res?.choices?.[0]?.message?.content) {
      throw new Error('Response Groq tidak memiliki field choices[0].message.content');
    }
    return res.choices[0].message.content.trim();
  }

  // ─── Generate 5 soal kosakata ────────────────────────────────
  generateVocabQuestions(topic?: string): Observable<GeneratedVocab[]> {
    const topicText = topic?.trim() ? ` about the topic "${topic.trim()}"` : '';
    const prompt =
`Generate 5 English vocabulary quiz questions for beginners${topicText}.
Return ONLY this JSON array, nothing else:
[
  {
    "word": "ENGLISH_WORD_UPPERCASE",
    "phonetic": "/pronunciation/",
    "example": "Short example sentence.",
    "answer": "Indonesian translation",
    "choices": ["correct_answer", "wrong1", "wrong2", "wrong3"]
  }
]
Rules:
- "choices" must contain exactly 4 items
- "answer" must exactly match one item in "choices"
- All choices must be in Indonesian
- Start response with [ immediately`;

    return new Observable(observer => {
      this.callGroq(prompt).subscribe({
        next: (res: any) => {
          try {
            const text = this.getTextFromResponse(res);
            console.log('[GroqService] Raw vocab response:', text.substring(0, 300));
            const questions: GeneratedVocab[] = this.extractJsonArray(text);

            // ✅ Validasi struktur setiap item
            const valid = questions.filter(q =>
              q.word && q.phonetic && q.example && q.answer &&
              Array.isArray(q.choices) && q.choices.length === 4 &&
              q.choices.includes(q.answer)
            );

            if (!valid.length) {
              throw new Error('Tidak ada soal vocab valid setelah validasi');
            }

            console.log('[GroqService] Vocab valid:', valid.length, '/', questions.length);
            observer.next(valid);
            observer.complete();
          } catch (err) {
            console.error('[GroqService] Parse error (vocab):', err);
            observer.error(err);
          }
        },
        error: (err) => {
          console.error('[GroqService] HTTP error (vocab):', err.status, err.error);
          observer.error(err);
        }
      });
    });
  }

  // ─── Generate 5 kata untuk game ──────────────────────────────
  generateGameWords(topic?: string): Observable<GeneratedGame[]> {
    const topicText = topic?.trim() ? ` about "${topic.trim()}"` : '';
    const prompt =
`Generate 5 English words for a word-guessing game${topicText}.
Return ONLY this JSON array, nothing else:
[
  {
    "indo": "Indonesian meaning",
    "eng": "ENGLISH_WORD_UPPERCASE",
    "hint": "short hint in Indonesian"
  }
]
Rules:
- "eng" must be uppercase
- "hint" should mention the number of letters, e.g. "5 huruf, ..."
- Start response with [ immediately`;

    return new Observable(observer => {
      this.callGroq(prompt).subscribe({
        next: (res: any) => {
          try {
            const text = this.getTextFromResponse(res);
            console.log('[GroqService] Raw game response:', text.substring(0, 300));
            const games: GeneratedGame[] = this.extractJsonArray(text);

            // ✅ Validasi struktur setiap item
            const valid = games.filter(g =>
              g.indo && g.eng && g.hint &&
              g.eng === g.eng.toUpperCase()
            );

            if (!valid.length) {
              throw new Error('Tidak ada kata game valid setelah validasi');
            }

            console.log('[GroqService] Game valid:', valid.length, '/', games.length);
            observer.next(valid);
            observer.complete();
          } catch (err) {
            console.error('[GroqService] Parse error (game):', err);
            observer.error(err);
          }
        },
        error: (err) => {
          console.error('[GroqService] HTTP error (game):', err.status, err.error);
          observer.error(err);
        }
      });
    });
  }

  // ─── Generate 3 kalimat ───────────────────────────────────────
  generateSentences(topic?: string): Observable<GeneratedSentence[]> {
    const topicText = topic?.trim() ? ` about "${topic.trim()}"` : '';
    const prompt =
`Generate 3 simple English sentences for beginners${topicText}.
Return ONLY this JSON array, nothing else:
[
  {
    "english": "English sentence",
    "indonesian": "Indonesian translation",
    "pronunciation": "/pronunciation/",
    "category": "Category name",
    "words": [{"word": "keyword", "meaning": "Indonesian meaning"}]
  }
]
Start response with [ immediately`;

    return new Observable(observer => {
      this.callGroq(prompt).subscribe({
        next: (res: any) => {
          try {
            const text = this.getTextFromResponse(res);
            console.log('[GroqService] Raw sentence response:', text.substring(0, 300));
            const sentences: GeneratedSentence[] = this.extractJsonArray(text);
            observer.next(sentences);
            observer.complete();
          } catch (err) {
            console.error('[GroqService] Parse error (sentence):', err);
            observer.error(err);
          }
        },
        error: (err) => {
          console.error('[GroqService] HTTP error (sentence):', err.status, err.error);
          observer.error(err);
        }
      });
    });
  }
}
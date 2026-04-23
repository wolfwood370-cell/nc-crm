

## Obiettivo
Aggiornare il modello AI usato dalla Edge Function `analyze-win-loss` per ottenere un ragionamento analitico di livello "Direttore Vendite", mantenendo invariata `generate-sales-copy`. Verificare che il loading state in `SalesCoach.tsx` usi skeleton eleganti coerenti con il resto dell'app.

## Modifiche

### 1. `supabase/functions/analyze-win-loss/index.ts`
- Sostituire `model: "google/gemini-3-flash-preview"` con `model: "google/gemini-2.5-pro"` (modello stabile di livello Pro, ottimale per pattern recognition su obiezioni).
- Nessun'altra modifica alla logica: prompt, tool calling strutturato, gestione errori 429/402 e CORS restano invariati.
- La function verrà ridistribuita automaticamente.

### 2. `supabase/functions/generate-sales-copy/index.ts`
- Nessuna modifica. Resta su `google/gemini-3-flash-preview` per latenza bassa sui follow-up WhatsApp.

### 3. `src/pages/SalesCoach.tsx`
- Verifica del loading state esistente durante l'invocazione di `analyze-win-loss`: se l'attuale UI mostra solo uno spinner o testo statico, sostituirlo con uno skeleton card stilizzato (3 righe shimmer per i bullet "Perché perdiamo" + 3 righe per "Azioni correttive" + 1 riga per la sintesi), usando il componente `<Skeleton>` da `@/components/ui/skeleton` già presente nel progetto e coerente con `AiFollowupGenerator.tsx`.
- Disabilitare il pulsante "Genera Report AI Settimanale" durante il caricamento con icona `Loader2` animata.
- Toast italiani su errore (`"Errore di connessione all'AI"`, `"Limite di richieste raggiunto"`, `"Crediti AI esauriti"`) gestiti via `sonner`.

## Scelta del modello
`google/gemini-2.5-pro` invece di `gemini-3.1-pro-preview` perché:
- È in versione stabile (non preview) → più affidabile per il go-to-market.
- Top-tier per ragionamento complesso su contesti testuali — ideale per analisi pattern obiezioni.
- Latenza accettabile (mitigata dallo skeleton).

Se in futuro si volesse spingere ulteriormente il ragionamento, basterà sostituire la stringa modello con `gemini-3.1-pro-preview` o `openai/gpt-5`.

## File toccati
- `supabase/functions/analyze-win-loss/index.ts` (1 riga)
- `src/pages/SalesCoach.tsx` (solo se loading state non già a livello skeleton)

## Localizzazione & Tema
- Tutti i testi UI in italiano.
- Light Theme preservato.
- Nessun nuovo tool, nessuna generazione immagini.


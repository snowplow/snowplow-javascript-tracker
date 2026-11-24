export interface BotSignalContextData {
  [key: string]: unknown;
  /** true when bot-signal judged the client not legitimate */
  bot: boolean;
  /** bot-signal suspicion score */
  score: number;
  /** automation kind reported by bot-signal, or null */
  kind: string | null;
  /** ids of the signals that fired */
  signals: string[];
}

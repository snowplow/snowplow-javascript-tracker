/**
 * Schema for a web page context
 */
export interface Gdpr {
  /**
   * GDPR basis for data collection & processing
   */
  basisForProcessing:
    | 'consent'
    | 'contract'
    | 'legal_obligation'
    | 'vital_interests'
    | 'public_task'
    | 'legitimate_interests';
  /**
   * ID for document detailing basis for processing
   */
  documentId?: string | null;
  /**
   * Version of document detailing basis for processing
   */
  documentVersion?: string | null;
  /**
   * Description of document detailing basis for processing
   */
  documentDescription?: string | null;
  [key: string]: unknown;
}

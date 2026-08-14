import { detectors } from '@fingerprintjs/botd';

type Detector = (typeof detectors)[keyof typeof detectors];

/**
 * BotD's default detectors, minus `detectPluginsLengthInconsistency`.
 *
 * This detector is considered spurious, see https://github.com/fingerprintjs/BotD/pull/194.
 *
 * TODO: remove once the PR is merged upstream.
 */
export const activeDetectors: Record<string, Detector> = { ...detectors };
delete activeDetectors.detectPluginsLengthInconsistency;

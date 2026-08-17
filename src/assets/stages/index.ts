/**
 * Manufacturing-stage media.
 *
 * The original GIFs (42.6 MB across ten files, 3-5 MB each) are still in this
 * directory as the masters, but nothing imports them — they are no longer
 * shipped. `scripts/transcode-stages.mjs` regenerates everything below from
 * them; re-run it if a stage animation is replaced.
 *
 * Delivered weight per format: MP4 6.0 MB, WebM 5.2 MB, posters 320 KB total.
 * A browser fetches one video format, and only for stages the visitor actually
 * scrolls to, so a typical visit costs a fraction of even those figures.
 */
import mp401 from "./video/stage-01-harvesting.mp4";
import mp402 from "./video/stage-02-washing.mp4";
import mp403 from "./video/stage-03-peeling.mp4";
import mp404 from "./video/stage-04-cutting.mp4";
import mp405 from "./video/stage-05-blanching.mp4";
import mp406 from "./video/stage-06-parfrying.mp4";
import mp407 from "./video/stage-07-deoiling.mp4";
import mp408 from "./video/stage-08-freezing.mp4";
import mp409 from "./video/stage-09-packaging.mp4";
import mp410 from "./video/stage-10-logistics.mp4";

import webm01 from "./video/stage-01-harvesting.webm";
import webm02 from "./video/stage-02-washing.webm";
import webm03 from "./video/stage-03-peeling.webm";
import webm04 from "./video/stage-04-cutting.webm";
import webm05 from "./video/stage-05-blanching.webm";
import webm06 from "./video/stage-06-parfrying.webm";
import webm07 from "./video/stage-07-deoiling.webm";
import webm08 from "./video/stage-08-freezing.webm";
import webm09 from "./video/stage-09-packaging.webm";
import webm10 from "./video/stage-10-logistics.webm";

import poster01 from "./video/stage-01-harvesting.webp";
import poster02 from "./video/stage-02-washing.webp";
import poster03 from "./video/stage-03-peeling.webp";
import poster04 from "./video/stage-04-cutting.webp";
import poster05 from "./video/stage-05-blanching.webp";
import poster06 from "./video/stage-06-parfrying.webp";
import poster07 from "./video/stage-07-deoiling.webp";
import poster08 from "./video/stage-08-freezing.webp";
import poster09 from "./video/stage-09-packaging.webp";
import poster10 from "./video/stage-10-logistics.webp";

export interface StageMedia {
  mp4: string;
  webm: string;
  poster: string;
}

export const stageMedia: StageMedia[] = [
  { mp4: mp401, webm: webm01, poster: poster01 },
  { mp4: mp402, webm: webm02, poster: poster02 },
  { mp4: mp403, webm: webm03, poster: poster03 },
  { mp4: mp404, webm: webm04, poster: poster04 },
  { mp4: mp405, webm: webm05, poster: poster05 },
  { mp4: mp406, webm: webm06, poster: poster06 },
  { mp4: mp407, webm: webm07, poster: poster07 },
  { mp4: mp408, webm: webm08, poster: poster08 },
  { mp4: mp409, webm: webm09, poster: poster09 },
  { mp4: mp410, webm: webm10, poster: poster10 },
];

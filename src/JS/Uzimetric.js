/**
 * Finger API is a wrapper class for Digital Persona's SDK.
 */
export class FingerApi {
  constructor(onCapture) {
    this.sdk = new window.Fingerprint.WebApi();
    this.sdk.onSamplesAcquired = (s) => {
      onCapture(s);
    };
  }
  startCapture(onStart) {
    this.sdk
      .startAcquisition(window.Fingerprint.SampleFormat.PngImage)
      .then(() => onStart())
      .catch((err) => console.log(err.message));
  }
  stopCapture() {
    this.sdk.stopAcquisition();
  }

  process(s) {
    let samples = JSON.parse(s.samples);
    let image = window.Fingerprint.b64UrlTo64(samples[0]);
    return image;
  }
}

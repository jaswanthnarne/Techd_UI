import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

const RecaptchaWrapper = ({ onVerify, onError }) => {
  const recaptchaRef = React.useRef();

  const handleRecaptchaChange = (token) => {
    console.log("reCAPTCHA token received:", token);
    if (token) {
      onVerify(token);
    } else {
      onError("reCAPTCHA verification failed");
    }
  };

  const handleRecaptchaError = (error) => {
    console.error("reCAPTCHA error:", error);
    onError("reCAPTCHA failed to load. Please refresh the page.");
  };

  const handleRecaptchaExpired = () => {
    console.log("reCAPTCHA expired");
    onError("reCAPTCHA expired. Please verify again.");
  };

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE}
        onChange={handleRecaptchaChange}
        onErrored={handleRecaptchaError}
        onExpired={handleRecaptchaExpired}
        theme="light"
        size="normal"
      />
    </div>
  );
};

export default RecaptchaWrapper;
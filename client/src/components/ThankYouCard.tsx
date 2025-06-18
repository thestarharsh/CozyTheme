import React from "react";

interface ThankYouCardProps {
  userName: string;
  onDownload: () => void;
  onClose: () => void;
}

export const ThankYouCard: React.FC<ThankYouCardProps> = ({ userName, onDownload, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        id="thank-you-card"
        className="relative bg-white rounded-2xl shadow-2xl p-2 sm:p-6 max-w-[95vw] w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-primary flex flex-col items-center"
        style={{ fontFamily: `'Dancing Script', cursive` }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-2 sm:mb-4"
        >
          <circle cx="30" cy="30" r="30" fill="#fbbf24" />
          <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="2rem" fill="#fff">❤️</text>
        </svg>
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2" style={{ fontFamily: 'inherit' }}>A Personal Note from Ankush</h2>
        <p className="text-sm sm:text-base text-neutral-700 mb-3 sm:mb-4 text-center leading-relaxed" style={{ fontFamily: 'inherit' }}>
          Dear {userName},<br />
          Thank you so much for choosing <span className="font-semibold">CozyGripz</span>.<br />
          I'm not a big business — I'm just a guy with a passion for design, working hard to bring beautiful and protective mobile covers to people like you. Every single order means the world to me. It's not just a sale — it's your trust, your support, and a vote of confidence in my dream.<br />
          When you shop from CozyGripz, you're not buying from a giant corporation — you're helping a small business grow, one cover at a time. You're helping me keep going, keep creating, and keep believing.<br />
          So from the bottom of my heart — thank you.<br />
          I hope you love your new cover as much as I loved creating it.<br /><br />
          With gratitude,<br />
          <span className="text-base sm:text-lg font-bold">Ankush</span><br />
          Founder, CozyGripz <span className="text-lg sm:text-xl">❤️</span>
        </p>
        <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-4 flex-wrap justify-center">
          <button
            onClick={onDownload}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary/90 transition text-sm sm:text-base"
          >
            Download & Share
          </button>
          <button
            onClick={onClose}
            className="bg-neutral-200 text-neutral-700 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouCard; 
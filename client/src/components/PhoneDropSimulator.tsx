import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, RotateCcw } from "lucide-react";

export default function PhoneDropSimulator() {
  const [isDropping, setIsDropping] = useState(false);
  const [hasCase, setHasCase] = useState(false);
  const [dropResult, setDropResult] = useState<"safe" | "damaged" | null>(null);
  const [dropCount, setDropCount] = useState(0);
  const [safeDrops, setSafeDrops] = useState(0);
  const [showCrack, setShowCrack] = useState(false);

  const handleDrop = () => {
    setIsDropping(true);
    setDropResult(null);
    setShowCrack(false);

    // Simulate drop animation
    setTimeout(() => {
      const survived = hasCase;
      setDropResult(survived ? "safe" : "damaged");
      if (!survived) {
        setShowCrack(true);
      }
      setDropCount(prev => prev + 1);
      if (survived) {
        setSafeDrops(prev => prev + 1);
      }
      setIsDropping(false);
    }, 1000);
  };

  const resetSimulator = () => {
    setDropCount(0);
    setSafeDrops(0);
    setDropResult(null);
    setShowCrack(false);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Phone Drop Simulator</h3>
          <p className="text-sm text-neutral-600">
            Test how well our cases protect your phone!
          </p>
        </div>

        {/* Phone Display */}
        <div className="relative h-64 mb-6 flex items-center justify-center">
          <div 
            className={`
              relative w-24 h-48 bg-neutral-800 rounded-[2rem] border-4 
              transition-all duration-1000 ease-in-out
              ${isDropping ? 'translate-y-32 rotate-12' : 'translate-y-0 rotate-0'}
              ${hasCase ? 'border-primary' : 'border-neutral-600'}
              ${dropResult === 'damaged' ? 'opacity-90' : 'opacity-100'}
            `}
          >
            {/* Screen */}
            <div className="absolute inset-1 bg-neutral-900 rounded-[1.5rem] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-b from-blue-500/20 to-purple-500/20" />
              
              {/* Crack Effect */}
              {showCrack && (
                <div className="absolute inset-0 animate-crack">
                  {/* Main crack */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/2 w-[2px] h-1/2 bg-white/30 transform -rotate-45 origin-top" />
                    <div className="absolute top-1/3 left-1/3 w-[1px] h-1/3 bg-white/30 transform rotate-12" />
                    <div className="absolute top-1/2 right-1/3 w-[1px] h-1/4 bg-white/30 transform -rotate-12" />
                  </div>
                  
                  {/* Spider web cracks */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/2 w-[1px] h-1/4 bg-white/20 transform rotate-45" />
                    <div className="absolute top-1/3 right-1/3 w-[1px] h-1/3 bg-white/20 transform -rotate-30" />
                    <div className="absolute bottom-1/4 left-1/3 w-[1px] h-1/4 bg-white/20 transform rotate-60" />
                  </div>
                  
                  {/* Shards */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white/40 transform rotate-45" />
                    <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white/40 transform -rotate-45" />
                    <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/40 transform rotate-30" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 bg-neutral-800 rounded-b-xl" />
            
            {/* Case (when enabled) */}
            {hasCase && (
              <div className="absolute -inset-1 bg-primary/20 rounded-[2.5rem] border-2 border-primary" />
            )}
          </div>

          {/* Drop Result Message */}
          {dropResult && (
            <div 
              className={`
                absolute bottom-0 
                text-lg font-bold text-center
                ${dropResult === 'safe' ? 'text-green-500' : 'text-red-500'}
                animate-bounce
              `}
            >
              {dropResult === 'safe' ? '🛡️ Protected!' : '💥 Damaged!'}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={hasCase ? "default" : "outline"}
              onClick={() => setHasCase(!hasCase)}
              className="w-32"
            >
              <Shield className="w-4 h-4 mr-2" />
              {hasCase ? "Remove Case" : "Add Case"}
            </Button>
            <Button
              onClick={handleDrop}
              disabled={isDropping}
              className="w-32"
            >
              Drop Phone
            </Button>
          </div>

          {/* Stats */}
          <div className="text-center space-y-2">
            <div className="text-sm text-neutral-600">
              Drops: {dropCount} | Safe: {safeDrops} | 
              Success Rate: {dropCount > 0 ? Math.round((safeDrops / dropCount) * 100) : 0}%
            </div>
            {dropCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSimulator}
                className="text-neutral-600 hover:text-neutral-900"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Stats
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
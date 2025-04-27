import { PanInfo, motion, useAnimation } from "framer-motion";
import { useState, forwardRef, useImperativeHandle, Dispatch, SetStateAction, useCallback } from "react";
import { CardProps, SwipeType } from "types";

interface ExtendedCardProps extends CardProps {
  setIsProcessingSwipe?: Dispatch<SetStateAction<boolean>>;
}

const Card = forwardRef<any, ExtendedCardProps>(({ card, removeCard, active, setIsProcessingSwipe }, ref) => {
  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<SwipeType | null>(null);
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  // Unified swipe function for both button and manual swipes
  const performSwipe = useCallback((swipeType: SwipeType, x: number, y: number, rotate: number) => {
    // Prevent multiple swipe actions
    if (isAnimating) return Promise.resolve();
    
    console.log(`Card ${card.id}: Performing ${swipeType} swipe`);
    setIsAnimating(true);
    setIsProcessingSwipe?.(true);
    setSwipeDirection(swipeType);
    setLeaveX(x);
    setLeaveY(y);
    setRotation(rotate);
    
    return controls.start({
      x: x,
      y: y,
      rotate: rotate,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.4, ease: "easeOut" }
    }).then(() => {
      console.log(`Card ${card.id}: Animation complete, removing card`);
      setIsAnimating(false);
      removeCard(card, swipeType);
      return Promise.resolve();
    }).catch((error) => {
      console.error(`Card ${card.id}: Animation error:`, error);
      setIsAnimating(false);
      setIsProcessingSwipe?.(false);
      return Promise.reject(error);
    });
  }, [card, controls, removeCard, setIsProcessingSwipe, isAnimating]);

  // Make handleManualSwipe available to parent component
  useImperativeHandle(ref, () => ({
    handleManualSwipe: (swipeType: SwipeType) => {
      console.log(`Card ${card.id}: Button swipe triggered for ${swipeType}`);
      
      if (swipeType === "like") {
        return performSwipe("like", 1000, 0, 20);
      } else if (swipeType === "nope") {
        return performSwipe("nope", -1000, 0, -20);
      } else if (swipeType === "superlike") {
        return performSwipe("superlike", 0, -2000, 0);
      }
      
      console.warn(`Card ${card.id}: Invalid swipe type: ${swipeType}`);
      setIsProcessingSwipe?.(false);
      return Promise.resolve();
    }
  }), [card.id, performSwipe]);

  const onDrag = (_e: any, info: PanInfo) => {
    // Don't update during animation
    if (isAnimating) return;
    
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;
    
    // Update rotation based on drag position
    setRotation(xOffset * 0.1);
    
    // Update swipe direction indicator
    if (yOffset < -50) {
      setSwipeDirection("superlike");
    } else if (xOffset > 50) {
      setSwipeDirection("like");
    } else if (xOffset < -50) {
      setSwipeDirection("nope");
    } else {
      setSwipeDirection(null);
    }
  };

  const onDragEnd = (_e: any, info: PanInfo) => {
    // Don't process multiple swipes
    if (isAnimating) return;
    
    console.log(`Card ${card.id}: Drag ended, analyzing direction`);
    
    try {
      // Handle superlike (up swipe)
      if (info.offset.y < -100) {
        console.log(`Card ${card.id}: Manual up swipe detected, performing superlike`);
        performSwipe("superlike", 0, -2000, 0);
        return;
      }
      
      // Handle like (right swipe)
      if (info.offset.x > 100) {
        console.log(`Card ${card.id}: Manual right swipe detected, performing like`);
        performSwipe("like", 1000, 0, 20);
        return;
      }
      
      // Handle nope (left swipe)
      if (info.offset.x < -100) {
        console.log(`Card ${card.id}: Manual left swipe detected, performing nope`);
        performSwipe("nope", -1000, 0, -20);
        return;
      }
      
      // Return to center if no swipe happened
      console.log(`Card ${card.id}: No significant swipe detected, returning to center`);
      controls.start({ x: 0, y: 0, rotate: 0 });
      setIsProcessingSwipe?.(false);
      setSwipeDirection(null);
    } catch (error) {
      console.error(`Card ${card.id}: Error during manual swipe:`, error);
      setIsAnimating(false);
      setIsProcessingSwipe?.(false);
    }
  };
  
  if (!active) {
    return null;
  }
  
  return (
    <motion.div
      drag={!isAnimating}
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.7}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.95, opacity: 0.8 }}
      animate={controls}
      style={{ rotate: rotation }}
      exit={{
        x: leaveX,
        y: leaveY,
        opacity: 0,
        scale: 0.5,
        rotate: leaveX > 0 ? 20 : (leaveX < 0 ? -20 : 0),
        transition: { duration: 0.4, ease: "easeOut" },
      }}
      className="absolute h-[680px] w-[400px] bg-white shadow-xl rounded-3xl flex flex-col cursor-grab overflow-hidden"
      data-testid="active-card"
      whileDrag={{ scale: 1.05 }}
    >
      <BeerCard card={card} swipeDirection={swipeDirection} />
    </motion.div>
  );
});

Card.displayName = "Card";

const BeerCard: React.FC<{ card: any, swipeDirection: SwipeType | null }> = ({ card, swipeDirection }) => {
  // Ensure description text is capped to a reasonable length
  const truncateDescription = (text: string, maxLength = 140) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Image container with clean, white background */}
      <div className="relative w-full h-[380px] bg-white">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={card.image} 
            alt={card.name} 
            className="w-full h-full object-contain" 
          />
        </div>
        
        {/* ABV tag - moved from bottom to top */}
        <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 font-medium text-gray-700 shadow-md z-10">
          ABV: {card.abv}
        </div>
        
        {/* Swipe indicator */}
        {swipeDirection && (
          <div className={`absolute z-20 ${getSwipeIndicatorPosition(swipeDirection)} ${getSwipeIndicatorColor(swipeDirection)} rounded-lg px-4 py-2 font-bold text-white rotate-${getSwipeIndicatorRotation(swipeDirection)} border-2 border-white shadow-lg text-2xl`}>
            {getSwipeLabel(swipeDirection)}
          </div>
        )}
      </div>
      
      {/* Content container - flex grow to fill remaining space */}
      <div className="flex flex-col flex-grow p-6 bg-white">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2 line-clamp-1">{card.name}</h2>
        
        {/* Description - fixed height with ellipsis for overflow */}
        <div className="h-[120px] overflow-hidden mb-4">
          <p className="text-base text-gray-600 leading-relaxed">
            {truncateDescription(card.description)}
          </p>
        </div>
        
        {/* Price - moved from top to bottom, made larger */}
        <div className="mt-auto flex justify-between items-center">
          <div className="text-[#F8B64C] bg-white border-2 border-[#F8B64C] px-5 py-2 rounded-full font-bold text-base">
            ${card.price.toFixed(2)}
          </div>
          <div className="text-gray-700 flex items-center bg-gray-100 px-4 py-2 rounded-full">
            <span className="text-yellow-500 mr-2 text-lg">★</span>
            <span className="font-medium text-sm">{card.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function getSwipeIndicatorPosition(direction: SwipeType): string {
  switch (direction) {
    case "like":
      return "top-10 right-10";
    case "nope":
      return "top-10 left-10";
    case "superlike":
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

function getSwipeIndicatorColor(direction: SwipeType): string {
  switch (direction) {
    case "like":
      return "bg-green-500";
    case "nope":
      return "bg-red-500";
    case "superlike":
      return "bg-blue-500";
  }
}

function getSwipeIndicatorRotation(direction: SwipeType): string {
  switch (direction) {
    case "like":
      return "12";
    case "nope":
      return "-12";
    case "superlike":
      return "0";
  }
}

function getSwipeLabel(direction: SwipeType): string {
  switch (direction) {
    case "like":
      return "LIKE";
    case "nope":
      return "NOPE";
    case "superlike":
      return "SUPER";
  }
}

/**
 * a11y friendly component for emojis
 * @reference https://devyarns.com/accessible-emojis
 */
const Emoji: React.FC<{ emoji: string; label: string }> = ({
  emoji,
  label,
}) => {
  return (
    <span role="img" aria-label={label} className="text-[140px]">
      {emoji}
    </span>
  );
};

const Title: React.FC<{ title: string; color: string }> = ({
  title,
  color,
}) => {
  return (
    <span style={{ color }} className="text-5xl font-bold">
      {title}
    </span>
  );
};

export default Card;

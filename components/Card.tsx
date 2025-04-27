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

  // Wrap the swipe function to ensure consistent behavior
  const performSwipe = useCallback((swipeType: SwipeType, x: number, y: number, rotate: number) => {
    console.log(`Card ${card.id}: Performing ${swipeType} swipe`);
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
      removeCard(card, swipeType);
      return Promise.resolve();
    }).catch((error) => {
      console.error(`Card ${card.id}: Animation error:`, error);
      setIsProcessingSwipe?.(false);
      return Promise.reject(error);
    });
  }, [card, controls, removeCard, setIsProcessingSwipe]);

  // Make sure the handleManualSwipe function is properly defined
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
  }), [card.id, performSwipe, setIsProcessingSwipe]);

  const onDrag = (_e: any, info: PanInfo) => {
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
    console.log(`Card ${card.id}: Drag ended, analyzing direction`);
    // Always notify parent about swipe processing
    setIsProcessingSwipe?.(true);
    
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
      setIsProcessingSwipe?.(false);
    }
  };
  
  if (!active) {
    return null;
  }
  
  return (
    <motion.div
      drag={true}
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.7}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.95, opacity: 0.8 }}
      animate={{
        scale: 1,
        opacity: 1, 
        x: 0, 
        y: 0, 
        rotate: 0,
        transition: { duration: 0.3 }
      }}
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
  return (
    <>
      <div className="relative w-full h-[480px]">
        <img 
          src={card.image} 
          alt={card.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 text-[#F8B64C] font-bold shadow-md">
          ${card.price.toFixed(2)}
        </div>
        
        {swipeDirection && (
          <div className={`absolute ${getSwipeIndicatorPosition(swipeDirection)} ${getSwipeIndicatorColor(swipeDirection)} rounded-lg px-4 py-2 font-bold text-white rotate-${getSwipeIndicatorRotation(swipeDirection)} border-2 border-white shadow-lg text-2xl`}>
            {getSwipeLabel(swipeDirection)}
          </div>
        )}
      </div>
      <div className="p-8 flex flex-col flex-grow bg-white">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">{card.name}</h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">{card.description}</p>
        <div className="mt-auto flex justify-between items-center">
          <div className="text-gray-700 bg-gray-100 px-4 py-2 rounded-full font-medium text-base">ABV: {card.abv}</div>
          <div className="text-gray-700 flex items-center bg-gray-100 px-4 py-2 rounded-full">
            <span className="text-yellow-500 mr-2 text-lg">★</span>
            <span className="font-medium">{card.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </>
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

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import { CardType, HistoryType, ResultType, SwipeType } from "types";
import CARDS from "@data/cards";
import Card from "@components/Card";
import Head from "next/head";

const Home: NextPage = () => {
  const [cards, setCards] = useState(CARDS);
  const [result, setResult] = useState<ResultType>({
    like: 0,
    nope: 0,
    superlike: 0,
  });
  const [history, setHistory] = useState<HistoryType[]>([]);
  const activeIndex = cards.length - 1;
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);

  // Single active card ref
  const activeCardRef = useRef<any>(null);

  // Debug the processing state
  useEffect(() => {
    console.log("Processing state changed:", isProcessingSwipe);
  }, [isProcessingSwipe]);

  // Safety timeout to prevent stuck state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isProcessingSwipe) {
      timeoutId = setTimeout(() => {
        console.log("Force resetting processing state after timeout");
        setIsProcessingSwipe(false);
      }, 2000); // 2 second safety timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isProcessingSwipe]);

  // This useEffect ensures the state is properly reset when cards change
  useEffect(() => {
    // Reset swipe processing state when active card changes
    if (cards.length > 0) {
      console.log("Active card changed, ensuring processing state is reset");
      setTimeout(() => {
        setIsProcessingSwipe(false);
      }, 100);
    }
  }, [cards.length]);

  const removeCard = (oldCard: CardType, swipe: SwipeType) => {
    console.log("Removing card:", oldCard.id, "with swipe type:", swipe);
    
    // First update the history and result
    setHistory(current => [...current, { ...oldCard, swipe }]);
    setResult(current => ({ ...current, [swipe]: current[swipe] + 1 }));
    
    // Then remove the card from the stack
    setCards(current => current.filter(card => card.id !== oldCard.id));
  };
  
  const handleSwipe = (swipeType: SwipeType) => {
    if (cards.length === 0) {
      console.log("No cards to swipe");
      return;
    }
    
    if (isProcessingSwipe) {
      console.log("Already processing a swipe, skipping button action");
      return;
    }
    
    console.log("Button swipe triggered:", swipeType);
    console.log("Active card ref exists:", !!activeCardRef.current);
    
    if (!activeCardRef.current) {
      console.warn("No active card ref found");
      return;
    }
    
    if (typeof activeCardRef.current.handleManualSwipe !== 'function') {
      console.warn("Missing handleManualSwipe method on card ref");
      return;
    }
    
    // Set processing state and trigger the swipe
    setIsProcessingSwipe(true);
    
    try {
      activeCardRef.current.handleManualSwipe(swipeType)
        .catch((error: any) => {
          console.error("Button swipe error:", error);
          setIsProcessingSwipe(false);
        });
    } catch (error) {
      console.error("Error triggering button swipe:", error);
      setIsProcessingSwipe(false);
    }
  };

  const undoSwipe = () => {
    if (isProcessingSwipe || history.length === 0) {
      return;
    }
    
    const newCard = history[history.length - 1];
    
    if (newCard) {
      const { swipe } = newCard;
      
      // Update history first
      setHistory((current) => current.filter((card) => card.id !== newCard.id));
      
      // Update the result counter
      setResult((current) => ({ ...current, [swipe]: current[swipe] - 1 }));
      
      // Add the card back to the stack
      setCards((current) => [...current, newCard]);
    }
  };
  
  const resetDeck = () => {
    setCards(CARDS);
    setHistory([]);
    setResult({ like: 0, nope: 0, superlike: 0 });
    setIsProcessingSwipe(false);
  };
  
  return (
    <div className="relative flex flex-col justify-center items-center w-full h-screen gradient">
      <Head>
        <title>Whimsical - Beer Selection</title>
      </Head>
      
      <div className="absolute top-8 flex items-center">
        <span className="text-[#F8B64C] text-3xl mr-2">🍺</span>
        <h1 className="text-3xl font-bold text-[#333]">Whimsical</h1>
      </div>
      
      <div className="relative w-[400px] h-[680px]">
        <AnimatePresence>
          {cards.map((card, index) => (
            <Card
              key={card.id}
              active={index === activeIndex}
              removeCard={removeCard}
              card={card}
              ref={index === activeIndex ? activeCardRef : null}
              setIsProcessingSwipe={setIsProcessingSwipe}
            />
          ))}
        </AnimatePresence>
        
        {/* Empty state - now inside the card container for proper centering */}
        {cards.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl">
            <span className="text-gray-600 text-2xl mb-6">End of Stack</span>
            <button 
              onClick={resetDeck}
              className="bg-[#F8B64C] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#E7A43C] transition-colors"
            >
              Restart
            </button>
          </div>
        )}
      </div>
      
      <footer className="absolute bottom-10 flex items-center justify-center w-full space-x-6">
        {cards.length > 0 && (
          <>
            <button
              className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-500 text-red-500 transition-transform hover:scale-110 ${isProcessingSwipe ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'}`}
              onClick={() => handleSwipe("nope")}
              disabled={isProcessingSwipe}
              aria-label="Dislike"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <button
              className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500 text-blue-500 transition-transform hover:scale-110 ${isProcessingSwipe ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
              onClick={() => handleSwipe("superlike")}
              disabled={isProcessingSwipe}
              aria-label="Superlike"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            
            <button
              className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-500 text-green-500 transition-transform hover:scale-110 ${isProcessingSwipe ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50'}`}
              onClick={() => handleSwipe("like")}
              disabled={isProcessingSwipe}
              aria-label="Like"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </>
        )}
      </footer>
      
      {history.length > 0 && (
        <button
          className={`absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center text-gray-600 transition-transform hover:scale-110 ${isProcessingSwipe ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          onClick={undoSwipe}
          disabled={isProcessingSwipe}
          aria-label="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h12a6 6 0 0 1 0 12H7"></path>
            <path d="M7 8 3 12l4 4"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Home;

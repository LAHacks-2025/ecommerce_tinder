import CARDS from "data/cards";
import { Dispatch, SetStateAction } from "react";

type ArrayElementType<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type CardType = ArrayElementType<typeof CARDS>;

export type SwipeType = "like" | "nope" | "superlike";

export type ResultType = { [k in SwipeType]: number };

export type HistoryType = CardType & { swipe: SwipeType };

export interface CardProps {
  card: CardType;
  active: boolean;
  removeCard: (oldCard: CardType, swipe: SwipeType) => void;
  setIsProcessingSwipe?: Dispatch<SetStateAction<boolean>>;
}

export interface BeerCardType {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  abv: string;
  rating: number;
}

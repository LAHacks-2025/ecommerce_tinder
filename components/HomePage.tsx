import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faSearch, faArrowRight, faTags, faHeart, faShippingFast } from '@fortawesome/free-solid-svg-icons';

interface HomePageProps {
  onStartBrowsing: () => void;
  onSearch: (category: string) => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f9f9f9 0%, #e4e8ec 100%);
  position: relative;
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 10px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  z-index: 2;
  height: 100%;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 16px 4px;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.8s ease-out;
  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`;

const Logo = styled.div`
  font-size: 36px;
  color: #F8B64C;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const Title = styled.h1`
  font-size: 48px;
  color: #333;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto 30px;
  line-height: 1.6;
`;

const SearchSection = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 60px;
  animation: ${fadeIn} 0.8s ease-out;
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;
`;

const SearchTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const SearchForm = styled.form`
  display: flex;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  
  &:focus-within {
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 18px 24px;
  border: none;
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: #aaa;
  }
`;

const SearchButton = styled.button`
  background: #F8B64C;
  color: white;
  border: none;
  font-size: 16px;
  padding: 0 30px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #E7A43C;
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  animation: ${fadeIn} 0.8s ease-out;
  animation-delay: 0.4s;
  opacity: 0;
  animation-fill-mode: forwards;
  @media (max-width: 600px) {
    gap: 10px;
  }
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div`
  font-size: 32px;
  color: #F8B64C;
  background: #fff9ec;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  font-size: 15px;
  color: #666;
  line-height: 1.6;
`;

const StartButton = styled.button`
  background: #F8B64C;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  padding: 12px 24px;
  margin-top: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${fadeIn} 0.8s ease-out;
  animation-delay: 0.6s;
  opacity: 0;
  animation-fill-mode: forwards;
  box-shadow: 0 8px 25px rgba(248, 182, 76, 0.4);
  @media (max-width: 600px) {
    margin-top: 16px;
    font-size: 16px;
    padding: 10px 16px;
  }
`;

const BackgroundDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
`;

const Circle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(248, 182, 76, 0.1) 0%, rgba(231, 164, 60, 0.05) 100%);
  
  &:nth-child(1) {
    width: 400px;
    height: 400px;
    top: -200px;
    right: -100px;
  }
  
  &:nth-child(2) {
    width: 300px;
    height: 300px;
    bottom: -150px;
    left: -100px;
  }
  
  &:nth-child(3) {
    width: 200px;
    height: 200px;
    top: 50%;
    left: 10%;
  }
`;

const HomePage: React.FC<HomePageProps> = ({ onStartBrowsing, onSearch }) => {
  const [searchInput, setSearchInput] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };
  
  return (
    <Container>
      <BackgroundDecoration>
        <Circle />
        <Circle />
        <Circle />
      </BackgroundDecoration>
      
      <ContentWrapper>
        <HeroSection>
          <Logo>
            <FontAwesomeIcon icon={faShoppingBag} size="lg" />
            <span style={{ fontWeight: 600 }}>Whimsical</span>
          </Logo>
          <Title>Discover Your Style — One Swipe at a Time</Title>
          <Subtitle>
            Find your next favorite product with a simple swipe. Our intuitive shopping experience 
            makes discovering new items fun and effortless. No more endless scrolling!
          </Subtitle>
        </HeroSection>
        
        <SearchSection>
          <SearchTitle>What are you looking for today?</SearchTitle>
          <SearchForm onSubmit={handleSubmit}>
            <SearchInput
              type="text"
              placeholder="Try 'Shoes', 'Watches', 'Clothing', 'Accessories'..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <SearchButton type="submit">
              Search <FontAwesomeIcon icon={faSearch} />
            </SearchButton>
          </SearchForm>
        </SearchSection>
        
        <FeaturesSection>
          <FeatureCard>
            <FeatureIcon>
              <FontAwesomeIcon icon={faShoppingBag} />
            </FeatureIcon>
            <FeatureTitle>Personalized Discovery</FeatureTitle>
            <FeatureDescription>
              Swipe through our curated selection of products tailored to your style preferences and discover items you&apos;ll love.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <FontAwesomeIcon icon={faTags} />
            </FeatureIcon>
            <FeatureTitle>Effortless Shopping</FeatureTitle>
            <FeatureDescription>
              Quick, intuitive interaction lets you browse more products in less time. Just swipe right on items you like!
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <FontAwesomeIcon icon={faHeart} />
            </FeatureIcon>
            <FeatureTitle>Save Your Favorites</FeatureTitle>
            <FeatureDescription>
              Build your collection of liked items to revisit later, making it easy to keep track of products you&apos;re interested in.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesSection>
        
        <StartButton onClick={onStartBrowsing}>
          Start Swiping <FontAwesomeIcon icon={faArrowRight} />
        </StartButton>
      </ContentWrapper>
    </Container>
  );
};

export default HomePage; 
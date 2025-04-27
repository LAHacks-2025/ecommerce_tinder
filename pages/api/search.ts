import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  data?: any;
  error?: string;
}

// Helper function to transform API data to match the Card component's expected format
function transformData(originalData: any): any[] {
  // Handle the specific format from the example response
  if (originalData && 
      typeof originalData === 'object' && 
      originalData.status === 'success' && 
      Array.isArray(originalData.data)) {
    return originalData.data.map((item: any, index: number) => transformItem(item, index));
  }
  
  // If it's already an array, try to transform each item
  if (Array.isArray(originalData)) {
    return originalData.map((item, index) => transformItem(item, index));
  }
  
  // Check if data has a results or products array
  if (originalData && typeof originalData === 'object') {
    if (Array.isArray(originalData.results)) {
      return originalData.results.map((item: any, index: number) => transformItem(item, index));
    }
    if (Array.isArray(originalData.products)) {
      return originalData.products.map((item: any, index: number) => transformItem(item, index));
    }
  }
  
  // If we can't find a usable array, return an empty array
  console.warn("Could not find usable data structure in API response");
  return [];
}

// Transform individual item to match the Card component's expected format
function transformItem(item: any, index: number): any {
  // Create a base object with required fields
  const transformedItem = {
    id: item.id || `item-${index}`,
    name: item.name || item.title || 'Product',
    description: item.description || 'No description available',
    // Extract the first image from the images array if it exists
    image: item.images && item.images.length > 0 
      ? item.images[0] 
      : (item.image || item.imageUrl || item.image_url || item.img || 'https://via.placeholder.com/400'),
    price: typeof item.price === 'number' 
      ? `$${item.price.toFixed(2)}` 
      : (item.price || '$0.00'),
    // Calculate average rating from reviews if available
    rating: item.reviews && Array.isArray(item.reviews) && item.reviews.length > 0
      ? item.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / item.reviews.length
      : (item.rating || 0),
    // Additional fields that might be needed by the Card component
    category: item.category || 'Uncategorized',
    // Add reviews count if available
    reviewsCount: item.reviews && Array.isArray(item.reviews) ? item.reviews.length : 0,
    // Add attributes if available
    attributes: item.attributes || {},
    // Preserve any other original fields
    ...item
  };
  
  return transformedItem;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Support both POST and GET methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query from either POST body or GET query parameter
    let query: string;
    
    if (req.method === 'POST') {
      query = req.body.query;
    } else {
      // For GET requests
      query = Array.isArray(req.query.query) 
        ? req.query.query[0] 
        : (req.query.query as string);
    }

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Proxy API making ${req.method} request with query:`, query);

    // First try POST method to the external API
    try {
      const response = await fetch('https://612d-164-67-70-232.ngrok-free.app/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query
        }),
      });

      if (response.ok) {
        const originalData = await response.json();
        console.log('Proxy API received data from POST:', JSON.stringify(originalData).substring(0, 200) + '...');
        
        // Log the structure of the response to help with debugging
        console.log('Response structure:', {
          type: typeof originalData,
          isArray: Array.isArray(originalData),
          keys: originalData && typeof originalData === 'object' ? Object.keys(originalData) : 'N/A',
          hasStatus: originalData && typeof originalData === 'object' && 'status' in originalData,
          hasData: originalData && typeof originalData === 'object' && 'data' in originalData,
          dataType: originalData && typeof originalData === 'object' && 'data' in originalData ? 
            (Array.isArray(originalData.data) ? 'array' : typeof originalData.data) : 'N/A',
          dataLength: originalData && typeof originalData === 'object' && 'data' in originalData && 
            Array.isArray(originalData.data) ? originalData.data.length : 'N/A'
        });
        
        // Transform the data to match the expected format
        const transformedData = transformData(originalData);
        console.log(`Transformed ${transformedData.length} items`);
        
        // Return the transformed data to the client
        return res.status(200).json({ data: transformedData });
      } else {
        console.log(`POST attempt failed with status ${response.status}, trying GET...`);
      }
    } catch (postError) {
      console.log('POST request failed, falling back to GET:', postError);
    }

    // If POST failed, try GET method as fallback
    const encodedQuery = encodeURIComponent(query);
    const getResponse = await fetch(`https://612d-164-67-70-232.ngrok-free.app/query?query=${encodedQuery}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!getResponse.ok) {
      console.error('External API error (both POST and GET failed):', getResponse.status);
      return res.status(getResponse.status).json({ 
        error: `External API error: ${getResponse.status} ${getResponse.statusText}` 
      });
    }

    const getOriginalData = await getResponse.json();
    console.log('Proxy API received data from GET:', JSON.stringify(getOriginalData).substring(0, 200) + '...');
    
    // Log the structure of the response to help with debugging
    console.log('GET response structure:', {
      type: typeof getOriginalData,
      isArray: Array.isArray(getOriginalData),
      keys: getOriginalData && typeof getOriginalData === 'object' ? Object.keys(getOriginalData) : 'N/A',
      hasStatus: getOriginalData && typeof getOriginalData === 'object' && 'status' in getOriginalData,
      hasData: getOriginalData && typeof getOriginalData === 'object' && 'data' in getOriginalData,
      dataType: getOriginalData && typeof getOriginalData === 'object' && 'data' in getOriginalData ? 
        (Array.isArray(getOriginalData.data) ? 'array' : typeof getOriginalData.data) : 'N/A',
      dataLength: getOriginalData && typeof getOriginalData === 'object' && 'data' in getOriginalData && 
        Array.isArray(getOriginalData.data) ? getOriginalData.data.length : 'N/A'
    });

    // Transform the data to match the expected format
    const transformedGetData = transformData(getOriginalData);
    console.log(`Transformed ${transformedGetData.length} items from GET response`);
    
    // Return the transformed data to the client
    return res.status(200).json({ data: transformedGetData });
  } catch (error) {
    console.error('Server error in proxy API:', error);
    return res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
} 
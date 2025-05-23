


export const generateJobTitleFromPitch = (pitch) => {
    if (!pitch || typeof pitch !== 'string') return 'No title available';
  
    const words = pitch.trim().split(/\s+/);
    const firstFourWords = words.slice(0, 4).join(' ');
    return firstFourWords + '...';
  };
  
  
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chat from '../screens/Chat';

jest.mock('expo-av', () => {
    return {
      Audio: {
        requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
        setAudioModeAsync: jest.fn(),
        Recording: {
          createAsync: jest.fn(() => Promise.resolve({ recording: { stopAndUnloadAsync: jest.fn() } })),
        }
      }
    };
});

describe('Chat Screen', () => {
    it('starts recording when microphone button is pressed', async () => {
      const { getByTestId } = render(<Chat />);
      const micButton = getByTestId('microphone-button');
      fireEvent.press(micButton);
  
      await waitFor(() => {
        expect(Audio.Recording.createAsync).toHaveBeenCalled();
      });
    });
});